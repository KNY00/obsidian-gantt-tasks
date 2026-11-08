---
title: Installation & Integration
description: Learn how to add the Gantt timeline script to your Obsidian vault and render it in your notes.
---

# Installation & Integration

Because this script is bundled into a single standalone file, the cleanest way to run it in Obsidian is by using Dataview's `dv.view()` function. This keeps your Markdown notes clean and allows you to update the script in one place.

## Step 1: Place the Script in Your Vault

To keep your vault organized, store your Dataview scripts in a dedicated folder:

1. Open your Obsidian vault.
2. Create a new folder at the root of your vault called `Scripts`.
3. Inside `Scripts`, create a sub-folder named `dataview`.
4. Place the compiled **`timeline.js`** file (from the `dist/` directory) inside this `Scripts/dataview` folder so its path is `Scripts/dataview/timeline.js`.

::: tip Building & Auto-Syncing from Source (Developers)
If you cloned this repository to build or customize the script yourself:
1. Run `npm install` followed by `npm run build` to generate `dist/timeline.js`.
2. *(Optional)* Copy `.env.example` to `.env` and set `DEST_DIRS=["/absolute/path/to/your/vault/Scripts/dataview"]`. Running `npm run watch:dist` alongside `npm run dev` will automatically compile and copy `timeline.js` into your vault on every save.
:::

## Step 2: Call the Script in a Note

Once `timeline.js` is in your vault, you can render the Gantt chart in any Markdown note by creating a `dataviewjs` code block:

```dataviewjs
// Render the Gantt timeline using Scripts/dataview/timeline.js
dv.view("Scripts/dataview/timeline", {
    includeLocations: "*",
    excludeTasksWithoutInterval: true
});
```

The `dv.view()` function takes the script path (without the `.js` extension) as its first argument and an optional `input` configuration object as its second argument.

## Step 3: Troubleshooting the Integration

If the chart does not appear, check the following common issues:

* **File Name & Path Accuracy:** Ensure the file is named `timeline.js` and located at `Scripts/dataview/timeline.js` to match `dv.view("Scripts/dataview/timeline", ...)`.
* **JavaScript Queries Enabled:** Double-check that **Enable JavaScript Queries** is toggled **ON** in **Settings > Dataview**.
* **Frontmatter Conflict:** Ensure the notes containing your tasks do **not** have a `dataview:` property in their YAML frontmatter. The script intentionally skips any note where `page.dataview` is defined to avoid parsing dashboard/configuration files.
* **Task Formats:** Ensure your vault contains Markdown tasks (`- [ ]` or `- [x]`) with valid dates and time intervals (`⛏️ HH:MM-HH:MM`).