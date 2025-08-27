# LLM Prompt Library Chrome Extension

A Chrome extension that helps you organize, manage, and quickly copy pre-written prompts for use with any LLM interface (ChatGPT, Claude, Gemini, etc.).

## Features

- 📁 **Organized Categories**: Sort prompts into folders (Programming, Business, Personal, Creative, Research)
- 🔍 **Quick Search**: Find prompts across all categories instantly
- ⭐ **Favorites System**: Star your most-used prompts for quick access
- 📋 **One-Click Copy**: Copy prompts to clipboard with a single click
- ➕ **Easy Management**: Add, edit, and delete prompts through intuitive UI
- 📥 **Import/Export**: Backup and share your prompt library
- 🔒 **Privacy-First**: All data stored locally, no external servers

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download or Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top right corner
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store once reviewed and approved.

## Usage

### Basic Usage

1. **Click the extension icon** in your Chrome toolbar
2. **Navigate folders** using the sidebar (Programming, Business, etc.)
3. **Find your prompt** by browsing or using the search bar
4. **Click on a prompt** to copy it to your clipboard
5. **Paste (Ctrl+V)** into any LLM chat interface

### Managing Prompts

#### Adding New Prompts
- Click the **➕ button** in the top right of the popup
- Fill in the form with title, description, category, content, and optional tags
- Click **Save** to add the prompt to your library

#### Editing Prompts
- Click the **✏️ edit button** on any prompt
- Modify the details in the modal form
- Click **Save** to update the prompt

#### Organizing Prompts
- Use the **⭐ favorite button** to star frequently used prompts
- Access favorites quickly from the "Favorites" folder
- Organize prompts into categories when adding or editing

### Import/Export

#### Exporting Your Library
- Click **Export** button at the bottom of the popup
- Save the JSON file as a backup of your entire prompt library
- Share the file with others or use it to sync between devices

#### Importing Prompts
- Click **Import** button at the bottom of the popup
- Select a JSON file exported from this extension
- New prompts will be added to your existing library (duplicates won't overwrite)

## Default Categories

The extension comes with these pre-organized categories:

- **⭐ Favorites**: Your starred prompts
- **💻 Programming**: Code review, debugging, documentation
- **💼 Business**: Email templates, proposals, meeting follow-ups
- **👤 Personal**: Goal planning, decision-making frameworks
- **🎨 Creative**: Brainstorming, story outlines, creative writing
- **🔬 Research**: Literature reviews, research summaries

## Sample Prompts

The extension includes 12 professionally crafted sample prompts across all categories to get you started:

- Code Review Checklist
- Debug Analysis Framework
- Professional Email Templates
- Business Proposal Outline
- Research Summary Template
- Creative Brainstorming Guide
- And more...

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: Storage only (no network access required)
- **Storage**: Uses Chrome's local storage API (up to 5MB)
- **Privacy**: All data remains on your device, never transmitted externally
- **Performance**: Optimized for libraries with 500+ prompts

## File Structure

```
LLMPromptLibrary/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html         # Main UI interface
│   ├── popup.css          # Styling
│   ├── app.js             # Main application controller
│   ├── ui.js              # DOM manipulation and rendering
│   ├── promptManager.js   # Prompt CRUD operations
│   ├── folderManager.js   # Folder management
│   ├── storage.js         # Chrome storage operations
│   └── defaultData.js     # Default prompts and folders
├── background/
│   └── background.js      # Service worker
├── assets/
│   └── icons/            # Extension icons
└── README.md             # This file
```

## Development

### Prerequisites
- Chrome browser (version 88+)
- Basic understanding of HTML, CSS, and JavaScript

### Local Development
1. Clone the repository
2. Make changes to the code
3. Go to `chrome://extensions/` and click the reload button for your extension
4. Test your changes in the popup

### Architecture
The extension uses a modular JavaScript architecture with separate files for different concerns:
- **app.js**: Main controller coordinating all modules
- **ui.js**: DOM manipulation and rendering
- **promptManager.js**: Prompt operations (CRUD, search, import/export)
- **folderManager.js**: Folder management operations
- **storage.js**: Chrome storage API interactions
- **defaultData.js**: Default prompts and folder definitions

### Adding Custom Icons
Place your icon files in the `assets/icons/` directory with these sizes:
- `icon16.png` (16x16)
- `icon32.png` (32x32) 
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## Troubleshooting

### Extension Won't Load
- Ensure you've enabled Developer Mode in Chrome
- Check that all required files are present in the extension folder
- Look for error messages in the Chrome Extensions page

### Prompts Not Copying
- Ensure you're clicking directly on prompts (clipboard access requires user interaction)
- Try reloading the extension
- Check if your browser blocks clipboard access for extensions

### Data Not Saving
- Ensure Chrome has sufficient storage space
- Check Chrome's storage permissions
- Try restarting the browser

## Privacy & Security

- **Local Storage Only**: All data stored locally on your device
- **No Network Requests**: Extension works entirely offline
- **No Data Collection**: We don't collect or transmit any user data
- **Open Source**: Code is available for audit and contribution

## Contributing

We welcome contributions! Please feel free to:

1. Report bugs or request features via issues
2. Submit pull requests with improvements
3. Share useful prompts with the community
4. Suggest new categories or organizational improvements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter issues or have questions:
1. Check this README for common solutions
2. Look through existing GitHub issues
3. Create a new issue with detailed information about your problem

## Roadmap

Future enhancements we're considering:
- Prompt variables and placeholders
- Bulk operations for prompt management
- Advanced search filters
- Color coding and custom icons for folders
- Keyboard shortcuts for common operations

---

**Enjoy organizing your prompts and boosting your LLM productivity!** 🚀