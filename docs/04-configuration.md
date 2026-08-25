---
title: Configuration & Inputs
description: Customize the script's behavior using inputs and frontmatter properties.
---

# Configuration & Inputs

You can customize how the timeline renders tasks by passing properties into the `input` object of your `dv.view()` block, or by defining them in your note's [Obsidian properties](https://obsidian.md/help/properties). 

## How to Configure

Pass arguments directly when calling the script to apply settings specifically to that view:

```javascript
// Configure using the input object
dv.view("Scripts/dataview/timeline", {
    includeTags: "#project",
    fallbackToFileDate: true
});
```

Alternatively, you can set these values in the [Obsidian properties](https://obsidian.md/help/properties) of the markdown file where the script is executed. The script checks the script's `input` parameters first, and if not provided, it falls back to checking the current page's properties.

> [!NOTE] All Properties Are Optional
> Every configuration property and input is completely optional. If omitted, the script automatically falls back to sensible default values as specified in the tables below.

> [!IMPORTANT] Property Types in Obsidian vs. JavaScript
> When setting boolean options (like `fallbackToFileDate` or `excludeTasksWithoutInterval`) in your Obsidian frontmatter, you must use a text property with the string value `"true"` or `"false"` which will be evaluated as a boolean. In contrast, passing these directly inside the JavaScript `input` object accepts native JavaScript booleans (`true` or `false`) for convenience.
> 
> **Exception for `startDate` (`start_date`):** For date properties, use a **Date** property type in Obsidian frontmatter. This structures your input and provides a handy calendar date picker. This behavior may evolve based on future requirements.


## Filtering Options

Control exactly which tasks are pulled into the timeline by configuring location and tag filters.

### Property Mapping Reference

| Input Object | Property Equivalent |Description |
| --- | --- | --- |
| `includeLocations` | `include_locations` | Comma-separated folder paths to search.<br> Use `@currentFile` to only search the active note.<br> Use `*` to search the whole vault. |
| `includeTags` | `include_tags` | Comma-separated tags required for a task to be included. |
| `excludeTasksWithoutInterval` | `exclude_tasks_without_interval` | Hides tasks that lack a valid start and end time. |

### Input Object

| Property / Equivalent | type | Default | Example |
| --- | --- | --- | --- |
| `includeLocations` | string | `*` | `Projects, ...` `@currentFile` `*` |
| `includeTags` | string | `''` (empty) | `#project, #work` |
| `excludeTasksWithoutInterval` | boolean | `true` | `false` |

### Obsidian Properties

| Property | type | Default | Example |
| --- | --- | --- | --- |
| `include_locations` | string | `*` | `Projects, ...`<br> `@currentFile`<br> `*` |
| `include_tags` | string |`''` (empty) | `#project, #work` |
| `exclude_tasks_without_interval` | string | `'true'` | `'false'`<br>`'true'` |


## Display & Prefix Options

These settings tell the script how to parse your task text and what date to use as the baseline.

### Property Mapping Reference

| Input Object | Property Equivalent | Description |
| --- | --- | --- |
| `startDate` | `start_date` | The anchor date for the timeline. |
| `fallbackToFileDate` | `fallback_to_file_date` | If no dates are found in the task, extracts a date from the file name. |
| `scheduledPrefix` | N/A | Symbol preceding a scheduled date. |
| `duePrefix` | N/A | Symbol preceding a due date. |
| `completionPrefix` | N/A | Symbol preceding a completion date. |
| `intervalPrefix` | N/A | Symbol preceding the time interval. |

### Input Object

| Property / Equivalent | type | Default | Example |
| --- | --- | --- | --- |
| `startDate` | string | Date | Current Date | `2023-10-13` |
| `fallbackToFileDate` | boolean | `true` | `false` |
| `scheduledPrefix` | string | `⏳` (emoji) | `⏳` |
| `duePrefix` | string | `📅` (emoji) | `📅` |
| `completionPrefix` | string | `✅` (emoji) | `✅` |
| `intervalPrefix` | string | `🪓` (emoji) | `🪓` |

### Obsidian Properties

*(Note: Prefix configurations are only available via the Input Object and do not have Obsidian Property equivalents.)*

| Property | type | Default | Example |
| --- | --- | --- | --- |
| `start_date` | date | Current Date | `2023-10-13` |
| `fallback_to_file_date` | string | `'true'` | `'false'`<br>`'true'` |