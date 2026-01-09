import React from "react";

type SignageSectionProps = {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  className?: string;
  headingClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function SignageSection({
  title,
  icon,
  iconClassName = "signage-icon text-church-yellow mr-4 flex-shrink-0",
  className = "col-span-7 section-card p-12",
  headingClassName = "text-4xl font-semibold text-church-blue mb-8 flex items-center",
  contentClassName,
  children,
}: SignageSectionProps) {
  const content = contentClassName ? (
    <div className={contentClassName}>{children}</div>
  ) : (
    <>{children}</>
  );

  return (
    <section className={className}>
      {title && (
        <h2 className={headingClassName}>
          {icon && React.isValidElement(icon)
            ? React.cloneElement(icon, {
                className: [iconClassName, icon.props.className].filter(Boolean).join(" "),
              })
            : icon}
          {title}
        </h2>
      )}
      {content}
    </section>
  );
}
