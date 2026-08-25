---
title: Installation & Integration
description: Learn how to add the Gantt timeline script to your Obsidian vault and render it in your notes.
---

# Installation & Integration

Because this script uses modular files and relies on external data, the cleanest way to run it in Obsidian is by using Dataview's `dv.view()` function. This keeps your markdown notes clean and allows you to easily update the script later.

## Step 1: Create a Scripts Folder

To keep your vault organized, it is highly recommended to store your Dataview scripts in a dedicated folder.

1. Open your Obsidian vault.
2. Create a new folder at the root of your vault called `Scripts`.
3. Inside `Scripts`, create a sub-folder named `dataview`.
4. Place the bundled script file (typically named `view.js`) inside this `Scripts/dataview` folder.

## Step 2: Call the Script in a Note

Once the script is safely in your vault, you can render the Gantt chart in any Markdown note. You will do this by creating a `dataviewjs` code block.

Create a new note or open an existing one, and insert the following code block:

```dataviewjs
// Render the Gantt timeline using the script located in our Scripts folder
dv.view("Scripts/dataview/timeline", {
    // You can pass configuration inputs here later
    includeLocations: "*",
    excludeTasksWithoutInterval: true
});
```

The script accepts an `input` object. The `dv.view()` command takes the file path as its first argument and this `input` object as its second argument. The script will automatically read these properties (like `includeLocations` or `excludeTasksWithoutInterval`) to filter your tasks.

## Step 3: Troubleshooting the Integration

If the chart does not appear, check the following common issues:

* **File Path Accuracy:** Ensure the path `Scripts/dataview` exactly matches the folder structure in your vault.
* **Javascript Enabled:** Double-check that JavaScript queries are enabled in the Dataview plugin settings.
* **Task Formats:** Ensure your vault actually contains Markdown tasks (`- [ ]` or `- [x]`) with valid time intervals, as the script specifically looks for these to generate the Mermaid diagram.
