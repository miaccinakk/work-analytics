import { AppShell } from "@/components/app-shell"
import { PageContainer } from "@/components/page-container"
import { Overview } from "@/components/overview"

export default function Page() {
  return (
    <AppShell>
      <PageContainer
        title="Обзор"
        description="Подходящие вакансии с hh.ru по онлайн-школам. Отмечайте, что отложили и куда откликнулись."
      >
        <Overview />
      </PageContainer>
    </AppShell>
  )
}
