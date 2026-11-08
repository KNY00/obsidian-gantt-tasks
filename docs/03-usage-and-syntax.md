---
title: Usage & Task Syntax
description: Understand how to format your Markdown tasks so they appear correctly in the Gantt timeline.
---

# Usage & Task Syntax

For the script to successfully generate a Gantt chart, your tasks need to follow a specific Markdown structure with recognizable date and time prefixes.

## 1. Basic Task Format

The script scans your target notes line by line and processes standard Markdown checkboxes:

* **Uncompleted tasks:** `- [ ]`
* **Completed tasks:** `- [x]` or `- [X]`

Indented tasks (subtasks) are supported as long as the trimmed line starts with one of the checkbox patterns above. Any other line (headings, plain bullets, numbered lists) is ignored.

::: info Task Name Length
To keep the Mermaid Gantt chart readable, task names are automatically truncated to **30 characters** (followed by `...`) on the chart axis, while the full task name remains visible in the toggleable task list (`Toggle Tasks`).
:::

## 2. Defining Time Intervals

To place a task accurately on the daily timeline, provide a start and end time:

* **Format:** `HH:MM-HH:MM` in 24-hour format (single-digit hours/minutes like `8:05` are automatically normalized to `08:05`).
* **Default Prefix:** By default, the script looks for the `⛏️` emoji followed by a space before the time interval. You can customize this via the `intervalPrefix` option.
* **Milestones:** If the start time and end time are identical (e.g., `⛏️ 14:00-14:00`), the task is rendered as a diamond **milestone** on the Gantt chart.

::: warning Handling Tasks Without Intervals
By default (`excludeTasksWithoutInterval: true`), tasks without a valid `HH:MM-HH:MM` interval are hidden. If you set `excludeTasksWithoutInterval` to `false` (via `dv.view` input or the `exclude_tasks_without_interval: "false"` frontmatter property), tasks without an interval will be rendered as a milestone at `08:00` on their target date.
:::

```markdown
// ❌ Missing the interval prefix — interval will not be detected
- [ ] Team meeting 09:00-10:30 ⏳ 2026-08-25

// ✅ Valid task using the default interval prefix (⛏️)
- [ ] Read documentation ⛏️ 11:00-11:30 ⏳ 2026-08-25
```

## 3. Assigning Dates

The script requires a valid calendar date in `YYYY-MM-DD` format to know which day a task belongs to. By default, it uses the standard **Obsidian Tasks** plugin emojis:

* **Scheduled Date (`scheduledPrefix`):** `⏳` (e.g., `⏳ 2026-08-25`)
* **Due Date (`duePrefix`):** `📅` (e.g., `📅 2026-08-25`)
* **Completion Date (`completionPrefix`):** `✅` (e.g., `✅ 2026-08-25`)

If a task has a valid **Completion Date**, its Gantt bar status is automatically set to `done`; otherwise, it is displayed as `active`.

```markdown
// Active scheduled task
- [ ] Prepare project pitch ⛏️ 09:00-10:00 ⏳ 2026-08-25

// Milestone due at a specific time
- [ ] Submit final budget ⛏️ 14:00-14:00 📅 2026-08-25

// Completed task (rendered as 'done')
- [x] Client review meeting ⛏️ 11:00-12:00 📅 2026-08-25 ✅ 2026-08-25
```

## 4. Date Priority Logic

If a single task contains multiple dates (for example, it was scheduled for Tuesday, due on Wednesday, and completed on Thursday), the script resolves a single display date using the following strict priority order (from highest to lowest):

1. **Completion Date (`✅`)** — Always takes precedence if present.
2. **Due Date (`📅`)** — Used if no completion date is present.
3. **Scheduled Date (`⏳`)** — Used if neither completion nor due date is present.
4. **File Name Date (Fallback)** — If the task has no inline dates and `fallbackToFileDate` is enabled (`true` by default), the script extracts the `YYYY-MM-DD` date from the note's filename (e.g., `Journal/2026-08-25.md`).

```markdown
// Example 1: Has both Scheduled and Due dates (Due wins, placed on 2026-08-26)
- [ ] Review designs 🪓 10:00-11:00 ⏳ 2026-08-25 📅 2026-08-26

// Example 2: Has Scheduled, Due, and Completion dates (Completion wins, marked done on 2026-08-27)
- [x] Finalize report 🪓 15:00-16:00 ⏳ 2026-08-25 📅 2026-08-26 ✅ 2026-08-27
```

::: info Daily Notes
The file name fallback feature is incredibly useful if you use Daily Notes in Obsidian. If your file is named `2026-08-25.md`, you only need to write the time intervals on your tasks—the script will automatically assign them to August 25th!
:::

## 5. Targeting locations

By default, the script scans your entire vault for tasks (represented by the wildcard `*`). However, you can restrict the timeline to specific locations by setting the `includeLocation` property in your Dataview input object (or the corresponding Obsidian property).

* **Default (`*`):** Scans all tasks across the entire vault.
* **Single Folder:** Limit tasks to a specific directory (e.g., `"Projects"`).
* **Multiple Folders:** Separate multiple folders with commas (e.g., `"Projects, Daily Notes"`).

### Example with Dataview

```dataviewjs
// Render the Gantt timeline using the script located in our Scripts folder
dv.view("Scripts/dataview/timeline", {
    includeLocation: "Projects,Journal",
    // ... other configuration options
});
```

## 6. Targeting tags

You can also filter tasks based on specific tags by setting the `includeTags` property in your DataviewJS input object (or the corresponding Obsidian property).

* **Default (`''`):** Empty by default, meaning all tasks are included regardless of tags.
* **Single Tag:** Require a specific tag to be present on the task (e.g., `"#project"`).
* **Multiple Tags:** Separate multiple tags with commas to require tasks to include them (e.g., `"#project, #work"`).

### Example with Dataview

```dataviewjs
// Render the Gantt timeline showing only tasks tagged with #project or #work
dv.view("Scripts/dataview/timeline", {
    includeTags: "#project, #work",
    // ... other configuration options
});
```