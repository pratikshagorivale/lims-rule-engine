import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-[12px]">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <div key={i} className="flex items-center gap-1">
            {item.to && !last ? (
              <Link
                to={item.to}
                className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={last ? 'font-medium text-slate-500' : 'font-medium text-brand-600'}>
                {item.label}
              </span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          </div>
        )
      })}
    </nav>
  )
}
