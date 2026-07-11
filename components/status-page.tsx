"use client"

import { vacancies } from "@/lib/vacancies"
import { useStatus, type VacancyStatus } from "@/lib/status-store"
import { VacancyList } from "@/components/vacancy-list"

export function StatusPage({ status, emptyMessage }: { status: VacancyStatus; emptyMessage: string }) {
  const { statuses, ready } = useStatus()

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Загрузка...</p>
  }

  const items = vacancies.filter((v) => statuses[v.id] === status)

  return <VacancyList vacancies={items} showFilters={false} emptyMessage={emptyMessage} />
}
