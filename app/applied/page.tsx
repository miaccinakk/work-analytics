import { AppShell } from "@/components/app-shell"
import { PageContainer } from "@/components/page-container"
import { StatusPage } from "@/components/status-page"

export default function AppliedPage() {
  return (
    <AppShell>
      <PageContainer title="Откликнулся" description="Вакансии, на которые вы уже отправили отклик.">
        <StatusPage status="applied" emptyMessage="Пока нет откликов. Отметьте вакансию кнопкой «Откликнулся»." />
      </PageContainer>
    </AppShell>
  )
}
