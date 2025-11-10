import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import '../styles/Workouts.css'

interface Workout {
  id: number
  date: string
  workout_type: string
  duration_minutes?: number
  intensity?: string
  notes?: string
}

export default function WorkoutsSection() {
  const [type, setType] = useState('Running')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState('moderate')
  const [notes, setNotes] = useState('')
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadWorkoutData()
  }, [])

  const loadWorkoutData = async () => {
    try {
      const today = await apiClient.getTodayWorkout()
      setTodayWorkout(today.data)

      const weekly = await apiClient.getWeeklyWorkouts()
      setWeeklyWorkouts(weekly.data)

      const statsResponse = await apiClient.getWorkoutStats()
      setStats(statsResponse.data)
    } catch (error) {
      console.error('Error loading workout data:', error)
    }
  }

  const handleLogWorkout = async () => {
    if (!type || !duration || isNaN(parseInt(duration))) return

    try {
      const today = new Date().toISOString().split('T')[0]
      await apiClient.logWorkout(today, type, parseInt(duration), intensity, notes)
      setType('Running')
      setDuration('')
      setIntensity('moderate')
      setNotes('')
      await loadWorkoutData()
    } catch (error) {
      console.error('Error logging workout:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const workoutTypes = ['Running', 'Gym', 'Cycling', 'Swimming', 'Yoga', 'Other']
  const intensities = ['light', 'moderate', 'intense']

  return (
    <div className="section workouts">
      <div className="section-header">
        <h2>Workout Tracking</h2>
        {todayWorkout && (
          <div className="today-summary">
            <span className="today-workout">{todayWorkout.duration_minutes}m</span>
            <span className="label">{todayWorkout.workout_type}</span>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {stats && (
          <>
            <div className="stat-card">
              <span className="stat-value">{stats.total_workouts || '0'}</span>
              <span className="stat-label">This Month</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.total_minutes?.toFixed(0) || '0'}m</span>
              <span className="stat-label">Total Time</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.days_with_workouts || '0'}</span>
              <span className="stat-label">Active Days</span>
            </div>
          </>
        )}
      </div>

      <div className="log-form">
        <h3>Log Workout</h3>
        <div className="form-row">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field"
          >
            {workoutTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="480"
            placeholder="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-row">
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="input-field"
          >
            {intensities.map((i) => (
              <option key={i} value={i}>
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows={2}
        ></textarea>
        <button className="submit-btn" onClick={handleLogWorkout}>
          Log Workout
        </button>
      </div>

      <div className="history">
        <h3>Weekly Workouts</h3>
        <div className="weekly-list">
          {weeklyWorkouts.map((workout) => (
            <div key={workout.id} className="history-item">
              <div className="workout-info">
                <span className="date">{formatDate(workout.date)}</span>
                <span className="type">{workout.workout_type}</span>
              </div>
              <span className="duration">{workout.duration_minutes}m</span>
              <span className={`intensity ${workout.intensity}`}>{workout.intensity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
