import { PortalLink } from "@/components/shared/PortalLink";
import type { PortalSectionProps } from "@/types/home";

export function PortalSection({
  title,
  subtitle,
  badge,
  portal,
  links,
}: PortalSectionProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              {title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          </div>

          <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
            {badge}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {links.map((link, index) => (
          <PortalLink
            key={link.href}
            href={link.href}
            portal={portal}
            className={`group grid grid-cols-[2rem_minmax(0,1fr)_1.75rem] items-center gap-3 px-4 py-4 transition-colors duration-150 sm:grid-cols-[2.5rem_minmax(0,1fr)_1.75rem] sm:px-6 ${index % 2 === 0 ? "bg-white" : "bg-slate-100"
              } hover:bg-blue-50`}
          >
            <span className="font-mono text-xs font-medium tabular-nums text-slate-400">
              {link.number}
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-700">
                {link.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {link.description}
              </span>
            </span>

            <span className="flex h-7 w-7 items-center justify-center justify-self-end rounded-md text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:bg-blue-100 group-hover:text-blue-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M4.167 10h11.666m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </PortalLink>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
        <p className="text-xs text-slate-500">
          {links.length} available modules
        </p>
      </div>
    </section>
  );
}
