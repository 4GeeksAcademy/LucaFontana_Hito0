export interface SiteNavigationItem {
  current?: boolean;
  href: string;
  label: string;
}

interface SiteNavigationLinksProps {
  items: SiteNavigationItem[];
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
}

export function SiteNavigationLinks({
  items,
  onNavigate,
  variant,
}: SiteNavigationLinksProps) {
  const isDesktop = variant === "desktop";
  const listClassName = isDesktop
    ? "hidden items-center gap-8 text-sm font-medium text-gray-300 md:flex"
    : "flex flex-col gap-1 px-4 py-4 text-base font-medium text-gray-300";

  return (
    <ul className={listClassName} role={isDesktop ? "menubar" : undefined}>
      {items.map((item) => (
        <li
          key={`${isDesktop ? "desktop" : "mobile"}-${item.href}-${item.label}`}
          role={isDesktop ? "none" : undefined}
        >
          <a
            href={item.href}
            className={
              isDesktop
                ? [
                    "rounded py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand",
                    item.current ? "font-semibold text-brand" : "hover:text-brand",
                  ].join(" ")
                : [
                    "block rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand",
                    item.current
                      ? "bg-white/5 text-brand"
                      : "hover:bg-white/5 hover:text-brand",
                  ].join(" ")
            }
            role="menuitem"
            aria-current={item.current ? "page" : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}