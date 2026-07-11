import { AppShell } from "@/components/app-shell"
import { PageContainer } from "@/components/page-container"
import { StatusPage } from "@/components/status-page"

export default function SavedPage() {
  return (
    <AppShell>
      <PageContainer title="Отложено" description="Вакансии, которые вы сохранили, чтобы вернуться позже.">
        <StatusPage status="saved" emptyMessage="Пока нет отложенных вакансий. Нажмите «Отложить» на карточке." />
      </PageContainer>
    </AppShell>
  )
}
