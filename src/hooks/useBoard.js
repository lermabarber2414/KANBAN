/**
 * useBoard — central state manager for the Kanban board.
 *
 * Responsibilities:
 * - Fetch issues from GitHub on mount
 * - Provide CRUD operations (create, update, delete)
 * - Handle optimistic UI updates (instant local change → confirm with API)
 */
import { useState, useCallback } from 'react'
import {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from '../services/githubApi.js'

export function useBoard(config) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetched = await getIssues(config)
      setTasks(fetched)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [config])

  // ─── Create ──────────────────────────────────────────────────────────────────

  const addTask = useCallback(async (taskData) => {
    // Optimistic: add a temporary placeholder immediately
    const tempId = `temp-${Date.now()}`
    const optimistic = { ...taskData, id: tempId, githubNumber: null, createdAt: new Date().toISOString() }
    setTasks(prev => [optimistic, ...prev])

    try {
      const created = await createIssue({ ...config, task: taskData })
      // Replace placeholder with real issue
      setTasks(prev => prev.map(t => t.id === tempId ? created : t))
      return created
    } catch (e) {
      // Rollback on failure
      setTasks(prev => prev.filter(t => t.id !== tempId))
      throw e
    }
  }, [config])

  // ─── Update ──────────────────────────────────────────────────────────────────

  const editTask = useCallback(async (taskData) => {
    // Optimistic: immediately apply the change in UI
    setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t))

    try {
      const updated = await updateIssue({ ...config, task: taskData })
      setTasks(prev => prev.map(t => t.id === taskData.id ? updated : t))
      return updated
    } catch (e) {
      // Rollback by re-fetching
      await fetchTasks()
      throw e
    }
  }, [config, fetchTasks])

  // ─── Move (drag & drop status change) ────────────────────────────────────────

  const moveTask = useCallback(async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    try {
      await updateIssue({ ...config, task: { ...task, status: newStatus } })
    } catch (e) {
      // Rollback
      setTasks(prev => prev.map(t => t.id === taskId ? task : t))
      throw e
    }
  }, [config, tasks])

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const removeTask = useCallback(async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Optimistic: remove immediately
    setTasks(prev => prev.filter(t => t.id !== taskId))

    try {
      await deleteIssue({ ...config, githubNumber: task.githubNumber })
    } catch (e) {
      // Rollback
      setTasks(prev => [...prev, task])
      throw e
    }
  }, [config, tasks])

  // ─── Bulk Import (from DOCX) ─────────────────────────────────────────────────

  const importTasks = useCallback(async (taskList) => {
    const results = []
    const errors = []

    for (const taskData of taskList) {
      try {
        const created = await createIssue({ ...config, task: taskData })
        results.push(created)
      } catch (e) {
        errors.push({ task: taskData, error: e.message })
      }
    }

    // Add all successfully created tasks to state
    if (results.length > 0) {
      setTasks(prev => [...results, ...prev])
    }

    return { imported: results, errors }
  }, [config])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    editTask,
    moveTask,
    removeTask,
    importTasks,
  }
}
