"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bookmark,
  Briefcase,
  Code2,
  LayoutGrid,
  Megaphone,
  Palette,
  Send,
  Building2,
  EyeOff,
  Rocket,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { categories, getVacanciesByCategory } from "@/lib/vacancies"
import { useStatus } from "@/lib/status-store"
import { ThemeToggle } from "@/components/theme-toggle"

const categoryIcons: Record<string, LucideIcon> = {
  mkt: Megaphone,
  dev: Code2,
  design: Palette,
  big: Building2,
  startup: Rocket,
}

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  count?: number
  active: boolean
  onNavigate?: () => void
}

function NavItem({ href, label, icon: Icon, count, active, onNavigate }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs tabular-nums",
            active ? "bg-sidebar-primary-foreground/20" : "bg-sidebar-accent text-sidebar-foreground/70",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { counts } = useStatus()

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2 pt-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Поиск вакансий</p>
          <p className="text-xs text-sidebar-foreground/60">Онлайн-школы · hh.ru</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <NavItem
          href="/"
          label="Обзор"
          icon={LayoutGrid}
          active={pathname === "/"}
          onNavigate={onNavigate}
        />

        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/40">
          Категории
        </p>
        {categories.map((c) => (
          <NavItem
            key={c.slug}
            href={`/category/${c.slug}`}
            label={c.label}
            icon={categoryIcons[c.slug]}
            count={getVacanciesByCategory(c.slug).length}
            active={pathname === `/category/${c.slug}`}
            onNavigate={onNavigate}
          />
        ))}

        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/40">
          Мой список
        </p>
        <NavItem
          href="/saved"
          label="Отложено"
          icon={Bookmark}
          count={counts.saved}
          active={pathname === "/saved"}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/applied"
          label="Откликнулся"
          icon={Send}
          count={counts.applied}
          active={pathname === "/applied"}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/removed"
          label="Удалённые"
          icon={EyeOff}
          count={counts.removed}
          active={pathname === "/removed"}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border pt-4">
        <span className="text-xs text-sidebar-foreground/50">Тема оформления</span>
        <ThemeToggle />
      </div>
    </div>
  )
}
