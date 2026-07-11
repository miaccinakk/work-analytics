import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { PageContainer } from "@/components/page-container"
import { VacancyList } from "@/components/vacancy-list"
import { categories, getCategoryMeta, getVacanciesByCategory, type VacancyCategory } from "@/lib/vacancies"

export function generateStaticParams() {
  return categories.map((c) => ({ cat: c.slug }))
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const meta = getCategoryMeta(cat)
  if (!meta) notFound()

  const items = getVacanciesByCategory(cat as VacancyCategory)

  return (
    <AppShell>
      <PageContainer title={meta.label} description={meta.description}>
        <VacancyList vacancies={items} emptyMessage="В этой категории пока нет вакансий" />
      </PageContainer>
    </AppShell>
  )
}
