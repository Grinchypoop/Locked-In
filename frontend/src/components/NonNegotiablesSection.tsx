import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../api/client'
import '../styles/NonNegotiables.css'

export default function NonNegotiablesSection() {
  const nonNegotiables = useAppStore((state) => state.nonNegotiables)
  const toggleNonNegotiable = useAppStore((state) => state.toggleNonNegotiable)
  const addNonNegotiable = useAppStore((state) => state.addNonNegotiable)
  const removeNonNegotiable = useAppStore((state) => state.removeNonNegotiable)

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [duration, setDuration] = useState(90)

  const getTodayFormatted = () => new Date().toISOString().split('T')[0]

  const handleToggle = async (id: number) => {
    try {
      const isCurrentlyCompleted = nonNegotiables.find((item) => item.id === id)?.completed
      await apiClient.toggleNonNegotiable(id, getTodayFormatted(), !isCurrentlyCompleted)
      toggleNonNegotiable(id)
    } catch (error) {
      console.error('Error toggling non-negotiable:', error)
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return

    try {
      const response = await apiClient.createNonNegotiable(newTitle, newDescription, duration)
      addNonNegotiable({
        ...response.data,
        completed: false,
      })
      setNewTitle('')
      setNewDescription('')
      setDuration(90)
    } catch (error) {
      console.error('Error creating non-negotiable:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteNonNegotiable(id)
      removeNonNegotiable(id)
    } catch (error) {
      console.error('Error deleting non-negotiable:', error)
    }
  }

  const completedCount = nonNegotiables.filter((item) => item.completed).length
  const totalCount = nonNegotiables.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="section non-negotiables">
      <div className="section-header">
        <h2>Non-Negotiables</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <span className="progress-text">
          {completedCount}/{totalCount} ({completionPercentage}%)
        </span>
      </div>

      <div className="non-negotiables-list">
        {nonNegotiables.map((item) => (
          <div key={item.id} className={`non-negotiable-item ${item.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={item.completed || false}
              onChange={() => handleToggle(item.id)}
              className="checkbox"
            />
            <div className="item-content">
              <h3 className="item-title">{item.title}</h3>
              {item.description && <p className="item-description">{item.description}</p>}
              <span className="item-duration">{item.duration_days} days</span>
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(item.id)}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="add-item-form">
        <h3>Add New Non-Negotiable</h3>
        <input
          type="text"
          placeholder="Title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="input-field"
        />
        <textarea
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="input-field"
          rows={2}
        ></textarea>
        <div className="duration-input">
          <label>Duration (days):</label>
          <input
            type="number"
            min="1"
            max="365"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />
        </div>
        <button className="create-btn" onClick={handleCreate}>
          Create Non-Negotiable
        </button>
      </div>
    </div>
  )
}
