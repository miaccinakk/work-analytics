"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Vacancy } from "@/lib/vacancies"
import { useStatus } from "@/lib/status-store"
import { VacancyCard } from "@/components/vacancy-card"

type FilterKey = "all" | "new" | "saved" | "applied"

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "new", label: "Без статуса" },
  { key: "saved", label: "Отложено" },
  { key: "applied", label: "Откликнулся" },
]

export function VacancyList({
  vacancies,
  showFilters = true,
  emptyMessage = "Вакансий не найдено",
}: {
  vacancies: Vacancy[]
  showFilters?: boolean
  emptyMessage?: string
}) {
  const { statuses } = useStatus()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vacancies.filter((v) => {
      const status = statuses[v.id]
      if (filter === "new" && status) return false
      if (filter === "saved" && status !== "saved") return false
      if (filter === "applied" && status !== "applied") return false
      if (!q) return true
      return (
        v.title.toLowerCase().includes(q) ||
        v.employer.toLowerCase().includes(q) ||
        v.brief.toLowerCase().includes(q)
      )
    })
  }, [vacancies, statuses, query, filter])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, компании..."
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none ring-ring placeholder:text-muted-foreground focus-visible:ring-2"
          />
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Показано: <span className="font-medium text-foreground">{filtered.length}</span> из {vacancies.length}
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <VacancyCard key={v.id} vacancy={v} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
