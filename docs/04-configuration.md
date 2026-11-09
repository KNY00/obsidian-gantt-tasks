---
title: Configuration & Inputs
description: Customize the script's behavior using inputs and frontmatter properties.
---

# Configuration & Inputs

You can customize how the timeline renders tasks by passing properties into the `input` object of your `dv.view()` block, or by defining them in your note's [Obsidian properties](https://obsidian.md/help/properties) (YAML frontmatter).

## How to Configure

There are two ways to configure the script:

1. **Passing an `input` object directly to `dv.view()`** (uses `camelCase` property names):

```dataviewjs
// Configure using the input object inside your dataviewjs block
dv.view("Scripts/dataview/timeline", {
    includeTags: "#project",
    fallbackToFileDate: true
});
```

2. **Defining [Obsidian properties](https://obsidian.md/help/properties) (YAML frontmatter)** at the top of the Markdown file where the script is executed (uses `snake_case` property names):

```yaml
---
include_locations: "Projects, Journal"
include_tags: "#project"
start_date: 2026-08-25
fallback_to_file_date: "true"
exclude_tasks_without_interval: "true"
---
```

::: info All Properties Are Optional
Every configuration property and input is completely optional. If omitted, the script automatically falls back to sensible default values as specified in the tables below.
:::

::: warning Property Types in Obsidian vs. JavaScript
When setting boolean options (like `fallbackToFileDate` or `excludeTasksWithoutInterval`) in your Obsidian frontmatter, you must use a **text property** with the quoted string value `"true"` or `"false"` (case-insensitive, whitespace-trimmed), which will be evaluated as a boolean by `src/utils/normalize.ts`. In contrast, passing these directly inside the JavaScript `input` object accepts native JavaScript booleans (`true` or `false`) for convenience.

**Exception for `startDate` (`start_date`):** For date properties, use a **Date** property type in Obsidian frontmatter (unquoted `YYYY-MM-DD`). This structures your input as a date object (`{ year, month, day }`) and provides a handy calendar date picker in Obsidian.
:::

---

## 1. Configuration Priority & Resolution Hierarchy

For every option that supports both `dv.view()` inputs and Obsidian frontmatter properties, `src/utils/normalize.ts` resolves the active value in the following strict order:

1. **`dv.view()` `input` Object (`camelCase`) — Highest Priority:** Checked first. If a valid value of the expected type is passed in `dv.view("Scripts/dataview/timeline", { ... })`, it immediately overrides any frontmatter property.
2. **Obsidian Frontmatter Property (`snake_case`) — Medium Priority:** If the option is omitted from `input`, the script inspects `dv.current()` to read the active note's YAML frontmatter.
3. **Built-in Default Value — Lowest Priority:** If neither `input` nor frontmatter defines a valid value, the hardcoded default is used.

```markdown
---
include_locations: "Journal"
exclude_tasks_without_interval: "false"
---

```dataviewjs
// Here, includeLocations ("Projects") overrides frontmatter ("Journal"),
// while excludeTasksWithoutInterval is omitted in JS so it falls back to frontmatter ("false").
dv.view("Scripts/dataview/timeline", {
    includeLocations: "Projects"
});
```

## 2. Filtering Options

Control exactly which tasks are pulled into the timeline by configuring location, tag, and time-interval filters.

### Property Mapping Reference

| Input Object (`camelCase`) | Property Equivalent (`snake_case`) | Description |
| :--- | :--- | :--- |
| `includeLocations` | `include_locations` | Comma-separated folder paths to search.<br>Use `@currentFile` to only search the active note.<br>Use `*` to search the whole vault. |
| `includeTags` | `include_tags` | Comma-separated tags required for a task to be included (`AND` logic). Matched tags are automatically stripped from the displayed task name. |
| `excludeTasksWithoutInterval` | `exclude_tasks_without_interval` | Hides tasks that lack a valid `HH:MM-HH:MM` start and end time. |

### Input Object

| Property / Equivalent | Type | Default | Example |
| :--- | :--- | :--- | :--- |
| `includeLocations` | `string` | `"*"` | `"Projects, Journal"`<br>`"@currentFile"`<br>`"*"` |
| `includeTags` | `string` | `""` (empty) | `"#project, #work"` |
| `excludeTasksWithoutInterval` | `boolean` | `true` | `false` |

### Obsidian Properties

| Property | Type | Default | Example |
| :--- | :--- | :--- | :--- |
| `include_locations` | `string` | `"*"` | `"Projects, Journal"`<br>`"@currentFile"`<br>`"*"` |
| `include_tags` | `string` | `""` (empty) | `"#project, #work"` |
| `exclude_tasks_without_interval` | `string` | `"true"` | `"false"`<br>`"true"` |

## 3. Display & Prefix Options

These settings tell the script how to parse your task text and what date to use as the baseline for the timeline.

### Property Mapping Reference

| Input Object (`camelCase`) | Property Equivalent (`snake_case`) | Description |
| :--- | :--- | :--- |
| `startDate` | `start_date` | The anchor date for the timeline (`YYYY-MM-DD`). |
| `fallbackToFileDate` | `fallback_to_file_date` | If no dates are found in the task (or for the initial `startDate`), extracts a `YYYY-MM-DD` date from the file name. |
| `scheduledPrefix` | N/A *(Input only)* | Symbol or keyword preceding a scheduled date. |
| `duePrefix` | N/A *(Input only)* | Symbol or keyword preceding a due date. |
| `completionPrefix` | N/A *(Input only)* | Symbol or keyword preceding a completion date. |
| `intervalPrefix` | N/A *(Input only)* | Symbol or keyword preceding the `HH:MM-HH:MM` time interval. |

### Input Object

| Property / Equivalent | Type | Default | Example |
| :--- | :--- | :--- | :--- |
| `startDate` | `string` | Current Date / File Date | `"2026-08-25"` |
| `fallbackToFileDate` | `boolean` | `true` | `false` |
| `scheduledPrefix` | `string` | `"⏳"` (emoji) | `"⏳"` or `"sched:"` |
| `duePrefix` | `string` | `"📅"` (emoji) | `"📅"` or `"due:"` |
| `completionPrefix` | `string` | `"✅"` (emoji) | `"✅"` or `"done:"` |
| `intervalPrefix` | `string` | `"⛏️"` (emoji) | `"⛏️"` or `"time:"` |

### Obsidian Properties

*(Note: Prefix configurations are only available via the `dv.view()` Input Object and do not have Obsidian Property equivalents.)*

| Property | Type | Default | Example |
| :--- | :--- | :--- | :--- |
| `start_date` | `date` | Current Date / File Date | `2026-08-25` |
| `fallback_to_file_date` | `string` | `"true"` | `"false"`<br>`"true"` |

## 4. Deep-Dive into Every Option

### 4.1 `startDate` / `start_date` (4-Level Resolution)
Determines the initial anchor date displayed when the timeline loads (before clicking **Prev** or **Next**). The function `getStartDate()` in `src/utils/normalize.ts` checks **four sources** in order:
1. **`input.startDate`:** A valid `"YYYY-MM-DD"` string passed in `dv.view()`.
2. **`current.start_date`:** A valid calendar date object in the note's YAML frontmatter (parsed automatically by Obsidian/Dataview when you write `start_date: 2026-08-25`).
3. **Current Note Filename (`dateFromTaskPath`):** If `fallbackToFileDate` is `true` (default) and the current note is named `YYYY-MM-DD.md` (e.g., `Journal/2026-08-25.md`), that date is used.
4. **System Date (`getCurrentDateString()`):** Falls back to today's local calendar date in `YYYY-MM-DD` format.

### 4.2 `fallbackToFileDate` / `fallback_to_file_date`
When enabled (`true` by default), `fallbackToFileDate` serves two purposes:
* **Task-level fallback (`buildTask`):** If a task line has no `✅`, `📅`, or `⏳` date, the script extracts the `YYYY-MM-DD` title of the file containing that task and uses it as the lowest-priority fallback date.
* **Timeline start-date fallback (`getStartDate`):** If neither `startDate` nor `start_date` is set, the timeline automatically centers on the date in the active note's filename.

### 4.3 `excludeTasksWithoutInterval` / `exclude_tasks_without_interval`
* When `true` *(default)*: Any task missing a valid `HH:MM-HH:MM` interval after `intervalPrefix` is filtered out by `getFilteredTasks()`.
* When `false`: Tasks that have a valid date but no time interval are kept and rendered on the Mermaid Gantt chart at `08:00` as a diamond **milestone** (`:milestone, t1, YYYY-MM-DD 08:00, YYYY-MM-DD 08:00`).

### 4.4 `includeLocations` / `include_locations`
Processed by `isFileMatchingLocation()` in `src/utils/path.ts`. Paths are normalized (Windows `\` converted to `/`, duplicate or leading/trailing slashes stripped, case-insensitive comparison):
* `"*"` *(default)*: Matches every Markdown file in the vault.
* `"@currentFile"`: Compares each file's path with `getCurrentMdFilePath()` so only tasks inside the currently open note are rendered.
* `"Journal, Projects/Active"`: Splits by comma and matches any file whose path starts with `folder/` or contains `/folder/`.

### 4.5 `includeTags` / `include_tags`
Processed by `hasAllTags()` and `removeTags()` in `src/utils/tags.ts`:
* **Multi-tag `AND` Filtering:** Passing `"#work, #urgent"` splits the string on commas, trims whitespace, and requires **every** listed tag to appear on the task line.
* **Clean Display Labels:** Once a task matches, `removeTags()` strips those tags from the task text before building the Gantt chart bar and task list item.

### 4.6 Customizing Prefixes (`scheduledPrefix`, `duePrefix`, `completionPrefix`, `intervalPrefix`)
If you prefer plain-text tokens over emojis, you can override any prefix in `dv.view()`. The parser `extractTokenAfterPrefix()` looks for the prefix followed by at least one space, and extracts the non-space token immediately after it:

```dataviewjs
// Use plain-text prefixes instead of emojis
dv.view("Scripts/dataview/timeline", {
    scheduledPrefix: "sched:",
    duePrefix: "due:",
    completionPrefix: "done:",
    intervalPrefix: "time:"
});
```

Matching tasks in your Markdown note:

```markdown
- [ ] Backend API refactoring time: 09:30-11:30 sched: 2026-08-25
- [x] Deploy hotfix to staging time: 14:00-14:45 due: 2026-08-25 done: 2026-08-25
```

## 5. Excluding Specific Notes (`dataview` Frontmatter Flag)

When `fetchAllTasks()` in `src/utils/tasks.ts` iterates over `dv.pages()`, it executes the following guard check:

```typescript
// Ignore files that contain the variable 'dataview' in their frontmatter
if (page.dataview !== undefined) {
    continue;
}
```

If you have dashboard notes, documentation pages, or task templates that contain sample tasks you **never** want to appear on your timelines, add `dataview: true` to their YAML frontmatter:

```yaml
---
dataview: true
---
```

## 6. Ready-to-Use Configuration Recipes

### Recipe 1: Daily Note Template (Zero-Boilerplate)
Place this in your Daily Note template (e.g., `Journal/2026-08-25.md`). Because `fallbackToFileDate` is `true` by default, the timeline automatically centers on `2026-08-25` and includes tasks written in the daily note even if they only specify `⛏️ HH:MM-HH:MM`:

```dataviewjs
// Automatically uses the Daily Note's YYYY-MM-DD filename as startDate
dv.view("Scripts/dataview/timeline", {
    includeLocations: "Journal, Projects"
});
```

### Recipe 2: Project Master Dashboard (Folder + Tag Filter)
Pull only tasks tagged with both `#sprint` and `#backend` from your `Projects` folder, and show unscheduled tasks as `08:00` milestones:

```dataviewjs
// Master project timeline filtering by folder and multiple required tags
dv.view("Scripts/dataview/timeline", {
    includeLocations: "Projects",
    includeTags: "#sprint, #backend",
    excludeTasksWithoutInterval: false,
    startDate: "2026-08-25"
});
```

### Recipe 3: Self-Contained Single-Note Schedule (`@currentFile`)
Render a timeline that **only** reads tasks from the current Markdown file:

```dataviewjs
// Restrict task scanning strictly to the active Markdown note
dv.view("Scripts/dataview/timeline", {
    includeLocations: "@currentFile",
    fallbackToFileDate: false
});
```