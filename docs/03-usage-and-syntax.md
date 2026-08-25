---
title: Usage & Task Syntax
description: Understand how to format your Markdown tasks so they appear correctly in the Gantt timeline.
---

# Usage & Task Syntax

For the script to successfully generate a Gantt chart, your tasks need to be formatted in a way that it can read. The script looks for specific Markdown task indicators, time intervals, and dates.

## 1. Basic Task Format

The script processes standard Markdown tasks. Every task must begin with either an open or checked checkbox:
*   Uncompleted tasks: `- [ ]`
*   Completed tasks: `- [x]` (or `- [X]`)

If a line does not start with one of these exact patterns, the script will ignore it.

## 2. Defining Time Intervals

To place a task accurately on the daily timeline, you need to provide a start and end time.

*   **Format:** The time must be formatted as `HH:MM-HH:MM` (using a 24-hour clock). 
*   **Milestones:** If the start time and end time are exactly the same (e.g., `14:00-14:00`), the script will render it as a milestone in the Gantt chart.

By default, the script looks for an interval emoji (an axe 🪓 by default) directly in the task text to define the interval. You can also configure an `intervalPrefix` in the settings to customize the text or emoji used to find the interval.

> [!important] Handling Tasks Without Intervals
> If no time interval is provided, the plugin will assign a default time at the start of the day *only if* the `excludeTasksWithoutInterval` setting (or the corresponding Obsidian Property) is set to `false`. If this is set to `true`, any tasks without a valid time interval will be ignored entirely.

```markdown
// !Example of an task with an invalid time interval
- [ ] Team meeting 09:00-10:30
// * Example using the default prefix (🪓)
- [ ] Read documentation 🪓 11:00-11:30
```

## 3. Assigning Dates

The script needs to know *which day* the task belongs to. It looks for dates in the strict `YYYY-MM-DD` format.

You associate dates with tasks using prefixes. By default, the script uses the specific delimiters provided by the Obsidian Tasks plugin, but you can also configure them if you have modified your Tasks plugin behavior (see the [Configuration](./04-configuration.md) section). The script tracks three main types of dates:

* **Scheduled Date** (`scheduledPrefix`): Uses the Obsidian Tasks plugin default prefix ⏳
* **Due Date** (`duePrefix`): Uses the Obsidian Tasks plugin default prefix 📅
* **Completion Date** (`completionPrefix`): Uses the Obsidian Tasks plugin default prefix ✅

If a task has a valid Completion Date, the script will automatically mark its status as `done` on the chart. Otherwise, it remains `active`.

```markdown
// Examples of tasks using Obsidian Tasks plugin date prefixes
- [ ] Prepare project pitch 🪓 09:00-10:00 ⏳ 2026-08-25
- [ ] Submit final budget 🪓 14:00-14:00 📅 2026-08-25
- [x] Client review meeting 🪓 11:00-12:00 ✅ 2026-08-25
```

## 4. Date Priority Logic

What happens if a task has multiple dates (e.g., it was scheduled for Tuesday, but completed on Wednesday)?

The script uses a strict priority system to determine which date to use for the timeline display. It checks the dates in the following order (from highest to lowest priority):

1. **Completion Date:** If this is present, it is always used first.


2. **Due Date:** Used if no completion date is found.


3. **Scheduled Date:** Used if neither completion nor due dates are found.


4. **File Name (Fallback):** If no dates are found in the task text, and the `fallbackToFileDate` setting is enabled, the script will try to extract a `YYYY-MM-DD` date from the name of the Markdown file itself.

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