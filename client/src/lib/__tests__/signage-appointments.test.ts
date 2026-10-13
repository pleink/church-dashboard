import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appointmentKey, groupAppointments } from '../signage-appointments';
import { getMaxEventsDisplay } from '../../../../shared/signage-settings';

const now = new Date(2026, 6, 5, 9, 36);
const appointment = (day: number, id = 1, calendarId = 2) => ({
    id, churchToolsId: id, calendarId,
    startDateTime: new Date(2026, 6, day, 14).toISOString(),
    date: `July ${day}`, startTime: '14:00', endTime: '16:30',
    title: 'Externe Vermietung', resource: 'Bistro',
});

test('deduplicates endpoint overlap and repeated upstream rows', () => {
    const today = appointment(5);
    const future = appointment(6);
    const result = groupAppointments([today], [today, future, { ...future }], now);
    assert.deepEqual(result.today, [today]);
    assert.deepEqual(result.upcoming, [future]);
});

test('recurring occurrences and distinct appointments retain unique keys', () => {
    const rows = [appointment(6), appointment(13), appointment(6, 2), appointment(6, 1, 3)];
    assert.equal(new Set(rows.map(appointmentKey)).size, 4);
    assert.equal(groupAppointments([], rows, now).upcoming.length, 4);
});

test('rejects stale past dates and invalid dates without dropping earlier events today', () => {
    const earlierToday = { ...appointment(5), startDateTime: new Date(2026, 6, 5, 8).toISOString() };
    const rows = [appointment(4), earlierToday, { ...appointment(6), startDateTime: 'invalid' }];
    assert.deepEqual(groupAppointments([], rows, now), { today: [earlierToday], upcoming: [] });
});

test('caps the combined display at six unique rows after deduplication', () => {
    const today = Array.from({ length: 8 }, (_, i) => appointment(5, i + 1));
    const result = groupAppointments(today, [...today, appointment(6)], now, 6);
    assert.equal(result.today.length, 6);
    assert.equal(result.upcoming.length, 0);
});

test('defaults to eight appointments and shares a configured limit across both sections', () => {
    const rows = Array.from({ length: 12 }, (_, i) => appointment(6, i + 1));
    assert.equal(groupAppointments([], rows, now).upcoming.length, 8);
    const result = groupAppointments([appointment(5)], rows, now, 3);
    assert.equal(result.today.length, 1);
    assert.equal(result.upcoming.length, 2);
});

test('invalid display limits fall back to eight', () => {
    for (const value of [undefined, null, 0, -1, 2.5, '3', Infinity]) {
        assert.equal(getMaxEventsDisplay(value), 8);
    }
    assert.equal(getMaxEventsDisplay(3), 3);
});

test('equivalent timestamp offsets identify the same occurrence', () => {
    const first = { ...appointment(6), startDateTime: '2026-07-06T14:00:00+02:00' };
    const second = { ...first, startDateTime: '2026-07-06T12:00:00Z' };
    assert.equal(appointmentKey(first), appointmentKey(second));
    assert.equal(groupAppointments([], [first, second], now).upcoming.length, 1);
});
