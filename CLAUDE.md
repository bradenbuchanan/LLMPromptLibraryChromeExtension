# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Since this is a Chrome extension with no build system, development is done by:
- Loading the extension as "unpacked" in Chrome at `chrome://extensions/`
- Reloading the extension after making changes
- No compilation, bundling, or testing framework is used

## Architecture Overview

This is a Manifest V3 Chrome extension for organizing and copying LLM prompts. The architecture follows Chrome extension conventions:

### Core Structure
- **manifest.json**: Extension configuration with permissions and entry points
- **popup/**: Main UI shown when clicking the extension icon
  - `popup.html`: UI structure with folder tree and prompt list
  - `popup.css`: Styling for the popup interface
  - **Modular JavaScript Architecture** (refactored from single popup.js):
    - `defaultData.js`: Default prompts and folder definitions
    - `storage.js`: Chrome storage operations and data persistence
    - `promptManager.js`: Prompt CRUD operations, filtering, import/export
    - `folderManager.js`: Folder management operations
    - `ui.js`: DOM manipulation, rendering, and UI interactions
    - `app.js`: Main application controller and event coordination
- **background/**: Service worker for extension lifecycle
  - `background.js`: Handles installation, storage management, and cleanup
- **assets/icons/**: Extension icons (16x16, 32x32, 48x48, 128x128px)

### Data Management
- Uses Chrome's `chrome.storage.local` API exclusively - no external storage or network requests
- Data structure includes:
  - `prompts`: Array of prompt objects with id, title, description, content, category, tags, favorite status
  - `folders`: Hierarchical folder structure for organization
  - Categories follow path format: `programming/code-review`, `business/emails`, etc.

### Key Features
- Folder-based organization with expandable tree navigation
- One-click copying to clipboard using Clipboard API with fallback
- Search across titles, descriptions, and tags
- Favorites system with star toggle
- Import/export functionality via JSON files
- Modal-based editing and creation forms

### Extension Permissions
- `storage`: Only permission required - for local data persistence
- Uses modern Clipboard API (navigator.clipboard) which requires user interaction but no manifest permissions
- No network permissions - extension works entirely offline

### Privacy & Security
- All data stays local to user's browser
- No external network requests or data transmission
- No tracking or analytics

## Code Patterns

The codebase uses vanilla JavaScript with:
- DOM manipulation for UI updates
- Chrome extension APIs for storage and clipboard access
- Event delegation for dynamic content interaction
- Modular class-based architecture with clear separation of concerns
- Extensive console logging for debugging

### Modular Architecture (Refactored December 2024)

The JavaScript is organized into 6 focused modules:

1. **`DefaultData`** class - Static methods for default prompts and folders
2. **`StorageManager`** class - Chrome storage operations (load, save, clear, debug)
3. **`PromptManager`** class - All prompt operations (CRUD, search, import/export, copy)
4. **`FolderManager`** class - Folder operations (create, edit, delete, naming)
5. **`UI`** class - DOM manipulation and rendering (folder tree, prompt list, modals)
6. **`App`** class - Main controller coordinating all modules and handling events

### Key Architectural Decisions

- **Static Classes**: All modules use static methods for simplicity and global access
- **Event-Driven**: App class coordinates between modules using event handlers
- **Immutable Operations**: Data operations return new objects rather than mutating state
- **Separation of Concerns**: Each module has a single responsibility
- **Preserved Functionality**: All original features maintained during refactor

### Entry Point

The `App` class initializes on DOM ready, loads data via `StorageManager`, and sets up event listeners. The original single-file approach has been completely replaced with this modular system.