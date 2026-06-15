/**
 * GitHub REST API service layer.
 * All communication with GitHub Issues goes through this module.
 *
 * Labels used as metadata:
 *   - status:Pendiente | status:En progreso | status:Completado
 *   - priority:alta | priority:media | priority:baja
 *   - category:<value>
 *
 * Due date is stored in the issue body as a JSON frontmatter block:
 *   <!-- KANBAN_META: {"dueDate":"YYYY-MM-DD","category":"..."} -->
 */

const GITHUB_API = 'https://api.github.com'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = `GitHub API error: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body.message) message = `GitHub: ${body.message}`
    } catch (_) { /* ignore parse errors */ }
    throw new Error(message)
  }
  // 204 No Content (e.g. delete) returns empty body
  if (res.status === 204) return null
  return res.json()
}

/** Encode metadata as an HTML comment in the issue body so it's hidden in GitHub UI */
export function encodeBodyWithMeta(description, meta) {
  const metaStr = JSON.stringify(meta)
  return `${description}\n\n<!-- KANBAN_META: ${metaStr} -->`
}

/** Extract metadata block from issue body */
export function decodeBodyMeta(body = '') {
  const match = body.match(/<!-- KANBAN_META: ({.*?}) -->/)
  if (!match) return { description: body, meta: {} }
  try {
    const meta = JSON.parse(match[1])
    const description = body.replace(/\n\n<!-- KANBAN_META:.*?-->/, '').trim()
    return { description, meta }
  } catch (_) {
    return { description: body, meta: {} }
  }
}

/** Convert a raw GitHub issue into our internal task shape */
export function issueToTask(issue) {
  const { description, meta } = decodeBodyMeta(issue.body || '')
  const labels = issue.labels?.map(l => l.name) || []

  // Extract priority / status / category from labels
  const priorityLabel = labels.find(l => l.startsWith('priority:'))
  const statusLabel = labels.find(l => l.startsWith('status:'))
  const categoryLabel = labels.find(l => l.startsWith('category:'))

  return {
    id: String(issue.number),
    githubNumber: issue.number,
    title: issue.title,
    description,
    priority: priorityLabel ? priorityLabel.replace('priority:', '') : 'media',
    status: statusLabel ? statusLabel.replace('status:', '') : 'Pendiente',
    category: meta.category || (categoryLabel ? categoryLabel.replace('category:', '') : ''),
    dueDate: meta.dueDate || '',
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    htmlUrl: issue.html_url,
  }
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch all open issues from the repository (paginated, up to 200).
 * Filters out pull requests which also appear in the issues endpoint.
 */
export async function getIssues({ token, owner, repo }) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=100&labels=kanban`
  const res = await fetch(url, { headers: buildHeaders(token) })
  const data = await handleResponse(res)
  // GitHub returns PRs in this endpoint too; filter them out
  return data.filter(i => !i.pull_request).map(issueToTask)
}

/**
 * Create a new GitHub Issue representing a task.
 * Ensures required labels exist before assigning them.
 */
export async function createIssue({ token, owner, repo, task }) {
  const labelNames = buildLabelNames(task)
  // Ensure labels exist (GitHub will throw if they don't)
  await ensureLabelsExist({ token, owner, repo, labelNames })

  const body = encodeBodyWithMeta(task.description || '', {
    dueDate: task.dueDate || '',
    category: task.category || '',
  })

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      title: task.title,
      body,
      labels: [...labelNames, 'kanban'],
    }),
  })
  const issue = await handleResponse(res)
  return issueToTask(issue)
}

/**
 * Update an existing issue (title, body, labels).
 */
export async function updateIssue({ token, owner, repo, task }) {
  const labelNames = buildLabelNames(task)
  await ensureLabelsExist({ token, owner, repo, labelNames })

  const body = encodeBodyWithMeta(task.description || '', {
    dueDate: task.dueDate || '',
    category: task.category || '',
  })

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/issues/${task.githubNumber}`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify({
      title: task.title,
      body,
      labels: [...labelNames, 'kanban'],
    }),
  })
  const issue = await handleResponse(res)
  return issueToTask(issue)
}

/**
 * "Delete" a task by closing the GitHub issue.
 * GitHub Issues cannot be truly deleted via the API, so we close them.
 */
export async function deleteIssue({ token, owner, repo, githubNumber }) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/issues/${githubNumber}`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify({ state: 'closed' }),
  })
  await handleResponse(res)
}

/**
 * Verify that a token + repo combination is valid.
 * Returns repo info on success, throws on failure.
 */
export async function validateRepo({ token, owner, repo }) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: buildHeaders(token),
  })
  return handleResponse(res)
}

// ─── Label Helpers ────────────────────────────────────────────────────────────

const LABEL_COLORS = {
  'kanban': '6366f1',
  'priority:alta': 'ef4444',
  'priority:media': 'f59e0b',
  'priority:baja': '10b981',
  'status:Pendiente': '94a3b8',
  'status:En progreso': '3b82f6',
  'status:Completado': '22c55e',
}

function buildLabelNames(task) {
  const labels = [
    `priority:${task.priority || 'media'}`,
    `status:${task.status || 'Pendiente'}`,
  ]
  if (task.category) labels.push(`category:${task.category}`)
  return labels
}

/**
 * Creates labels that don't exist yet.
 * GitHub returns 422 if a label already exists — we silently ignore that.
 */
async function ensureLabelsExist({ token, owner, repo, labelNames }) {
  const allLabels = [...new Set([...labelNames, 'kanban'])]

  await Promise.allSettled(
    allLabels.map(async (name) => {
      const color = LABEL_COLORS[name] || '8b5cf6'
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/labels`, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({ name, color }),
      })
      // 422 = label already exists, which is fine
      if (!res.ok && res.status !== 422) {
        const body = await res.json().catch(() => ({}))
        console.warn(`Could not create label "${name}":`, body.message)
      }
    })
  )
}
