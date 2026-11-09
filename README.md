# Obsidian Gantt Timeline

Turn your daily Obsidian tasks into a gorgeous, interactive Gantt chart instantly!

This custom DataviewJS script takes your standard Markdown task lists and transforms them into a clean Mermaid.js timeline—making it easier than ever to visualize your projects, milestones, and daily schedules right inside your vault without needing external tools.

![Preview of the interactive Obsidian Gantt Timeline](/docs/public/script.png)

## 📚 Documentation

**[Read the full documentation here!](https://kny00.github.io/obsidian-gantt-tasks/)**

## ✨ Key Features

*   **Interactive Timeline:** Navigate through days using built-in "Prev" and "Next" buttons without leaving your note.
*   **Toggleable Task List:** Quickly show or hide a text-based list of the rendered tasks directly beneath the chart.
*   **Smart Date Priority:** Automatically chooses the most relevant date for a task, prioritizing the Completion date (`✅`), then the Due date (`📅`), the Scheduled date (`⏳`), or falling back to the file's `YYYY-MM-DD` name.
*   **Highly Customizable:** Filter tasks by specific tags, limit searches to specific folders (`*`, `@currentFile`, or folder paths), or adjust date prefix symbols.

## 🛠️ Prerequisites

*   **Dataview Plugin:** Must be installed and enabled. **Enable JavaScript Queries** in the Dataview plugin settings is mandatory.
*   **Obsidian Tasks Plugin:** Optional, but highly recommended for autocompleting standard task emojis.

## 🚀 Quick Installation

1. Create a `Scripts/dataview` folder in the root of your Obsidian vault.
2. Build or download `timeline.js` and place it at `Scripts/dataview/timeline.js`.
3. Render the Gantt chart in any Markdown note using the following `dataviewjs` block:

```dataviewjs
dv.view("Scripts/dataview/timeline", {
    includeLocations: "*",
    excludeTasksWithoutInterval: true
});
```

## 📝 Task Syntax

To place a task accurately on the daily timeline, provide a 24-hour start and end time prefixed with `⛏️`:

```markdown
- [ ] Prepare project pitch ⛏️ 09:00-10:00 ⏳ 2026-08-25
- [ ] Submit final budget (Milestone) ⛏️ 14:00-14:00 📅 2026-08-25
- [x] Client review meeting ⛏️ 11:00-12:00 📅 2026-08-25 ✅ 2026-08-25
```

## ⚙️ Configuration

Customize the script's behavior via `dv.view()` inputs or Obsidian YAML frontmatter properties. See [docs/04-configuration.md](./docs/04-configuration.md) for the complete reference.