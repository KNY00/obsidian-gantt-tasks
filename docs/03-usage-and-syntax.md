---
title: Usage & Task Syntax
description: Understand how to format your Markdown tasks so they appear correctly in the Gantt timeline.
---

# Usage & Task Syntax

For the script to successfully generate a Gantt chart, your tasks need to be formatted in a way that it can read. The script looks for specific Markdown task indicators, time intervals, and dates.

## 1. Basic Task Format

The script scans your target notes line by line and processes standard Markdown tasks. Every task must begin with either an open or checked checkbox:

*   **Uncompleted tasks:** `- [ ]`
*   **Completed tasks:** `- [x]` (or `- [X]`)

Indented tasks (subtasks) are supported as long as the trimmed line starts with one of these exact patterns. Any other line (headings, empty lines, plain bullets) is ignored.

::: info Task Name Length (30-Character Axis Limit)
To keep the Mermaid Gantt chart readable and prevent layout overflow, task names are automatically truncated to **30 characters** (followed by `...`) on the chart axis, while the full, uncropped task name remains visible in the collapsible task list (`Toggle Tasks`).
:::

## 2. Defining Time Intervals

To place a task accurately on the daily timeline, you need to provide a start and end time.

*   **Format:** The time must be formatted as `HH:MM-HH:MM` using a 24-hour clock (single-digit hours/minutes like `8:05` are automatically padded to `08:05`).
*   **Default Prefix:** By default, the script looks for an interval emoji (an axe `⛏️` followed by a space) directly in the task text to define the interval. You can also configure `intervalPrefix` in the settings to customize the text or emoji used to find the interval.
*   **Milestones:** If the start time and end time are exactly the same (e.g., `⛏️ 14:00-14:00`), the script will render it as a diamond **milestone** in the Gantt chart.

::: warning Handling Tasks Without Intervals
By default (`excludeTasksWithoutInterval: true`), any tasks without a valid `HH:MM-HH:MM` time interval are ignored entirely. If you set `excludeTasksWithoutInterval` to `false` (or set the corresponding `exclude_tasks_without_interval: "false"` Obsidian property), tasks without an interval are assigned a default milestone time of `08:00` on their target date.
:::

```markdown
// Invalid: Missing the interval prefix (interval will not be detected)
- [ ] Team meeting 09:00-10:30 ⏳ 2026-08-25

// Valid: Example using the default interval prefix (⛏️)
- [ ] Read documentation ⛏️ 11:00-11:30 ⏳ 2026-08-25
```

## 3. Assigning Dates

The script needs to know *which day* the task belongs to. It looks for dates in the strict `YYYY-MM-DD` format.

You associate dates with tasks using prefixes. By default, the script uses the specific delimiters provided by the **Obsidian Tasks** plugin, but you can also customize them if you have modified your Tasks plugin behavior (see the [Configuration](./04-configuration.md) section).

The script tracks three main types of dates:
* **Scheduled Date** (`scheduledPrefix`): Uses the default prefix `⏳` (e.g., `⏳ 2026-08-25`)
* **Due Date** (`duePrefix`): Uses the default prefix `📅` (e.g., `📅 2026-08-25`)
* **Completion Date** (`completionPrefix`): Uses the default prefix `✅` (e.g., `✅ 2026-08-25`)

If a task has a valid Completion Date (`✅`), the script will automatically mark its status as `done` on the chart. Otherwise, it remains `active`.

```markdown
// Examples of tasks using Obsidian Tasks plugin date prefixes
- [ ] Prepare project pitch ⛏️ 09:00-10:00 ⏳ 2026-08-25
- [ ] Submit final budget ⛏️ 14:00-14:00 📅 2026-08-25
- [x] Client review meeting ⛏️ 11:00-12:00 📅 2026-08-25 ✅ 2026-08-25
```

## 4. Date Priority Logic

What happens if a task has multiple dates (e.g., it was scheduled for Monday, due on Tuesday, and completed on Wednesday)?

The script uses a strict priority hierarchy (`chooseTaskDate`) to determine which date to use for the timeline display. It checks the dates in the following order (from highest to lowest priority):

1. **Completion Date (`✅`):** If present, it is always used first.
2. **Due Date (`📅`):** Used if no completion date is found.
3. **Scheduled Date (`⏳`):** Used if neither completion nor due dates are found.
4. **File Name Date (Fallback):** If no inline dates are found in the task text, and the `fallbackToFileDate` setting is enabled (`true` by default), the script will extract a `YYYY-MM-DD` date from the name of the Markdown file itself.

```markdown
// Example 1: Has both Scheduled and Due dates (Due wins, placed on 2026-08-26)
- [ ] Review designs ⛏️ 10:00-11:00 ⏳ 2026-08-25 📅 2026-08-26

// Example 2: Has Scheduled, Due, and Completion dates (Completion wins, marked done on 2026-08-27)
- [x] Finalize report ⛏️ 15:00-16:00 ⏳ 2026-08-25 📅 2026-08-26 ✅ 2026-08-27
```

::: info Daily Notes (`YYYY-MM-DD.md`)
The file name fallback feature is incredibly useful if you use Daily Notes in Obsidian. If your file is named `2026-08-25.md`, you only need to write the time intervals on your tasks—the script will automatically assign them to August 25th!
:::

## 5. Targeting Locations (`includeLocations`)

By default, the script scans your entire vault for tasks (represented by the wildcard `"*"`). However, you can restrict the timeline to specific files or folders by setting the `includeLocations` property in your Dataview `input` object (or the `include_locations` property in your note's YAML frontmatter).

* **Entire Vault (`"*"` - Default):** Scans all Markdown notes across the entire vault.
* **Active Note Only (`"@currentFile"`):** Restricts task extraction strictly to the Markdown file where the Gantt chart is currently rendered.
* **Single Folder:** Limit tasks to a specific directory name or path (e.g., `"Projects"` or `"Projects/Active"`).
* **Multiple Folders:** Separate multiple folders with commas (e.g., `"Projects, Journal, Work"`).

::: info Automatic Exclusion of Dashboard Notes (`dataview` Frontmatter)
When scanning the vault, `fetchAllTasks()` automatically skips any Markdown file that defines a `dataview` key in its YAML frontmatter (e.g., `dataview: true`). This prevents dashboard or configuration notes from polluting your timeline.
:::

### Example with Dataview

```dataviewjs
// Render the Gantt timeline scanning only the Projects and Journal folders
dv.view("Scripts/dataview/timeline", {
    includeLocations: "Projects, Journal",
    excludeTasksWithoutInterval: true
});
```

## 6. Targeting Tags (`includeTags`)

You can also filter tasks based on specific tags by setting the `includeTags` property in your DataviewJS `input` object (or the `include_tags` property in your note's YAML frontmatter).

* **Default (`""`):** Empty string by default, meaning all tasks are included regardless of tags.
* **Single Tag:** Require a specific tag to be present on the task line (e.g., `"#project"`).
* **Multiple Tags (AND Logic):** Separate multiple tags with commas to require tasks to contain **all** specified tags via `hasAllTags()` (e.g., `"#project, #work"`).
* **Automatic Tag Stripping (`removeTags`):** Any tag matched by `includeTags` is automatically stripped from the rendered task name so your Gantt chart labels and task list remain clean and uncluttered.

### Example with Dataview

```dataviewjs
// Render the Gantt timeline showing only tasks that contain BOTH #project and #work
dv.view("Scripts/dataview/timeline", {
    includeTags: "#project, #work",
    includeLocations: "*"
});
```