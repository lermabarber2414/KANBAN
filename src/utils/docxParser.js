/**
 * Word Document (.docx) Parser
 *
 * Uses mammoth.js to extract raw text, then finds the structured
 * JSON block delimited by ===TASKS_START=== / ===TASKS_END===.
 *
 * Expected JSON inside the block:
 * {
 *   "tasks": [{ title, description, priority, category, dueDate }],
 *   "recommendations": ["string", ...]
 * }
 */
import mammoth from 'mammoth'

/**
 * Parse a .docx File object and return extracted tasks + recommendations.
 * @param {File} file - A .docx File from an <input type="file">
 * @returns {Promise<{ tasks: Task[], recommendations: string[] }>}
 */
export async function parseDocxFile(file) {
  // Step 1: Read the file as an ArrayBuffer (required by mammoth)
  const arrayBuffer = await readFileAsArrayBuffer(file)

  // Step 2: Extract plain text from the Word document
  const result = await mammoth.extractRawText({ arrayBuffer })

  if (result.messages?.length > 0) {
    console.warn('Mammoth warnings:', result.messages)
  }

  const rawText = result.value

  // Step 3: Locate the structured JSON block
  const jsonContent = extractJsonBlock(rawText)

  if (!jsonContent) {
    throw new Error(
      'No se encontró el bloque de tareas en el documento.\n' +
      'Asegúrate de que el documento contenga:\n===TASKS_START===\n{...}\n===TASKS_END==='
    )
  }

  // Step 4: Parse and validate JSON
  const parsed = safeJsonParse(jsonContent)

  if (!parsed) {
    throw new Error('El JSON dentro del bloque de tareas no es válido. Revisa el formato.')
  }

  // Step 5: Validate and normalize task structure
  const tasks = validateAndNormalizeTasks(parsed.tasks || [])
  const recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.filter(r => typeof r === 'string')
    : []

  return { tasks, recommendations }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/** Wrap FileReader in a Promise */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Find the JSON content between ===TASKS_START=== and ===TASKS_END===.
 * Handles various whitespace/newline patterns Word might introduce.
 */
function extractJsonBlock(text) {
  // Normalize different dash/equals variants Word might produce
  const normalized = text
    .replace(/[\u2013\u2014]/g, '-')  // em/en dashes → hyphens
    .replace(/\r\n/g, '\n')

  const startMarker = '===TASKS_START==='
  const endMarker = '===TASKS_END==='

  const startIdx = normalized.indexOf(startMarker)
  const endIdx = normalized.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null
  }

  return normalized
    .slice(startIdx + startMarker.length, endIdx)
    .trim()
}

/** Parse JSON without throwing; returns null on failure */
function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch (_) {
    // Try cleaning up common issues: smart quotes, trailing commas
    try {
      const cleaned = text
        .replace(/[\u2018\u2019]/g, "'")    // smart single quotes
        .replace(/[\u201C\u201D]/g, '"')    // smart double quotes
        .replace(/,\s*([}\]])/g, '$1')      // trailing commas
      return JSON.parse(cleaned)
    } catch (_) {
      return null
    }
  }
}

/** Valid priority values */
const VALID_PRIORITIES = ['alta', 'media', 'baja']

/** Validate each task, applying defaults for missing fields */
function validateAndNormalizeTasks(rawTasks) {
  if (!Array.isArray(rawTasks)) return []

  return rawTasks
    .filter(t => t && typeof t === 'object' && t.title)
    .map((t, idx) => ({
      title: String(t.title).trim(),
      description: t.description ? String(t.description).trim() : '',
      priority: VALID_PRIORITIES.includes(t.priority?.toLowerCase())
        ? t.priority.toLowerCase()
        : 'media',
      category: t.category ? String(t.category).trim() : '',
      dueDate: isValidDate(t.dueDate) ? t.dueDate : '',
      status: 'Pendiente', // imported tasks always start as Pending
    }))
}

/** Check if a string is a valid YYYY-MM-DD date */
function isValidDate(str) {
  if (!str || typeof str !== 'string') return false
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str))
}
