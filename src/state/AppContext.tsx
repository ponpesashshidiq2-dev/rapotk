import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import type {
  Aspect,
  AspectScore,
  AppState,
  DomainScore,
  LearningDomain,
  PhotoDoc,
  SchoolProfile,
  Settings,
  Student,
  StudentReport,
} from '../types'
import { createInitialState } from '../defaults'
import { generateDeskripsi } from '../utils/deskripsi'
import { newId } from '../utils/id'
import { loadState, saveState } from '../storage/db'

export type Action =
  | { type: 'state/replace'; state: AppState }
  | { type: 'state/reset' }
  | { type: 'profile/patch'; patch: Partial<SchoolProfile> }
  | { type: 'settings/patch'; patch: Partial<Settings> }
  | { type: 'student/add'; student: Student }
  | { type: 'student/update'; student: Student }
  | { type: 'student/delete'; id: string }
  | { type: 'domain/add'; domain: LearningDomain }
  | { type: 'domain/update'; id: string; patch: Partial<LearningDomain> }
  | { type: 'domain/delete'; id: string }
  | { type: 'domain/move'; id: string; dir: -1 | 1 }
  | { type: 'aspek/add'; domainId: string; aspek: Aspect }
  | { type: 'aspek/update'; domainId: string; id: string; patch: Partial<Aspect> }
  | { type: 'aspek/delete'; domainId: string; id: string }
  | { type: 'capaian/add'; domainId: string; aspekId: string; label: string }
  | { type: 'capaian/delete'; domainId: string; aspekId: string; id: string }
  | { type: 'score/patch'; studentId: string; domainId: string; aspekId: string; patch: Partial<AspectScore> }
  | { type: 'score/toggle'; studentId: string; domainId: string; aspekId: string; capaianId: string }
  | { type: 'photos/set'; studentId: string; domainId: string; foto: PhotoDoc[] }

const EMPTY_SCORE: DomainScore = { aspek: {}, foto: [] }

function mapDomain(state: AppState, id: string, fn: (d: LearningDomain) => LearningDomain): AppState {
  let changed = false
  const domains = state.domains.map((d) => {
    if (d.id !== id) return d
    changed = true
    return fn(d)
  })
  return changed ? { ...state, domains } : state
}

function withReport(state: AppState, studentId: string, fn: (r: StudentReport) => StudentReport): AppState {
  const idx = state.reports.findIndex((r) => r.studentId === studentId)
  if (idx === -1) {
    const created = fn({ studentId, domains: {} })
    return { ...state, reports: [...state.reports, created] }
  }
  const reports = state.reports.slice()
  reports[idx] = fn(reports[idx])
  return { ...state, reports }
}

function withDomainScore(
  state: AppState,
  studentId: string,
  domainId: string,
  fn: (ds: DomainScore) => DomainScore,
): AppState {
  return withReport(state, studentId, (r) => {
    const current = r.domains[domainId] ?? EMPTY_SCORE
    const next = fn(current)
    if (next === current) return r
    return { ...r, domains: { ...r.domains, [domainId]: next } }
  })
}

function swap<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir
  if (index < 0 || target < 0 || target >= list.length) return list
  const copy = list.slice()
  const tmp = copy[index]
  copy[index] = copy[target]
  copy[target] = tmp
  return copy
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'state/replace':
      return action.state
    case 'state/reset':
      return createInitialState()
    case 'profile/patch':
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'settings/patch':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'student/add':
      return { ...state, students: [...state.students, action.student] }
    case 'student/update':
      return {
        ...state,
        students: state.students.map((s) => (s.id === action.student.id ? action.student : s)),
      }
    case 'student/delete':
      return {
        ...state,
        students: state.students.filter((s) => s.id !== action.id),
        reports: state.reports.filter((r) => r.studentId !== action.id),
      }

    case 'domain/add':
      return { ...state, domains: [...state.domains, action.domain] }
    case 'domain/update':
      return mapDomain(state, action.id, (d) => ({ ...d, ...action.patch, id: d.id }))
    case 'domain/delete':
      return { ...state, domains: state.domains.filter((d) => d.id !== action.id) }
    case 'domain/move': {
      const idx = state.domains.findIndex((d) => d.id === action.id)
      const domains = swap(state.domains, idx, action.dir)
      return domains === state.domains ? state : { ...state, domains }
    }

    case 'aspek/add':
      return mapDomain(state, action.domainId, (d) => ({ ...d, aspek: [...d.aspek, action.aspek] }))
    case 'aspek/update':
      return mapDomain(state, action.domainId, (d) => ({
        ...d,
        aspek: d.aspek.map((a) => (a.id === action.id ? { ...a, ...action.patch, id: a.id } : a)),
      }))
    case 'aspek/delete':
      return mapDomain(state, action.domainId, (d) => ({
        ...d,
        aspek: d.aspek.filter((a) => a.id !== action.id),
      }))

    case 'capaian/add':
      return mapDomain(state, action.domainId, (d) => ({
        ...d,
        aspek: d.aspek.map((a) =>
          a.id === action.aspekId
            ? {
                ...a,
                capaian: [...a.capaian, { id: newId(), label: action.label.trim() }],
              }
            : a,
        ),
      }))
    case 'capaian/delete':
      return mapDomain(state, action.domainId, (d) => ({
        ...d,
        aspek: d.aspek.map((a) =>
          a.id === action.aspekId ? { ...a, capaian: a.capaian.filter((c) => c.id !== action.id) } : a,
        ),
      }))

    case 'score/patch':
      return withDomainScore(state, action.studentId, action.domainId, (ds) => ({
        ...ds,
        aspek: { ...ds.aspek, [action.aspekId]: { ...(ds.aspek[action.aspekId] ?? emptyScore()), ...action.patch } },
      }))
    case 'score/toggle':
      return withDomainScore(state, action.studentId, action.domainId, (ds) => {
        const current = ds.aspek[action.aspekId] ?? emptyScore()
        const has = current.capaianIds.includes(action.capaianId)
        const capaianIds = has
          ? current.capaianIds.filter((x) => x !== action.capaianId)
          : [...current.capaianIds, action.capaianId]

        const aspek = state.domains
          .find((d) => d.id === action.domainId)
          ?.aspek.find((a) => a.id === action.aspekId)
        const nama = state.students.find((s) => s.id === action.studentId)?.namaLengkap ?? ''

        let deskripsi = current.deskripsi
        if (aspek) {
          const hasilSebelumnya = generateDeskripsi(nama, aspek, current.capaianIds)
          const belumDiedit = deskripsi.trim() === '' || deskripsi === hasilSebelumnya
          if (belumDiedit) deskripsi = generateDeskripsi(nama, aspek, capaianIds)
        }

        return {
          ...ds,
          aspek: { ...ds.aspek, [action.aspekId]: { ...current, capaianIds, deskripsi } },
        }
      })
    case 'photos/set':
      return withDomainScore(state, action.studentId, action.domainId, (ds) => ({
        ...ds,
        foto: action.foto.slice(0, 2),
      }))

    default:
      return state
  }
}

function emptyScore(): AspectScore {
  return { capaianIds: [], deskripsi: '' }
}

function mergeWithDefaults(raw: AppState): AppState {
  const base = createInitialState()
  return {
    version: 1,
    profile: { ...base.profile, ...(raw.profile ?? base.profile) },
    students: Array.isArray(raw.students) ? raw.students : [],
    domains: Array.isArray(raw.domains) && raw.domains.length ? raw.domains : base.domains,
    reports: Array.isArray(raw.reports) ? raw.reports : [],
    settings: { ...base.settings, ...(raw.settings ?? {}) },
  }
}

interface Ctx {
  state: AppState
  dispatch: Dispatch<Action>
  ready: boolean
  savedAt: number | null
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [ready, setReady] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    void loadState().then((loaded) => {
      if (!alive) return
      if (loaded) dispatch({ type: 'state/replace', state: mergeWithDefaults(loaded) })
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => {
      void saveState(state).then(() => setSavedAt(Date.now()))
    }, 400)
    return () => clearTimeout(timer)
  }, [state, ready])

  const value = useMemo<Ctx>(() => ({ state, dispatch, ready, savedAt }), [state, ready, savedAt])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider')
  return ctx
}

export function findReport(state: AppState, studentId: string): StudentReport | undefined {
  return state.reports.find((r) => r.studentId === studentId)
}

export function domainScoreOf(report: StudentReport | undefined, domainId: string): DomainScore {
  if (!report) return EMPTY_SCORE
  return report.domains[domainId] ?? EMPTY_SCORE
}
