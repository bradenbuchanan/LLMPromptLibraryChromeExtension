# LLM Prompt Library Chrome Extension

## Overview

I built this Chrome extension to solve a problem I kept running into: recreating the same effective prompts over and over across different AI conversations. The extension provides instant access to a personal library of organized, reusable prompts that you can copy with a single click. Everything runs locally with zero external network requests, keeping your prompt library completely private.

The project is built with vanilla JavaScript using Chrome's Manifest V3 standard, leveraging the Chrome Storage API for persistence. The architecture follows a modular class-based design where each component has a single, well-defined responsibility.

```json
{
  "manifest_version": 3,
  "name": "LLM Prompt Library",
  "permissions": ["storage"],
  "action": {
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background/background.js"
  }
}
```

The minimal manifest demonstrates the privacy-first approach—only storage permissions are required, with no network access or host permissions.

## The Problem

Working with LLMs like ChatGPT and Claude is incredibly powerful, but it requires carefully crafted prompts for consistent results. I found myself repeatedly typing the same complex prompts across different sessions, losing track of which patterns worked well, and having no good way to organize everything by use case. There wasn't a centralized place to store these prompts, and backing up or sharing particularly effective ones with colleagues was basically impossible.

## The Solution

I created a lightweight Chrome extension that sits in your browser toolbar, ready whenever you need it. Click the icon and you get instant access to your organized prompt library. Everything is categorized into folders like Programming, Business, Creative, and Research, making it easy to find what you need. The extension handles all storage locally—no data ever leaves your machine—and includes JSON-based import/export functionality so you can back up your library or share collections with others. There's also a search function that works across titles, descriptions, and tags, plus a favorites system for your most-used prompts.

## Key Features

The core functionality centers around a folder tree navigation system that lets you expand and collapse categories, with full CRUD operations for both prompts and folders. Search works in real-time across titles, descriptions, and tags, so you can quickly find what you need even with hundreds of prompts. The clipboard integration uses the modern Clipboard API with a fallback for older browsers:

```javascript
static copyPrompt(prompt) {
  const safeContent = ValidationUtils.sanitizeContent(prompt.content);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(safeContent)
      .then(() => {
        prompt.lastUsed = new Date().toISOString();
        return true;
      })
      .catch(error => {
        console.error('Clipboard write failed:', error);
        return false;
      });
  } else {
    // Fallback for older browsers
    return new Promise((resolve) => {
      const textArea = document.createElement('textarea');
      textArea.value = safeContent;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        prompt.lastUsed = new Date().toISOString();
        resolve(true);
      } catch (error) {
        resolve(false);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }
}
```

This approach ensures one-click copying works across all Chrome versions while tracking usage metrics for each prompt.

On the data management side, everything integrates with Chrome's Storage API for reliable persistence. The storage layer validates and sanitizes all data on load:

```javascript
static async load() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['prompts', 'folders', 'settings'],
      function (result) {
        let prompts, folders;

        // Validate and sanitize prompts data
        if (result.prompts && Array.isArray(result.prompts)) {
          prompts = StorageManager.validateAndSanitizePrompts(result.prompts);
        } else {
          prompts = DefaultData.getPrompts();
        }

        // Validate and sanitize folders data
        if (result.folders && typeof result.folders === 'object') {
          folders = StorageManager.validateAndSanitizeFolders(result.folders);
        } else {
          folders = DefaultData.getFolders();
        }

        resolve({ prompts, folders });
    });
  });
}
```

You can export your entire library to JSON for backup or sharing, and import prompts from others without worrying about duplicates—the system validates and prevents conflicts automatically. The extension ships with 12 professionally crafted example prompts to get you started.

The technical architecture went through a significant evolution. I initially built everything as a single popup.js file that grew to around 800 lines. Once the features were working, I refactored it into a modular architecture with ten separate classes:

- **AppController.js** - Main application coordinator
- **EventManager.js** - Centralized event handling and delegation
- **StateManager.js** - Application state management
- **UI.js** - DOM manipulation and rendering
- **PromptManager.js** - CRUD operations for prompts
- **FolderManager.js** - Folder validation and organization
- **StorageManager.js** - Chrome Storage API abstraction
- **SettingsManager.js** - User preferences and configuration
- **ValidationUtils.js** - Data validation and sanitization
- **DefaultData.js** - Seed data and initial prompts

This refactor maintained 100% feature parity while making the codebase much more maintainable.

## Technical Highlights

The extension is built on Chrome's Manifest V3 standard, which means it uses service workers instead of the older background pages approach. This follows modern security best practices and ensures the extension will continue working as Chrome evolves.

Privacy and security were non-negotiable from the start. The extension only requests storage permissions—that's it. The Clipboard API I'm using is the modern version that doesn't require any manifest permissions at all. There are zero network requests; everything works completely offline. All user data stays on the device and is never transmitted anywhere. There's no analytics, no tracking, no telemetry of any kind.

Performance was another key consideration. I implemented efficient filtering algorithms that can handle libraries with 500+ prompts without any lag. The UI uses event delegation for dynamic content, which keeps memory usage low even when you're browsing through large collections. DOM manipulation is optimized to minimize reflows and keep everything snappy.

For the user experience, I went with modal-based forms that feel intuitive for creating and editing prompts. There's visual feedback for every action—copy confirmations, loading states, all the things you expect from a polished interface. The whole thing is designed to work within the 320x500px popup constraints, and I made sure the navigation patterns are keyboard-friendly for power users.

## Development Process

One of the most important technical decisions I made was to stick with vanilla JavaScript instead of bringing in a framework. Chrome extensions need to load fast, and avoiding framework overhead made a noticeable difference. I went with static classes for state management, which simplified how different parts of the app access shared data. The Chrome Storage API provided reliable persistence without any external dependencies, and I designed the folder system to use hierarchical paths like `programming/code-review` for maximum flexibility.

The folder structure leverages a path-based system that enables natural hierarchies:

```javascript
static getFolderName(folder) {
  const names = {
    all: 'All Prompts',
    favorites: 'Favorites',
    programming: 'Programming',
    'programming/code-review': 'Code Review',
    'programming/debugging': 'Debugging',
    'programming/documentation': 'Documentation',
    business: 'Business',
    'business/emails': 'Email Templates',
    'business/proposals': 'Proposals',
    personal: 'Personal',
    creative: 'Creative',
    research: 'Research'
  };
  return names[folder] || folder;
}
```

This path-based approach makes it trivial to identify parent-child relationships and filter prompts by category prefix matching.

There were definitely some interesting challenges along the way. The Clipboard API works great in modern Chrome, but I had to implement a fallback for older versions. Chrome's local storage has a 5MB limit, so I spent time optimizing the data structure to make sure users could store hundreds of prompts without hitting that ceiling.

Managing modal state was trickier than expected—handling events for multiple simultaneous modals required careful coordination. The import functionality needed smart merging logic so that importing new prompts wouldn't accidentally overwrite existing ones with similar names:

```javascript
static mergeImportedData(existingPrompts, importedPrompts) {
  const merged = [...existingPrompts];
  let addedCount = 0;
  let skippedCount = 0;

  for (const importedPrompt of importedPrompts) {
    // Check for duplicate by title and category
    const isDuplicate = existingPrompts.some(
      p => p.title === importedPrompt.title &&
           p.category === importedPrompt.category
    );

    if (!isDuplicate) {
      // Generate new ID for imported prompt
      merged.push({
        ...importedPrompt,
        id: `prompt_${Date.now()}_${Math.random()}`
      });
      addedCount++;
    } else {
      skippedCount++;
    }
  }

  return { merged, addedCount, skippedCount };
}
```

This collision detection prevents duplicate imports while giving users clear feedback about what was added versus skipped.

## Real-World Impact

I designed this extension for anyone who regularly works with LLMs—developers, writers, researchers, business professionals. The goal was to eliminate the tedious repetition of retyping the same prompts and instead create a knowledge base of proven prompts that actually improves over time. Software engineers can maintain code review templates that capture their team's standards. Content creators have standardized brainstorming frameworks ready to go. Researchers can store structured literature review prompts. Business professionals keep email and proposal templates at their fingertips.

### Data Model

The storage model is intentionally simple but powerful:

```javascript
// Prompt structure
{
  id: "prompt_1234567890",
  title: "Code Review Checklist",
  description: "Comprehensive code review template",
  content: "Please review this code for:\n- Logic errors\n- Performance issues...",
  category: "programming/code-review",
  tags: ["code", "review", "quality"],
  favorite: true,
  lastUsed: "2024-01-15T10:30:00.000Z"
}

// Folder structure
{
  "programming": {
    id: "programming",
    name: "Programming",
    path: "programming",
    parentId: null,
    expanded: true,
    subfolders: ["programming/code-review", "programming/debugging"]
  }
}
```

This structure supports 500+ prompts without performance degradation, with instant search powered by efficient filtering and lazy rendering for large folder trees. Each prompt tracks usage metadata for analytics, while the hierarchical folder system enables intuitive organization without complex tree traversal algorithms.

## What's Next

I'm planning several enhancements based on how people are actually using the extension:

**Prompt Variables & Placeholders**
```javascript
// Enable dynamic customization
"Review this {{language}} code for {{focus_areas}}"
// User fills in: language=Python, focus_areas=security,performance
```

**Keyboard Shortcuts**
- `Cmd/Ctrl + K` - Quick search
- `Cmd/Ctrl + N` - New prompt
- `Cmd/Ctrl + F` - Toggle favorites
- `Enter` - Copy selected prompt

**Advanced Search Filters**
```javascript
// Complex queries across multiple dimensions
{
  tags: ["code", "review"],
  dateRange: { start: "2024-01-01", end: "2024-12-31" },
  categories: ["programming/*"],
  favoriteOnly: false,
  sortBy: "lastUsed"
}
```

**Visual Enhancements**
- Color coding for folders (e.g., blue for programming, green for business)
- Custom emoji icons for quick visual identification
- Theme support (light/dark mode)

**Bulk Operations**
- Multi-select prompts with checkboxes
- Batch move/copy between folders
- Bulk tag editing
- Export selected prompts only

These features would maintain the extension's lightweight, privacy-first philosophy while significantly improving power user workflows.
