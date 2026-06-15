/**
 * localStorage helpers for persisting user configuration.
 * Only the GitHub token and repo details are stored — no task data.
 */

const STORAGE_KEY = 'kanbanflow_config'

export function getStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const config = JSON.parse(raw)
    // Validate required fields exist
    if (config.token && config.owner && config.repo) return config
    return null
  } catch (_) {
    return null
  }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Could not save config to localStorage:', e)
  }
}

export function clearStoredConfig() {
  localStorage.removeItem(STORAGE_KEY)
}
