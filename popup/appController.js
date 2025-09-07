// Main application controller
// Coordinates between StateManager, EventManager, SettingsManager, and UI
class AppController {
  constructor() {
    this.stateManager = new StateManager();
    this.settingsManager = new SettingsManager();
    this.eventManager = new EventManager(this.stateManager, this.settingsManager);
    this.initialized = false;
  }

  // Initialize the application
  async init() {
    if (this.initialized) {
      console.warn('AppController already initialized');
      return;
    }

    try {
      // Initialize settings first (affects UI rendering)  
      await this.settingsManager.init();
      
      // Load data
      const loadResult = await this.stateManager.loadData();
      
      // If settings were loaded from storage, update the settings manager
      if (loadResult && loadResult.settings) {
        this.settingsManager.updateSettings(loadResult.settings);
      }
      
      // Set default folder from settings
      const defaultFolder = this.settingsManager.getDefaultFolder();
      if (defaultFolder && defaultFolder !== 'programming') {
        this.stateManager.setCurrentFolder(defaultFolder);
      }

      // Setup event listeners
      this.setupStateListeners();
      this.setupSettingsListeners();
      this.setupUIEventListeners();
      
      // Initialize DOM event manager
      this.eventManager.init();
      
      // Initial render
      this.render();
      
      this.initialized = true;
      console.log('AppController initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AppController:', error);
      this.handleInitializationError(error);
    }
  }

  // Setup listeners for state changes
  setupStateListeners() {
    // Data changes
    this.stateManager.addEventListener('dataLoaded', () => {
      this.render();
    });

    this.stateManager.addEventListener('dataSaved', () => {
      console.log('Data saved successfully');
    });

    this.stateManager.addEventListener('dataLoadFailed', ({ error }) => {
      console.error('Data load failed:', error);
      UI.showToast('Failed to load data');
    });

    // Prompt changes
    this.stateManager.addEventListener('promptAdded', ({ prompt }) => {
      this.renderPrompts();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Prompt added!');
      }
    });

    this.stateManager.addEventListener('promptUpdated', ({ prompt }) => {
      this.renderPrompts();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Prompt updated!');
      }
    });

    this.stateManager.addEventListener('promptDeleted', ({ deletedPrompt }) => {
      this.renderPrompts();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Prompt deleted!');
      }
    });

    this.stateManager.addEventListener('promptFavoriteToggled', ({ favorite }) => {
      this.renderPrompts();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast(favorite ? 'Added to favorites!' : 'Removed from favorites!');
      }
    });

    this.stateManager.addEventListener('promptCopied', ({ prompt }) => {
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Copied to clipboard!');
      }
      
      // Auto-close after copy if enabled
      if (this.settingsManager.getAutoCloseAfterCopy()) {
        window.close();
      }
    });

    // Folder changes
    this.stateManager.addEventListener('folderCreated', () => {
      this.renderFolders();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Folder created!');
      }
    });

    this.stateManager.addEventListener('folderEdited', () => {
      this.renderFolders();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Folder updated!');
      }
    });

    this.stateManager.addEventListener('folderDeleted', ({ folderName }) => {
      this.render();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast(`Folder "${folderName}" deleted!`);
      }
    });

    // Navigation changes
    this.stateManager.addEventListener('currentFolderChanged', () => {
      this.renderFolders();
      this.renderPrompts();
      UI.clearSearch();
    });

    this.stateManager.addEventListener('searchQueryChanged', () => {
      this.renderPrompts();
    });

    // Import/Export
    this.stateManager.addEventListener('promptsImported', ({ count }) => {
      this.renderPrompts();
      if (this.settingsManager.getShowToasts()) {
        UI.showToast(`Imported ${count} prompts!`);
      }
    });

    this.stateManager.addEventListener('promptsExported', () => {
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Prompts exported!');
      }
    });
  }

  // Setup listeners for settings changes
  setupSettingsListeners() {
    this.settingsManager.addEventListener('settingsLoaded', () => {
      console.log('Settings loaded');
    });

    this.settingsManager.addEventListener('settingsUpdated', () => {
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Settings saved!');
      }
    });

    this.settingsManager.addEventListener('settingsReset', () => {
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('Settings reset to defaults!');
      }
    });

    this.settingsManager.addEventListener('settingChanged', ({ key, value }) => {
      // Handle specific setting changes that affect other components
      if (key === 'defaultFolder') {
        this.stateManager.setCurrentFolder(value);
      }
    });
  }

  // Setup UI event listeners (from EventManager)
  setupUIEventListeners() {
    // Prompt events
    document.addEventListener('promptAddRequested', () => {
      this.openAddPromptModal();
    });

    document.addEventListener('promptActionRequested', (e) => {
      const { action, promptId } = e.detail;
      this.handlePromptAction(action, promptId);
    });

    document.addEventListener('promptSaveRequested', () => {
      this.savePrompt();
    });

    document.addEventListener('promptModalCloseRequested', () => {
      UI.closeModal();
    });

    // Folder events
    document.addEventListener('folderActionRequested', (e) => {
      const { action, folderId, event } = e.detail;
      this.handleFolderAction(action, folderId, event);
    });

    document.addEventListener('folderSaveRequested', () => {
      this.saveFolder();
    });

    document.addEventListener('folderModalCloseRequested', () => {
      UI.closeFolderModal();
    });

    document.addEventListener('folderDeleteRequested', (e) => {
      const { folderId } = e.detail;
      this.deleteFolder(folderId);
    });

    // Settings events
    document.addEventListener('settingsModalOpenRequested', () => {
      this.openSettingsModal();
    });

    document.addEventListener('settingsSaveRequested', () => {
      this.saveSettings();
    });

    document.addEventListener('settingsResetRequested', () => {
      this.resetSettings();
    });

    document.addEventListener('settingsModalCloseRequested', () => {
      UI.closeSettingsModal();
    });

    // Import/Export events
    document.addEventListener('importRequested', () => {
      this.importPrompts();
    });

    document.addEventListener('exportRequested', (e) => {
      const format = e.detail?.format || 'json';
      this.exportPrompts(format);
    });
  }

  // Rendering methods
  render() {
    this.renderFolders();
    this.renderPrompts();
  }

  renderFolders() {
    UI.renderFolderTree(
      this.stateManager.getFolders(),
      this.stateManager.getCurrentFolder(),
      () => {} // Event handling is managed by EventManager
    );
    UI.updateFolderSelection(this.stateManager.getCurrentFolder(), this.stateManager.getFolders());
  }

  renderPrompts() {
    const filteredPrompts = this.stateManager.getFilteredPrompts();
    UI.displayPrompts(filteredPrompts, () => {}); // Event handling is managed by EventManager
    
    // Refresh dynamic events after render
    this.eventManager.refreshDynamicEvents();
  }

  // Prompt action handlers
  handlePromptAction(action, promptId) {
    switch (action) {
      case 'copy':
        this.copyPrompt(promptId);
        break;
      case 'favorite':
        this.toggleFavorite(promptId);
        break;
      case 'edit':
        this.editPrompt(promptId);
        break;
      case 'delete':
        this.deletePrompt(promptId);
        break;
      case 'select':
        // Future: implement prompt preview/selection
        break;
    }
  }

  async copyPrompt(promptId) {
    await this.stateManager.copyPrompt(promptId);
  }

  toggleFavorite(promptId) {
    this.stateManager.toggleFavorite(promptId);
  }

  editPrompt(promptId) {
    const prompt = this.stateManager.getPromptById(promptId);
    if (!prompt) return;

    this.stateManager.setEditingPromptId(promptId);
    UI.openModal('edit', prompt, this.stateManager.getCurrentFolder(), this.stateManager.getFolders());
  }

  deletePrompt(promptId) {
    this.stateManager.deletePrompt(promptId);
  }

  openAddPromptModal() {
    this.stateManager.setEditingPromptId(null);
    UI.openModal('add', null, this.stateManager.getCurrentFolder(), this.stateManager.getFolders());
  }

  savePrompt() {
    try {
      const formData = UI.getFormData();
      const editingPromptId = this.stateManager.getEditingPromptId();

      if (editingPromptId) {
        this.stateManager.updatePrompt(editingPromptId, formData);
      } else {
        this.stateManager.addPrompt(formData);
      }

      UI.closeModal();
      this.stateManager.setEditingPromptId(null);
    } catch (error) {
      alert(error.message);
    }
  }

  // Folder action handlers
  handleFolderAction(action, folderId, event) {
    switch (action) {
      case 'select':
        this.selectFolder(folderId);
        if (event) {
          const clickedElement = event.target.closest('.folder-item');
          if (clickedElement) {
            UI.toggleSubfolder(clickedElement);
          }
        }
        break;
      case 'add-main':
        this.openFolderModal('add-main');
        break;
      case 'add-sub':
        this.openFolderModal('add-sub', folderId);
        break;
      case 'edit':
        this.editFolder(folderId);
        break;
      case 'delete':
        this.deleteFolder(folderId);
        break;
    }
  }

  selectFolder(folderId) {
    this.stateManager.setCurrentFolder(folderId);
  }

  openFolderModal(mode, parentFolderId = null) {
    this.stateManager.setEditingFolderId(null);
    this.stateManager.setFolderMode(mode);
    UI.openFolderModal(mode, parentFolderId, this.stateManager.getFolders(), null);
  }

  editFolder(folderId) {
    const folder = this.stateManager.getFolderById(folderId);
    if (!folder) return;

    // Prevent editing system folders
    const systemFolders = ['favorites', 'programming', 'business', 'personal', 'creative', 'research'];
    if (systemFolders.includes(folderId)) {
      if (this.settingsManager.getShowToasts()) {
        UI.showToast('System folders cannot be edited!');
      }
      return;
    }

    this.stateManager.setEditingFolderId(folderId);
    UI.openFolderModal('edit', null, this.stateManager.getFolders(), folderId);
  }

  saveFolder() {
    try {
      const formData = UI.getFolderFormData();
      const editingFolderId = this.stateManager.getEditingFolderId();

      if (!formData.name) {
        throw new Error('Folder name is required!');
      }

      if (editingFolderId) {
        this.stateManager.editFolder(editingFolderId, formData);
      } else {
        this.stateManager.createFolder(formData);
      }

      UI.closeFolderModal();
      this.stateManager.setEditingFolderId(null);
    } catch (error) {
      alert(error.message);
    }
  }

  deleteFolder(folderId) {
    this.stateManager.deleteFolder(folderId);
  }

  // Settings handlers
  openSettingsModal() {
    UI.openSettingsModal(this.settingsManager.getSettings());
  }

  saveSettings() {
    const formData = UI.getSettingsFormData();
    this.settingsManager.updateSettings(formData);
    UI.closeSettingsModal();
  }

  resetSettings() {
    this.settingsManager.resetToDefaults();
    UI.openSettingsModal(this.settingsManager.getSettings());
  }

  // Import/Export handlers
  importPrompts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = this.stateManager.importPrompts(e.target.result);
        if (!result.success) {
          alert(result.error);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  exportPrompts(format = 'json') {
    this.stateManager.exportPrompts(format);
  }

  // Error handling
  handleInitializationError(error) {
    console.error('Initialization failed:', error);
    
    // Try to initialize with defaults
    try {
      this.stateManager.resetToDefaults();
      this.settingsManager.resetToDefaults();
      this.render();
      UI.showToast('Initialized with defaults due to error');
    } catch (fallbackError) {
      console.error('Fallback initialization failed:', fallbackError);
      document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Failed to initialize application. Please reload.</div>';
    }
  }

  // Debug methods
  debugApp() {
    console.log('=== APP DEBUG ===');
    console.log('Initialized:', this.initialized);
    this.stateManager.debugState();
    this.settingsManager.debugSettings();
    this.eventManager.debugEvents();
  }

  // Cleanup
  destroy() {
    if (this.eventManager) {
      this.eventManager.destroy();
    }
    if (this.settingsManager) {
      this.settingsManager.destroy();
    }
    this.initialized = false;
    console.log('AppController destroyed');
  }

  // Public API for global debug functions
  async clearAllData() {
    await this.stateManager.clearAllData();
    location.reload();
  }

  forceDefaults() {
    this.stateManager.resetToDefaults();
    this.settingsManager.resetToDefaults();
    this.render();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async function () {
  const app = new AppController();
  await app.init();

  // Make debug functions available globally
  window.debugApp = () => app.debugApp();
  window.debugState = () => app.stateManager.debugState();
  window.debugSettings = () => app.settingsManager.debugSettings();
  window.debugEvents = () => app.eventManager.debugEvents();
  window.debugStorage = () => StorageManager.debug();
  window.inspectAllStorage = () => {
    chrome.storage.local.get(null, (result) => {
      console.log('=== COMPLETE STORAGE INSPECTION ===');
      console.log('All keys in storage:', Object.keys(result));
      console.log('Complete storage object:', result);
      
      // Check for any prompt-like data under any key
      Object.keys(result).forEach(key => {
        const value = result[key];
        if (Array.isArray(value)) {
          console.log(`Array found at key "${key}" with ${value.length} items:`, value);
        } else if (value && typeof value === 'object') {
          console.log(`Object found at key "${key}":`, value);
        } else {
          console.log(`Value at key "${key}":`, value);
        }
      });
    });
  };
  window.clearAllData = () => app.clearAllData();
  window.forceDefaults = () => app.forceDefaults();
  
  // Store app instance globally for debugging
  window.app = app;
});