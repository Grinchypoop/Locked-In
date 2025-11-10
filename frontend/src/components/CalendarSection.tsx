import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import '../styles/Calendar.css'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string | Date
  end_time: string | Date
  event_date: string
}

export default function CalendarSection() {
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendarEvents()
  }, [])

  const loadCalendarEvents = async () => {
    try {
      setLoading(true)
      const today = await apiClient.getTodayCalendarEvents()
      setTodayEvents(today.data)

      const upcoming = await apiClient.getUpcomingEvents(14)
      setUpcomingEvents(upcoming.data)
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return <div className="section calendar">Loading calendar...</div>
  }

  return (
    <div className="section calendar">
      <div className="section-header">
        <h2>📅 Notion Calendar</h2>
        <button className="refresh-btn" onClick={loadCalendarEvents}>
          ↻
        </button>
      </div>

      <div className="calendar-content">
        <div className="calendar-section">
          <h3>Today</h3>
          {todayEvents.length > 0 ? (
            <div className="events-list">
              {todayEvents.map((event) => (
                <div key={event.id} className="event-item today">
                  <div className="event-time">
                    <span>{formatTime(event.start_time)}</span>
                    {event.end_time && (
                      <span className="end-time">{formatTime(event.end_time)}</span>
                    )}
                  </div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    {event.description && <p>{event.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No events today</p>
          )}
        </div>

        <div className="calendar-section">
          <h3>Upcoming (Next 14 Days)</h3>
          {upcomingEvents.length > 0 ? (
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    {event.description && <p>{event.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No upcoming events</p>
          )}
        </div>
      </div>

      <div className="calendar-note">
        <p>
          💡 Calendar is read-only and syncs from your Notion calendar. Configure your Notion
          integration to see events here.
        </p>
      </div>
    </div>
  )
}
