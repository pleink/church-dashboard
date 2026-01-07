# ChurchDashboard API Notes

## Quick API probes (using `.env` token)

```bash
# Load env
source .env

# List calendars
curl -H "Authorization: Login $CHURCHTOOLS_API_TOKEN" \
  "$CHURCHTOOLS_API_BASE/calendars"

# Next 7 days across configured calendars (update ids as needed)
FROM=$(date -u +"%Y-%m-%d")
TO=$(date -u -d "$FROM +6 days" +"%Y-%m-%d")

curl -H "Authorization: Login $CHURCHTOOLS_API_TOKEN" \
  "$CHURCHTOOLS_API_BASE/calendars/appointments?from=$FROM&to=$TO&calendar_ids[]=2&calendar_ids[]=28&calendar_ids[]=22&calendar_ids[]=25&calendar_ids[]=43&calendar_ids[]=61&calendar_ids[]=58&calendar_ids[]=54&calendar_ids[]=63&calendar_ids[]=55&calendar_ids[]=49&calendar_ids[]=42&calendar_ids[]=35&include[]=event&include[]=group&include[]=bookings"
```

## Config-driven calendar mapping
- `config.json` controls which calendars are used and how they are displayed:
  - `calendars.sermons`: IDs shown as “Gottesdienst” in the dedicated hero card.
  - `calendars.churchEvents`: Church-wide events (e.g., Gemeindeanlässe).
  - `calendars.groupEvents`: Group calendars shown in “Nächste Veranstaltungen”.
  - `calendars.titleOverrides`: Rename calendar-specific items (e.g., `55` → “Kleingruppe Frauen”).
  - `calendars.descriptionOverrides`: Override descriptions (e.g., `35` → “Bei Fragen ...”).
  - `resources.roomTypeIds`: Resource type IDs that count as rooms; only these are displayed on cards.
