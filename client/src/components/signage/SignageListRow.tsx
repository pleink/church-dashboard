import React from "react";

type SignageListRowProps = {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    rightPrimary?: React.ReactNode;
    rightSecondary?: React.ReactNode;
    color?: string;
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    rightPrimaryClassName?: string;
    rightSecondaryClassName?: string;
};

export function SignageListRow({
    title,
    subtitle,
    rightPrimary,
    rightSecondary,
    color = "#facc15",
    className = "",
    titleClassName = "text-xl font-medium text-gray-800 leading-tight",
    subtitleClassName = "text-lg text-gray-500 leading-snug break-words max-w-xs",
    rightPrimaryClassName = "text-xl text-gray-600 font-medium whitespace-nowrap",
    rightSecondaryClassName = "text-lg text-gray-500",
}: SignageListRowProps) {
    const hasRight = rightPrimary || rightSecondary;
    return (
        <div className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 ${className}`}>
            <div className="flex items-center space-x-6">
                <div
                    className="w-3 h-3 mr-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                ></div>
                <div className="space-y-1">
                    <div className={titleClassName}>{title}</div>
                    {subtitle ? <div className={subtitleClassName}>{subtitle}</div> : null}
                </div>
            </div>
            {hasRight && (
                <div className="text-right">
                    {rightPrimary ? <div className={rightPrimaryClassName}>{rightPrimary}</div> : null}
                    {rightSecondary ? <div className={rightSecondaryClassName}>{rightSecondary}</div> : null}
                </div>
            )}
        </div>
    );
}
