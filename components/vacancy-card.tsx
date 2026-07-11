"use client"

import { Bookmark, ExternalLink, Globe, MapPin, Send, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Vacancy } from "@/lib/vacancies"
import { getCategoryMeta } from "@/lib/vacancies"
import { useStatus } from "@/lib/status-store"

export function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const { getStatus, toggleStatus } = useStatus()
  const status = getStatus(vacancy.id)
  const category = getCategoryMeta(vacancy.cat)

  const saved = status === "saved"
  const applied = status === "applied"

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground transition-colors",
        applied && "border-emerald-500/50",
        saved && "border-amber-500/50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {category.label}
            </span>
          )}
          {applied && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Откликнулся
            </span>
          )}
          {saved && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              Отложено
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-pretty text-base font-semibold leading-snug">{vacancy.title}</h3>
        <p className="text-sm text-muted-foreground">{vacancy.employer}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          {vacancy.salary || "Не указана"}
        </span>
        {vacancy.loc && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {vacancy.loc}
          </span>
        )}
      </div>

      {vacancy.brief && (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{vacancy.brief}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a
          href={vacancy.vacLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          Вакансия на hh.ru
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {vacancy.empLink && (
          <a
            href={vacancy.empLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
          >
            Компания
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {vacancy.site && (
          <a
            href={vacancy.site}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
          >
            <Globe className="h-3.5 w-3.5" />
            Сайт
          </a>
        )}
        {vacancy.socials?.map((s) => (
          <a
            key={s}
            href={s}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
          >
            Соцсеть
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => toggleStatus(vacancy.id, "saved")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            saved
              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-border bg-background text-foreground hover:bg-accent",
          )}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          {saved ? "В отложенных" : "Отложить"}
        </button>
        <button
          type="button"
          onClick={() => toggleStatus(vacancy.id, "applied")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            applied
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-border bg-background text-foreground hover:bg-accent",
          )}
        >
          <Send className="h-4 w-4" />
          {applied ? "Отклик отправлен" : "Откликнулся"}
        </button>
      </div>
    </article>
  )
}
