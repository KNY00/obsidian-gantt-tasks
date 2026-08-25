---
title: Examples & Snippets
description: Copy and paste these examples to quickly set up the Gantt timeline in your vault.
---

# Examples & Snippets

Here are some common ways to configure and use the script within your vault. You can copy these `dataviewjs` snippets directly into your notes.

## 1. Minimal Setup (Current File Only)

If you use daily notes and write your tasks directly in them, you only need to scan the current file[cite: 1]. The script will automatically use the file's name to assign a date to your tasks if `fallbackToFileDate` is active[cite: 1].

```javascript
// Call the script and restrict the search to the current file
dv.view("Scripts/dataview/timeline", {
    includeLocations: "@currentFile"
});

```

## 2. Advanced Filtering (Projects and Tags)

If you want to create a master dashboard that pulls tasks from a specific folder (e.g., your "Projects" folder) but only shows tasks that are tagged with `#urgent` or `#meeting`.

```javascript
// Advanced configuration for a master dashboard
dv.view("Scripts/dataview/timeline", {
    // Search only within the Projects folder
    includeLocations: "Projects",
    // Only include tasks that contain the #urgent or #meeting tags
    includeTags: "#urgent, #meeting",
    // Hide any task that does not have a defined time interval
    excludeTasksWithoutInterval: true
});

```

## 3. Customizing Prefixes (Obsidian Tasks Integration)

If you use emojis to mark your dates (a common practice with the Obsidian Tasks plugin), you can configure the script to parse those specific symbols.

```javascript
// Configuration with custom prefixes for dates and intervals
dv.view("Scripts/dataview/timeline", {
    includeLocations: "*",
    // Define custom emojis to parse scheduled, due, and completion dates
    scheduledPrefix: "⏳",
    duePrefix: "📅",
    completionPrefix: "✅",
    // Define a custom symbol for the time interval
    intervalPrefix: "🪓"
});
```