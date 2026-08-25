---
title: Introduction & Prerequisites
description: Discover the Gantt timeline script and what you need to get started in Obsidian.
---

# Introduction & Prerequisites

Welcome to the documentation for the Obsidian Gantt Timeline script! This guide will help you set up, configure, and use the script to visualize your daily tasks efficiently.

## What is it?

![Preview of the interactive Obsidian Gantt Timeline](/script.png#light-mode-only)
![Preview of the interactive Obsidian Gantt Timeline](/script-dark.png#dark-mode-only)

This tool is a custom Dataview script designed for Obsidian. It scans your vault for Markdown tasks (`- [ ]` or `- [x]`) and transforms them into an interactive Mermaid.js Gantt chart. By extracting dates and time intervals from your tasks, it provides a visual timeline of your day. 

## Key Features

*   **Interactive Timeline:** Navigate through days using built-in "Prev" and "Next" buttons without leaving your note.
*   **Toggleable Task List:** Quickly show or hide a text-based list of the rendered tasks directly beneath the chart.
*   **Smart Date Priority:** The script automatically chooses the most relevant date for a task, prioritizing the Completion date, then the Due date, the Scheduled date, or falling back to the file's name.
*   **Highly Customizable:** Filter tasks by specific tags, limit searches to specific folders, or adjust date prefix symbols to match your workflow.

---

## Prerequisites

Before installing the script, ensure your Obsidian vault meets the following requirements:

::: warning Required Plugin
You must have the **Dataview** plugin installed and enabled in your Obsidian vault. 
:::

To make the script work, you need to configure Dataview properly:
1.  Go to **Settings** > **Dataview**.
2.  Scroll down to the **Enable JavaScript Queries** option.
3.  Toggle it **ON**. (This is mandatory, as the script relies on `dataviewjs` blocks).

::: info Optional but Recommended: Obsidian Tasks
While not strictly required, this script pairs perfectly with the **Obsidian Tasks** plugin. The script is designed to easily parse standard task emojis (like scheduled or due dates) by configuring its prefix inputs.
:::