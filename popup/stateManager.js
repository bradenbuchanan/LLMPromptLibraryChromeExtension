// State management for application data
// Handles prompts, folders, and application state with event notifications
class StateManager {
  constructor() {
    this.prompts = [];
    this.folders = {};
    this.currentFolder = 'programming';
    this.searchQuery = '';
    this.editingPromptId = null;
    this.editingFolderId = null;
    this.folderMode = null;
    this.listeners = new Map();
  }

  // Event system for state changes
  addEventListener(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(listener);
  }

  removeEventListener(eventType, listener) {
    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }

  // Data loading and initialization
  async loadData() {
    try {
      const { prompts, folders, settings, shouldSave } = await StorageManager.load();
      
      this.prompts = prompts;
      this.folders = folders;
      
      this.emit('dataLoaded', { prompts, folders, settings });
      
      if (shouldSave) {
        this.saveData();
      }
      
      return { prompts, folders, settings };
    } catch (error) {
      console.error('Failed to load data:', error);
      this.prompts = DefaultData.getPrompts();
      this.folders = DefaultData.getFolders();
      this.emit('dataLoadFailed', { error });
      return false;
    }
  }

  saveData() {
    StorageManager.save(this.prompts, this.folders);
    this.emit('dataSaved', { prompts: this.prompts, folders: this.folders });
  }

  // Prompt state management
  getPrompts() {
    return this.prompts;
  }

  getFilteredPrompts() {
    return PromptManager.filterPrompts(
      this.prompts,
      this.folders,
      this.currentFolder,
      this.searchQuery
    );
  }

  addPrompt(promptData) {
    try {
      const result = PromptManager.savePrompt(this.prompts, promptData);
      this.prompts = result.prompts;
      this.saveData();
      this.emit('promptAdded', { prompt: this.prompts[this.prompts.length - 1] });
      return result;
    } catch (error) {
      this.emit('promptAddFailed', { error });
      throw error;
    }
  }

  updatePrompt(promptId, promptData) {
    try {
      const result = PromptManager.savePrompt(this.prompts, promptData, promptId);
      this.prompts = result.prompts;
      this.saveData();
      this.emit('promptUpdated', { promptId, prompt: this.prompts.find(p => p.id === promptId) });
      return result;
    } catch (error) {
      this.emit('promptUpdateFailed', { promptId, error });
      throw error;
    }
  }

  deletePrompt(promptId) {
    const newPrompts = PromptManager.deletePrompt(this.prompts, promptId);
    if (newPrompts) {
      const deletedPrompt = this.prompts.find(p => p.id === promptId);
      this.prompts = newPrompts;
      this.saveData();
      this.emit('promptDeleted', { promptId, deletedPrompt });
      return true;
    }
    return false;
  }

  toggleFavorite(promptId) {
    const newFavoriteStatus = PromptManager.toggleFavorite(this.prompts, promptId);
    if (newFavoriteStatus !== false) {
      this.saveData();
      this.emit('promptFavoriteToggled', { promptId, favorite: newFavoriteStatus });
      return newFavoriteStatus;
    }
    return false;
  }

  async copyPrompt(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (!prompt) return false;

    const success = await PromptManager.copyPrompt(prompt);
    if (success) {
      this.saveData(); // Save updated lastUsed timestamp
      this.emit('promptCopied', { promptId, prompt });
    }
    return success;
  }

  // Folder state management
  getFolders() {
    return this.folders;
  }

  createFolder(folderData) {
    try {
      const newFolders = FolderManager.createFolder(this.folders, folderData);
      this.folders = newFolders;
      this.saveData();
      this.emit('folderCreated', { folderData, folders: this.folders });
      return newFolders;
    } catch (error) {
      this.emit('folderCreateFailed', { error, folderData });
      throw error;
    }
  }

  editFolder(folderId, folderData) {
    try {
      const newFolders = FolderManager.editFolder(this.folders, folderId, folderData);
      this.folders = newFolders;
      this.saveData();
      this.emit('folderEdited', { folderId, folderData, folders: this.folders });
      return newFolders;
    } catch (error) {
      this.emit('folderEditFailed', { folderId, error });
      throw error;
    }
  }

  deleteFolder(folderId) {
    const result = FolderManager.deleteFolder(this.folders, this.prompts, folderId);
    if (result) {
      this.folders = result.folders;
      this.prompts = result.prompts;

      // Update current folder if it was deleted
      if (this.currentFolder === folderId || this.currentFolder.startsWith(folderId + '/')) {
        this.setCurrentFolder('programming');
      }

      this.saveData();
      this.emit('folderDeleted', { folderId, folderName: result.folderName });
      return result;
    }
    return null;
  }

  // Navigation state management
  getCurrentFolder() {
    return this.currentFolder;
  }

  setCurrentFolder(folderId) {
    if (this.currentFolder !== folderId) {
      const previousFolder = this.currentFolder;
      this.currentFolder = folderId;
      this.searchQuery = ''; // Clear search when changing folders
      this.emit('currentFolderChanged', { 
        currentFolder: folderId, 
        previousFolder 
      });
    }
  }

  getSearchQuery() {
    return this.searchQuery;
  }

  setSearchQuery(query) {
    if (this.searchQuery !== query) {
      this.searchQuery = query;
      this.emit('searchQueryChanged', { query });
    }
  }

  // Edit state management
  getEditingPromptId() {
    return this.editingPromptId;
  }

  setEditingPromptId(promptId) {
    this.editingPromptId = promptId;
    this.emit('editingPromptChanged', { promptId });
  }

  getEditingFolderId() {
    return this.editingFolderId;
  }

  setEditingFolderId(folderId) {
    this.editingFolderId = folderId;
    this.emit('editingFolderChanged', { folderId });
  }

  getFolderMode() {
    return this.folderMode;
  }

  setFolderMode(mode) {
    this.folderMode = mode;
    this.emit('folderModeChanged', { mode });
  }

  // Import/Export operations
  importPrompts(fileContent) {
    const result = PromptManager.importPrompts(this.prompts, fileContent);
    if (result.success) {
      this.prompts = result.prompts;
      this.saveData();
      this.emit('promptsImported', { count: result.count });
    } else {
      this.emit('promptsImportFailed', { error: result.error });
    }
    return result;
  }

  exportPrompts() {
    const success = PromptManager.exportPrompts(this.prompts);
    if (success) {
      this.emit('promptsExported');
    }
    return success;
  }

  // Utility methods
  getPromptById(promptId) {
    return this.prompts.find(p => p.id === promptId);
  }

  getFolderById(folderId) {
    return this.folders[folderId];
  }

  // Reset data to defaults
  resetToDefaults() {
    this.prompts = DefaultData.getPrompts();
    this.folders = DefaultData.getFolders();
    this.currentFolder = 'programming';
    this.searchQuery = '';
    this.editingPromptId = null;
    this.editingFolderId = null;
    this.folderMode = null;
    
    this.saveData();
    this.emit('dataReset');
  }

  // Debug methods
  debugState() {
    console.log('=== STATE DEBUG ===');
    console.log('Current folder:', this.currentFolder);
    console.log('Search query:', this.searchQuery);
    console.log('Total prompts:', this.prompts.length);
    console.log('Total folders:', Object.keys(this.folders).length);
    console.log('Editing prompt:', this.editingPromptId);
    console.log('Editing folder:', this.editingFolderId);
    console.log('Folder mode:', this.folderMode);
    console.log('Event listeners:', Array.from(this.listeners.keys()));
  }

  async clearAllData() {
    await StorageManager.clear();
    this.emit('dataCleared');
  }
}