import { useState } from 'react'
import NonNegotiablesSection from '../components/NonNegotiablesSection'
import WorkHoursSection from '../components/WorkHoursSection'
import WorkoutsSection from '../components/WorkoutsSection'
import StreaksSection from '../components/StreaksSection'
import CalendarSection from '../components/CalendarSection'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'work' | 'workout' | 'calendar'>('overview')

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Killjoy</h1>
        <p>Founder Discipline & Productivity Tracker</p>
      </header>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <StreaksSection />
            <div className="grid-item quick-stats">
              <h2>Today's Summary</h2>
              <div className="summary-grid">
                <div className="stat-card">
                  <span className="stat-label">Tasks Done</span>
                  <span className="stat-value">—</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Hours Worked</span>
                  <span className="stat-value">—</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Workouts</span>
                  <span className="stat-value">—</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && <NonNegotiablesSection />}
        {activeTab === 'work' && <WorkHoursSection />}
        {activeTab === 'workout' && <WorkoutsSection />}
        {activeTab === 'calendar' && <CalendarSection />}
      </div>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="icon">📊</span>
          Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="icon">✓</span>
          Tasks
        </button>
        <button
          className={`nav-btn ${activeTab === 'work' ? 'active' : ''}`}
          onClick={() => setActiveTab('work')}
        >
          <span className="icon">⏱</span>
          Work
        </button>
        <button
          className={`nav-btn ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          <span className="icon">💪</span>
          Workout
        </button>
        <button
          className={`nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <span className="icon">📅</span>
          Calendar
        </button>
      </nav>
    </div>
  )
}
