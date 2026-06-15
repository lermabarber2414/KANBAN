# KanbanFlow — GitHub Issues Kanban Board

A fully frontend-only Kanban task manager that uses **GitHub Issues as its database**, with drag-and-drop support and Word document (`.docx`) task import.

---

## ✨ Features

- 🗂 Kanban board with 3 columns: **Pendiente / En progreso / Completado**
- 🖱 Drag & drop cards between columns (dnd-kit)
- 📋 Create, edit, and delete tasks (synced to GitHub Issues)
- 🎨 Priority color coding: Alta (red) / Media (amber) / Baja (green)
- 📅 Due dates with overdue highlighting
- 🏷 Category labels
- 📄 Import tasks from `.docx` Word files (AI-generated format)
- 💡 Shows AI recommendations from the imported document
- 🔒 No backend — runs 100% in the browser
- 💾 GitHub token stored in `localStorage` only

---

## 🚀 Quick Start (Local)

### 1. Prerequisites

- Node.js 18+ and npm
- A GitHub repository (can be empty)
- A GitHub Personal Access Token with `repo` scope

### 2. Clone and install

```bash
git clone https://github.com/YOUR_USER/kanban-app.git
cd kanban-app
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Configure in the UI

On first launch you'll see the Setup screen. Enter:
- **Token**: your GitHub PAT (created at https://github.com/settings/tokens/new?scopes=repo)
- **Owner**: your GitHub username or organization name
- **Repo**: the repository name where issues will be stored

The app validates the token and repo live before saving.

---

## 📄 Word Import Format

The `.docx` file must contain this block anywhere in the document:

```
===TASKS_START===
{
  "tasks": [
    {
      "title": "Deploy new API version",
      "description": "Update all endpoints to v2 spec",
      "priority": "alta",
      "category": "Backend",
      "dueDate": "2025-12-31"
    },
    {
      "title": "Update documentation",
      "description": "Sync README with latest changes",
      "priority": "baja",
      "category": "Docs",
      "dueDate": "2026-01-15"
    }
  ],
  "recommendations": [
    "Start with the highest priority tasks first.",
    "Allocate extra time for QA before the deadline."
  ]
}
===TASKS_END===
```

**Priority values**: `alta` | `media` | `baja`  
**Date format**: `YYYY-MM-DD`

---

## 🌐 Deploy to GitHub Pages

### Step 1 — Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 2 — Set the base URL

Edit `vite.config.js` and set `base` to your repo name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/YOUR-REPO-NAME/',   // ← change this
})
```

Or use the environment variable approach — set `VITE_BASE_URL=/YOUR-REPO-NAME/` in a `.env.production` file.

### Step 3 — Add deploy script to package.json

The `deploy` script is already included:
```json
"deploy": "npm run build && gh-pages -d dist"
```

### Step 4 — Deploy

```bash
npm run deploy
```

This builds the app and pushes the `dist/` folder to the `gh-pages` branch.

### Step 5 — Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select branch: `gh-pages`, folder: `/ (root)`
4. Save — your app will be live at `https://YOUR_USER.github.io/YOUR-REPO-NAME/`

### Step 6 — Configure the app

Visit your deployed URL and enter your GitHub credentials in the Setup screen.  
The token is stored only in your browser's `localStorage`.

---

## 🏗 Project Structure

```
kanban-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar
│   │   ├── KanbanColumn.jsx    # Droppable column
│   │   ├── SortableTaskCard.jsx # dnd-kit sortable wrapper
│   │   ├── TaskCard.jsx        # Visual task card
│   │   ├── TaskModal.jsx       # Create / Edit modal
│   │   ├── ImportPanel.jsx     # .docx import side panel
│   │   └── Toast.jsx           # Ephemeral notifications
│   ├── hooks/
│   │   └── useBoard.js         # Central state + API calls
│   ├── pages/
│   │   ├── SetupPage.jsx       # GitHub token setup screen
│   │   └── BoardPage.jsx       # Main Kanban board
│   ├── services/
│   │   └── githubApi.js        # GitHub REST API layer
│   ├── utils/
│   │   ├── docxParser.js       # mammoth.js + JSON extraction
│   │   ├── storage.js          # localStorage helpers
│   │   └── taskHelpers.js      # Sorting, grouping, formatting
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔐 GitHub Labels Used

The app auto-creates these labels in your repository:

| Label | Color | Purpose |
|-------|-------|---------|
| `kanban` | Indigo | Marks all kanban tasks |
| `priority:alta` | Red | High priority |
| `priority:media` | Amber | Medium priority |
| `priority:baja` | Green | Low priority |
| `status:Pendiente` | Slate | To do |
| `status:En progreso` | Blue | In progress |
| `status:Completado` | Green | Done |
| `category:<value>` | Purple | Custom category |

---

## ⚙️ Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| Vite | 4 | Build tool |
| TailwindCSS | 3 | Styling |
| dnd-kit | 6/8 | Drag & drop |
| mammoth.js | 1.6 | .docx parsing |
| lucide-react | 0.383 | Icons |
| GitHub REST API | 2022-11-28 | Data persistence |

---

## 🛡 Security Notes

- Your GitHub token **never leaves your browser** — all API calls go directly from the browser to `api.github.com`.
- The token is stored in `localStorage`. Use a token with minimal required scopes (`repo`).
- For shared/public machines, click **Desconectar** in the menu to clear the token.
- Consider creating a **dedicated private repository** just for task storage.

---

## 🧑‍💻 Development

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build locally
npm run deploy   # Build + push to GitHub Pages
```
