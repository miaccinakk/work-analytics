import { vacancies, type Vacancy, type VacancyCategory } from "./vacancies-data"

export { vacancies }
export type { Vacancy, VacancyCategory }

export interface CategoryMeta {
  slug: VacancyCategory
  label: string
  description: string
}

export const categories: CategoryMeta[] = [
  {
    slug: "mkt",
    label: "Маркетинг",
    description: "Маркетологи, CMO и трафик-менеджеры в онлайн-школах",
  },
  {
    slug: "dev",
    label: "Разработка",
    description: "Разработчики и технические специалисты",
  },
  {
    slug: "design",
    label: "Дизайн",
    description: "Дизайнеры и креативные роли",
  },
  {
    slug: "big",
    label: "Крупные",
    description: "Крупные и заметные компании",
  },
]

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getVacanciesByCategory(slug: VacancyCategory): Vacancy[] {
  return vacancies.filter((v) => v.cat === slug)
}

export function getVacancyById(id: string): Vacancy | undefined {
  return vacancies.find((v) => v.id === id)
}
