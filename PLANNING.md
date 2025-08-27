# LLM Prompt Library Chrome Extension - Planning Document

## Project Overview

A Chrome extension that allows users to organize, manage, and quickly copy pre-written prompts for use with any LLM interface (ChatGPT, Claude, Gemini, etc.). Users can organize prompts in folders by category and copy them with a single click.

## Core User Experience

### Primary User Flow
1. User clicks extension icon in toolbar
2. Extension popup opens showing folder structure
3. User navigates to desired category (e.g., Programming > Code Review)
4. User sees list of prompt titles with brief descriptions
5. User clicks on prompt to copy to clipboard
6. User pastes (Ctrl+V) into any LLM chat interface
7. Extension popup auto-closes after copy

### Key Features
- **Organized Folders**: Hierarchical organization (Programming, Business, Personal, etc.)
- **Quick Copy**: One-click copying to clipboard
- **Search Functionality**: Find prompts across all categories
- **Favorites**: Star frequently used prompts for quick access
- **Preview**: Hover or click to see full prompt before copying

## Technical Architecture

### Extension Structure
```
LLMPromptLibrary/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup/
│   ├── popup.html         # Main UI interface
│   ├── popup.css          # Styling
│   └── popup.js           # UI logic and interactions
├── background/
│   └── background.js      # Service worker for storage management
├── assets/
│   ├── icons/            # Extension icons (16, 32, 48, 128px)
│   └── images/           # UI images/graphics
└── data/
    └── default-prompts.json # Initial prompt library
```

### Data Structure
```json
{
  "folders": {
    "programming": {
      "name": "Programming",
      "icon": "code",
      "subfolders": {
        "code-review": {"name": "Code Review"},
        "debugging": {"name": "Debugging"},
        "documentation": {"name": "Documentation"}
      }
    },
    "business": {
      "name": "Business", 
      "icon": "briefcase",
      "subfolders": {
        "emails": {"name": "Email Templates"},
        "proposals": {"name": "Proposals"}
      }
    }
  },
  "prompts": [
    {
      "id": "uuid-1",
      "title": "Code Review Checklist",
      "description": "Comprehensive code review prompt",
      "content": "Please review this code for...",
      "category": "programming/code-review",
      "tags": ["review", "quality", "best-practices"],
      "favorite": false,
      "created": "2024-01-01T00:00:00Z",
      "lastUsed": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Core Technologies
- **Manifest V3**: Latest Chrome extension standard
- **Chrome Storage API**: For persisting prompts and settings
- **Clipboard API**: For copying prompts to clipboard
- **HTML/CSS/Vanilla JS**: Lightweight, fast UI

## Feature Specifications

### Folder Management
- **Default Categories**: Programming, Business, Personal, Creative Writing, Research, Education
- **Custom Folders**: Users can create/edit/delete folders
- **Nested Structure**: Support 2-3 levels of nesting maximum
- **Folder Icons**: Predefined icons for visual organization

### Prompt Management
- **Add Prompts**: Manual entry via form, import from text file
- **Edit Prompts**: In-place editing of title, description, content
- **Delete Prompts**: With confirmation dialog
- **Duplicate Detection**: Warn when similar prompts exist
- **Character Limits**: Title (100), Description (200), Content (5000)

### Search & Discovery
- **Global Search**: Search across all prompts by title, description, tags
- **Filter by Category**: Show prompts from specific folders only
- **Recent/Frequently Used**: Quick access to commonly used prompts
- **Favorites System**: Star system for bookmarking best prompts

### Import/Export
- **Backup**: Export entire library to JSON file
- **Restore**: Import from JSON backup
- **Share**: Export individual prompts or folders
- **Templates**: Import community-shared prompt collections

## User Interface Design

### Popup Window (320x500px)
- **Header**: Search bar + settings gear icon
- **Sidebar**: Folder tree navigation (collapsible)
- **Main Content**: Prompt list with titles and descriptions
- **Footer**: Add prompt button + import/export options

### Prompt List Item
```
[★] Prompt Title Here                    [📋]
    Brief description of what this prompt does...
    Tags: review, quality, javascript
```

### Interaction States
- **Hover**: Show preview tooltip with full prompt
- **Click**: Copy to clipboard + show "Copied!" feedback
- **Right-click**: Context menu (Edit, Delete, Favorite)

## Development Phases

### Phase 1: Core Functionality (MVP)
- Basic folder structure with default categories
- Add/edit/delete prompts
- Copy to clipboard functionality
- Simple search
- Chrome storage integration

### Phase 2: Enhanced UX
- Drag & drop organization
- Favorites system
- Import/export functionality
- Better visual design
- Keyboard shortcuts

### Phase 3: Advanced Features
- Prompt variables/placeholders
- Advanced search filters
- Bulk operations (move/delete multiple prompts)
- Prompt templates with customizable fields

## Technical Considerations

### Chrome Extension Requirements
- **Permissions**: `storage`, `clipboardWrite`
- **Manifest V3**: Service worker instead of background pages
- **CSP Compliance**: No inline scripts, secure content loading
- **Cross-origin**: Works on any website with LLM interfaces

### Performance
- **Storage Limits**: Chrome local storage ~5MB
- **Memory Usage**: Minimize DOM elements for large prompt collections
- **Search Performance**: Implement efficient filtering for 1000+ prompts

### Security & Privacy
- **Local Storage Only**: No external servers required
- **No Network Requests**: Fully offline functionality
- **User Data**: Never transmitted, always local to user's browser

## Success Metrics
- **Core Functionality**: Extension loads quickly and copy function works reliably
- **User Experience**: Intuitive navigation and organization system
- **Performance**: Smooth operation with large prompt libraries (500+ prompts)

## Future Enhancements
- **Prompt Variables**: Customizable placeholders (e.g., {project_name}, {language})
- **Prompt Chaining**: Link prompts together for workflows
- **Better Organization**: Color coding, custom icons for folders
- **Quick Actions**: Keyboard shortcuts for common operations