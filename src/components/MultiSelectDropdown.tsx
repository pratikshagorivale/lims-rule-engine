import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/cn'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  label: string
  value: string[]
  onChange: (selected: string[]) => void
  options: MultiSelectOption[]
  placeholder?: string
}

export function MultiSelectDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
    null,
  )
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((o) => value.includes(o.value))

  const updateMenuPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setMenuStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (!open) return
    updateMenuPosition()
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    const onReposition = () => updateMenuPosition()
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  const triggerLabel = () => {
    if (value.length === 0) return placeholder
    if (value.length === 1) {
      return options.find((o) => o.value === value[0])?.label ?? `${value.length} selected`
    }
    return `${value.length} selected`
  }

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    )
  }

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredValues = new Set(filtered.map((o) => o.value))
      onChange(value.filter((v) => !filteredValues.has(v)))
      return
    }
    const next = new Set(value)
    filtered.forEach((o) => next.add(o.value))
    onChange(Array.from(next))
  }

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            <div className="border-b border-slate-100 p-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                autoFocus
              />
            </div>

            <div className="max-h-52 overflow-y-auto py-1">
              <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                />
                <span className="font-medium text-slate-800">Select All</span>
              </label>

              {filtered.map((option) => {
                const checked = value.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-2.5 px-3 py-2 text-[13px] hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(option.value)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-brand-600"
                    />
                    <span className="leading-snug text-slate-700">{option.label}</span>
                  </label>
                )
              })}

              {filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-[12px] text-slate-400">No matches found.</p>
              )}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-white px-2.5 text-left text-[13px] transition-colors',
          open
            ? 'border-brand-500 ring-2 ring-brand-100'
            : 'border-slate-300 hover:border-slate-400',
        )}
      >
        <span className="min-w-0 truncate text-slate-800">
          <span className="font-medium text-slate-700">{label}:</span>{' '}
          <span className={value.length === 0 ? 'text-slate-400' : 'text-slate-800'}>
            {triggerLabel()}
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>
      {menu}
    </>
  )
}
