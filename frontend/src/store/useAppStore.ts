import { create } from 'zustand'

interface NonNegotiable {
  id: number
  title: string
  description?: string
  duration_days: number
  completed?: boolean
}

interface WorkHours {
  date: string
  hours: number
  notes?: string
}

interface Workout {
  id: number
  date: string
  workout_type: string
  duration_minutes?: number
  intensity?: string
  notes?: string
}

interface Streak {
  metric_type: string
  current_streak: number
  best_streak: number
}

interface AppState {
  // Auth
  userId: number | null
  telegramId: number | null
  isAuthenticated: boolean
  setAuthenticated: (userId: number, telegramId: number) => void

  // Non-Negotiables
  nonNegotiables: NonNegotiable[]
  setNonNegotiables: (items: NonNegotiable[]) => void
  addNonNegotiable: (item: NonNegotiable) => void
  removeNonNegotiable: (id: number) => void
  toggleNonNegotiable: (id: number) => void

  // Work Hours
  workHours: WorkHours[]
  setWorkHours: (hours: WorkHours[]) => void
  addWorkHours: (hours: WorkHours) => void

  // Workouts
  workouts: Workout[]
  setWorkouts: (items: Workout[]) => void
  addWorkout: (item: Workout) => void

  // Streaks
  streaks: Streak[]
  setStreaks: (items: Streak[]) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  userId: null,
  telegramId: null,
  isAuthenticated: false,
  setAuthenticated: (userId: number, telegramId: number) =>
    set({ userId, telegramId, isAuthenticated: true }),

  // Non-Negotiables
  nonNegotiables: [],
  setNonNegotiables: (items) => set({ nonNegotiables: items }),
  addNonNegotiable: (item) =>
    set((state) => ({
      nonNegotiables: [...state.nonNegotiables, item],
    })),
  removeNonNegotiable: (id) =>
    set((state) => ({
      nonNegotiables: state.nonNegotiables.filter((item) => item.id !== id),
    })),
  toggleNonNegotiable: (id) =>
    set((state) => ({
      nonNegotiables: state.nonNegotiables.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    })),

  // Work Hours
  workHours: [],
  setWorkHours: (hours) => set({ workHours: hours }),
  addWorkHours: (hours) =>
    set((state) => ({
      workHours: [...state.workHours.filter((h) => h.date !== hours.date), hours],
    })),

  // Workouts
  workouts: [],
  setWorkouts: (items) => set({ workouts: items }),
  addWorkout: (item) =>
    set((state) => ({
      workouts: [...state.workouts, item],
    })),

  // Streaks
  streaks: [],
  setStreaks: (items) => set({ streaks: items }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
