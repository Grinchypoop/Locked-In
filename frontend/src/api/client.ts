import axios, { AxiosInstance } from 'axios'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include Telegram init data
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
        config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData
      }
      return config
    })
  }

  // Non-Negotiables
  async getNonNegotiables() {
    return this.client.get('/non-negotiables')
  }

  async getTodayNonNegotiables() {
    return this.client.get('/non-negotiables/today')
  }

  async createNonNegotiable(title: string, description?: string, durationDays: number = 90) {
    return this.client.post('/non-negotiables', { title, description, duration_days: durationDays })
  }

  async toggleNonNegotiable(id: number, date: string, completed: boolean) {
    return this.client.post(`/non-negotiables/${id}/toggle`, { date, completed })
  }

  async deleteNonNegotiable(id: number) {
    return this.client.delete(`/non-negotiables/${id}`)
  }

  // Work Hours
  async getTodayWorkHours() {
    return this.client.get('/work-hours/today')
  }

  async getWeeklyWorkHours() {
    return this.client.get('/work-hours/week')
  }

  async getMonthlyWorkHours() {
    return this.client.get('/work-hours/month')
  }

  async logWorkHours(date: string, hours: number, notes?: string) {
    return this.client.post('/work-hours/log', { date, hours, notes })
  }

  async getWorkHoursStats() {
    return this.client.get('/work-hours/stats')
  }

  // Workouts
  async getTodayWorkout() {
    return this.client.get('/workouts/today')
  }

  async getWeeklyWorkouts() {
    return this.client.get('/workouts/week')
  }

  async getMonthlyWorkouts() {
    return this.client.get('/workouts/month')
  }

  async logWorkout(
    date: string,
    workoutType: string,
    durationMinutes: number,
    intensity: string,
    notes?: string
  ) {
    return this.client.post('/workouts/log', {
      date,
      workout_type: workoutType,
      duration_minutes: durationMinutes,
      intensity,
      notes,
    })
  }

  async getWorkoutStats() {
    return this.client.get('/workouts/stats')
  }

  // Streaks
  async getStreaksDashboard() {
    return this.client.get('/streaks/dashboard')
  }

  async getStreakCalendar(metricType: string) {
    return this.client.get(`/streaks/calendar/${metricType}`)
  }

  // Calendar
  async getTodayCalendarEvents() {
    return this.client.get('/calendar/today')
  }

  async getUpcomingEvents(days: number = 7) {
    return this.client.get('/calendar/upcoming', { params: { days } })
  }
}

export const apiClient = new APIClient()
