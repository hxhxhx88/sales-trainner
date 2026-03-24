'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  Persona,
  SessionPhase,
  SessionOutcome,
  TranscriptEntry,
  ComplianceFlag,
  Scorecard,
} from '@/lib/types'

interface SessionState {
  phase: SessionPhase
  selectedPersona: Persona | null
  plannerTranscript: TranscriptEntry[]
  buyerTranscript: TranscriptEntry[]
  mergedTranscript: TranscriptEntry[]
  scorecard: Scorecard | null
  complianceFlags: ComplianceFlag[]
  outcome: SessionOutcome | null
  error: string | null
  sessionStartTime: number | null
}

type SessionAction =
  | { type: 'SELECT_PERSONA'; persona: Persona }
  | { type: 'SET_PHASE'; phase: SessionPhase }
  | { type: 'START_SESSION' }
  | { type: 'ADD_PLANNER_ENTRY'; entry: TranscriptEntry }
  | { type: 'ADD_BUYER_ENTRY'; entry: TranscriptEntry }
  | {
      type: 'SET_GRADING_RESULT'
      scorecard: Scorecard
      complianceFlags: ComplianceFlag[]
      mergedTranscript: TranscriptEntry[]
    }
  | { type: 'END_SESSION'; outcome: SessionOutcome }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' }

const initialState: SessionState = {
  phase: 'lobby',
  selectedPersona: null,
  plannerTranscript: [],
  buyerTranscript: [],
  mergedTranscript: [],
  scorecard: null,
  complianceFlags: [],
  outcome: null,
  error: null,
  sessionStartTime: null,
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SELECT_PERSONA':
      return { ...state, selectedPersona: action.persona }
    case 'SET_PHASE':
      return { ...state, phase: action.phase }
    case 'START_SESSION':
      return {
        ...state,
        phase: 'connecting',
        plannerTranscript: [],
        buyerTranscript: [],
        mergedTranscript: [],
        scorecard: null,
        complianceFlags: [],
        outcome: null,
        error: null,
        sessionStartTime: Date.now(),
      }
    case 'ADD_PLANNER_ENTRY':
      return {
        ...state,
        plannerTranscript: [...state.plannerTranscript, action.entry],
      }
    case 'ADD_BUYER_ENTRY':
      return {
        ...state,
        buyerTranscript: [...state.buyerTranscript, action.entry],
      }
    case 'END_SESSION':
      return {
        ...state,
        phase: 'grading',
        outcome: action.outcome,
      }
    case 'SET_GRADING_RESULT':
      return {
        ...state,
        phase: 'review',
        scorecard: action.scorecard,
        complianceFlags: action.complianceFlags,
        mergedTranscript: action.mergedTranscript,
      }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

interface SessionContextValue extends SessionState {
  selectPersona: (persona: Persona) => void
  setPhase: (phase: SessionPhase) => void
  startSession: () => void
  addPlannerEntry: (entry: TranscriptEntry) => void
  addBuyerEntry: (entry: TranscriptEntry) => void
  endSession: (outcome: SessionOutcome) => void
  setGradingResult: (
    scorecard: Scorecard,
    complianceFlags: ComplianceFlag[],
    mergedTranscript: TranscriptEntry[]
  ) => void
  setError: (error: string) => void
  reset: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)

  const selectPersona = useCallback(
    (persona: Persona) => dispatch({ type: 'SELECT_PERSONA', persona }),
    []
  )
  const setPhase = useCallback(
    (phase: SessionPhase) => dispatch({ type: 'SET_PHASE', phase }),
    []
  )
  const startSession = useCallback(
    () => dispatch({ type: 'START_SESSION' }),
    []
  )
  const addPlannerEntry = useCallback(
    (entry: TranscriptEntry) => dispatch({ type: 'ADD_PLANNER_ENTRY', entry }),
    []
  )
  const addBuyerEntry = useCallback(
    (entry: TranscriptEntry) => dispatch({ type: 'ADD_BUYER_ENTRY', entry }),
    []
  )
  const endSession = useCallback(
    (outcome: SessionOutcome) => dispatch({ type: 'END_SESSION', outcome }),
    []
  )
  const setGradingResult = useCallback(
    (
      scorecard: Scorecard,
      complianceFlags: ComplianceFlag[],
      mergedTranscript: TranscriptEntry[]
    ) =>
      dispatch({
        type: 'SET_GRADING_RESULT',
        scorecard,
        complianceFlags,
        mergedTranscript,
      }),
    []
  )
  const setError = useCallback(
    (error: string) => dispatch({ type: 'SET_ERROR', error }),
    []
  )
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return (
    <SessionContext value={{
      ...state,
      selectPersona,
      setPhase,
      startSession,
      addPlannerEntry,
      addBuyerEntry,
      endSession,
      setGradingResult,
      setError,
      reset,
    }}>
      {children}
    </SessionContext>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
