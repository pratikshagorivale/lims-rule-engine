import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCog,
  LayoutDashboard,
  ListChecks,
  Microscope,
  PanelLeftClose,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { cn } from '../lib/cn'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  to?: string
  chevron?: boolean
  count?: number
  disabled?: boolean
}

const topNav: NavItem[] = [
  { label: 'Operation', icon: Microscope, chevron: true, disabled: true },
  { label: 'Operations Dashboard', icon: LayoutDashboard, disabled: true },
  { label: 'Waiting List', icon: ListChecks, chevron: true, disabled: true },
]

const adminNav: NavItem[] = [
  { label: 'Provider Management', icon: Users, disabled: true },
  { label: 'Profile & Report Management', icon: FileCog, chevron: true, disabled: true },
  { label: 'Rule Engine', icon: Workflow, to: '/' },
  { label: 'Account Overview', icon: Building2, disabled: true },
  { label: 'Report Settings', icon: Settings, disabled: true },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const inRuleEngine = location.pathname === '/' || location.pathname.startsWith('/rules')

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const active = item.to === '/' ? inRuleEngine : false
    const base = cn(
      'group flex items-center rounded-md text-[13px] font-medium transition-colors',
      collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-[7px]',
    )

    const inner = (
      <>
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            active ? 'text-white' : 'text-[color:var(--color-nav-muted)] group-hover:text-white',
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.chevron && <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-nav-muted)]" />}
            {typeof item.count === 'number' && (
              <span className="text-[color:var(--color-nav-muted)]">{item.count}</span>
            )}
          </>
        )}
      </>
    )

    if (item.disabled) {
      return (
        <div
          key={item.label}
          title={collapsed ? item.label : 'Available in the full platform'}
          className={cn(base, 'cursor-not-allowed text-[color:var(--color-nav-text)]/70')}
        >
          {inner}
        </div>
      )
    }

    return (
      <NavLink
        key={item.label}
        to={item.to!}
        title={collapsed ? item.label : undefined}
        className={cn(
          base,
          active
            ? 'bg-[color:var(--color-nav-active)] text-white shadow-sm'
            : 'text-[color:var(--color-nav-text)] hover:bg-white/5 hover:text-white',
        )}
      >
        {inner}
      </NavLink>
    )
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col bg-[color:var(--color-nav)] transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[60px]' : 'w-[232px]',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 items-center gap-2 bg-[color:var(--color-nav-dark)]',
            collapsed ? 'justify-center px-0' : 'px-4',
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-white">
            <BadgeCheck className="h-4 w-4" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-white">
              Crelio<span className="text-emerald-400">Health</span>
            </span>
          )}
        </div>

        {/* User profile */}
        <div className={cn('border-b border-white/5', collapsed ? 'px-2 py-2.5' : 'px-3 py-2.5')}>
          <div
            className={cn(
              'flex items-center rounded-md',
              collapsed ? 'justify-center' : 'gap-2.5 px-1',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[13px] font-bold text-white">
              P
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13px] font-semibold text-white">Hello Pratikshaa</p>
                  <p className="truncate text-[11px] text-[color:var(--color-nav-muted)]">
                    #6284 · BioScience
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-[color:var(--color-nav-muted)]" />
              </>
            )}
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5 ring-1 ring-inset ring-white/10">
              <Search className="h-3.5 w-3.5 text-[color:var(--color-nav-muted)]" />
              <span className="flex-1 text-[12px] text-[color:var(--color-nav-muted)]">
                Navigation Search
              </span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-nav-muted)]">
                k
              </kbd>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-1">
          <div className="space-y-0.5">{topNav.map(renderItem)}</div>

          {!collapsed && (
            <p className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-nav-muted)]">
              Admin
            </p>
          )}
          {collapsed && <div className="my-3 border-t border-white/10" />}
          <div className="space-y-0.5">{adminNav.map(renderItem)}</div>
        </nav>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex items-center gap-2 border-t border-white/5 py-2.5 text-[12px] font-medium text-[color:var(--color-nav-muted)] transition-colors hover:text-white',
            collapsed ? 'justify-center px-0' : 'px-4',
          )}
        >
          {collapsed ? <PanelLeftClose className="h-4 w-4 rotate-180" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* Main column */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[padding] duration-200',
          collapsed ? 'lg:pl-[60px]' : 'lg:pl-[232px]',
        )}
      >
        {/* Slim mobile bar */}
        <header className="flex h-12 items-center gap-2 border-b border-slate-200 bg-[color:var(--color-nav-dark)] px-4 lg:hidden">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-white">
            <BadgeCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-white">
            Crelio<span className="text-emerald-400">Health</span>
          </span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white">
            <ShieldCheck className="h-3 w-3" />
            Rule Engine
          </span>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
