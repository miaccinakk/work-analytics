import { AppShell } from "@/components/app-shell"
import { PageContainer } from "@/components/page-container"
import { StatusPage } from "@/components/status-page"

export default function RemovedPage() {
  return (
    <AppShell>
      <PageContainer
        title="Удалённые"
        description="Неинтересные вакансии, скрытые из общего списка. Их можно вернуть в любой момент."
      >
        <StatusPage
          status="removed"
          emptyMessage="Здесь пусто. Нажмите «Удалить» на карточке, чтобы скрыть неинтересную вакансию."
        />
      </PageContainer>
    </AppShell>
  )
}
