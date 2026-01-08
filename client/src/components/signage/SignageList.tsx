import React from "react";
import { SignageListRow } from "./SignageListRow";

type SignageListItem = {
    key: React.Key;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    color?: string;
    rightPrimary?: React.ReactNode;
    rightSecondary?: React.ReactNode;
    titleClassName?: string;
    subtitleClassName?: string;
    rightPrimaryClassName?: string;
    rightSecondaryClassName?: string;
    className?: string;
};

type SignageListProps = {
    title?: React.ReactNode;
    titleClassName?: string;
    items: SignageListItem[];
    className?: string;
    listClassName?: string;
    showEndDivider?: boolean;
};

export function SignageList({
    title,
    titleClassName = "text-2xl font-semibold text-gray-800 mb-3",
    items,
    className = "",
    listClassName = "space-y-3",
    showEndDivider = false,
}: SignageListProps) {
    if (!items.length) return null;

    return (
        <div className={className}>
            {title ? <h3 className={titleClassName}>{title}</h3> : null}
            <div className={listClassName}>
                {items.map((item) => (
                    <SignageListRow key={item.key} {...item} />
                ))}
            </div>
            {showEndDivider ? <div className="signage-divider" aria-hidden="true" /> : null}
        </div>
    );
}
