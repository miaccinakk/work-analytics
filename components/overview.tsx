"use client"

import Link from "next/link"
import { Bookmark, Briefcase, Send, TrendingUp } from "lucide-react"
import { categories, getVacanciesByCategory, vacancies } from "@/lib/vacancies"
import { useStatus } from "@/lib/status-store"
import { VacancyList } from "@/components/vacancy-list"

export function Overview() {
  const { counts } = useStatus()

  const stats = [
    { label: "Всего вакансий", value: vacancies.length, icon: Briefcase },
    { label: "Отложено", value: counts.saved, icon: Bookmark },
    { label: "Откликнулся", value: counts.applied, icon: Send },
    {
      label: "Осталось разобрать",
      value: vacancies.length - counts.saved - counts.applied - counts.removed,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Категории
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold group-hover:text-primary">{c.label}</span>
                <span className="text-2xl font-semibold tabular-nums text-muted-foreground">
                  {getVacanciesByCategory(c.slug).length}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Все вакансии
        </h2>
        <VacancyList vacancies={vacancies} />
      </div>
    </div>
  )
}
