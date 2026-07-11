"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type VacancyStatus = "saved" | "applied" | "removed"

type StatusMap = Record<string, VacancyStatus>

const STORAGE_KEY = "vacancy-status-v1"

interface StatusContextValue {
  statuses: StatusMap
  ready: boolean
  getStatus: (id: string) => VacancyStatus | undefined
  setStatus: (id: string, status: VacancyStatus) => void
  clearStatus: (id: string) => void
  toggleStatus: (id: string, status: VacancyStatus) => void
  counts: { saved: number; applied: number; removed: number }
}

const StatusContext = createContext<StatusContextValue | null>(null)

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<StatusMap>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setStatuses(JSON.parse(raw))
    } catch {
      // ignore corrupt storage
    }
    setReady(true)
  }, [])

  const persist = useCallback((next: StatusMap) => {
    setStatuses(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore quota errors
    }
  }, [])

  const setStatus = useCallback(
    (id: string, status: VacancyStatus) => {
      persist({ ...statuses, [id]: status })
    },
    [persist, statuses],
  )

  const clearStatus = useCallback(
    (id: string) => {
      const next = { ...statuses }
      delete next[id]
      persist(next)
    },
    [persist, statuses],
  )

  const toggleStatus = useCallback(
    (id: string, status: VacancyStatus) => {
      if (statuses[id] === status) {
        clearStatus(id)
      } else {
        setStatus(id, status)
      }
    },
    [statuses, clearStatus, setStatus],
  )

  const getStatus = useCallback((id: string) => statuses[id], [statuses])

  const counts = {
    saved: Object.values(statuses).filter((s) => s === "saved").length,
    applied: Object.values(statuses).filter((s) => s === "applied").length,
    removed: Object.values(statuses).filter((s) => s === "removed").length,
  }

  return (
    <StatusContext.Provider
      value={{ statuses, ready, getStatus, setStatus, clearStatus, toggleStatus, counts }}
    >
      {children}
    </StatusContext.Provider>
  )
}

export function useStatus() {
  const ctx = useContext(StatusContext)
  if (!ctx) throw new Error("useStatus must be used within StatusProvider")
  return ctx
}
