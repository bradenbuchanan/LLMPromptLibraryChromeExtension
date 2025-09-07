// Main application controller
class App {
  constructor() {
    this.prompts = [];
    this.folders = {};
    this.settings = {};
    this.currentFolder = 'programming';
    this.editingPromptId = null;
    this.editingFolderId = null;
    this.searchQuery = '';
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.applySettings();
    this.render();
  }

  async loadData() {
    try {
      const { prompts, folders, settings, shouldSave } =
        await StorageManager.load();

      this.prompts = prompts;
      this.folders = folders;
      this.settings = settings;

      // Set default folder from settings
      if (
        this.settings.defaultFolder &&
        this.settings.defaultFolder !== 'programming'
      ) {
        this.currentFolder = this.settings.defaultFolder;
      }

      if (shouldSave) {
        this.saveData();
      }
    } catch (error) {
      this.prompts = DefaultData.getPrompts();
      this.folders = DefaultData.getFolders();
      this.settings = StorageManager.getDefaultSettings();
    }
  }

  saveData() {
    StorageManager.save(this.prompts, this.folders, this.settings);
  }

  render() {
    this.renderFolders();
    this.renderPrompts();
  }

  renderFolders() {
    UI.renderFolderTree(
      this.folders,
      this.currentFolder,
      (action, folderId, event) => {
        this.handleFolderAction(action, folderId, event);
      }
    );
    UI.updateFolderSelection(this.currentFolder, this.folders);
  }

  renderPrompts() {
    const filteredPrompts = PromptManager.filterPrompts(
      this.prompts,
      this.folders,
      this.currentFolder,
      this.searchQuery
    );
    UI.displayPrompts(filteredPrompts, (action, promptId) => {
      this.handlePromptAction(action, promptId);
    });
  }

  handleFolderAction(action, folderId, event) {
    switch (action) {
      case 'select':
        this.selectFolder(folderId);
        // Toggle subfolders if it's a parent folder
        const clickedElement = event.target.closest('.folder-item');
        if (clickedElement) {
          UI.toggleSubfolder(clickedElement);
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
    }
  }

  selectFolder(folderId) {
    this.currentFolder = folderId;
    this.searchQuery = '';

    UI.updateFolderSelection(this.currentFolder, this.folders);
    UI.clearSearch();
    this.renderPrompts();
  }

  async copyPrompt(promptId) {
    const prompt = this.prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    const success = await PromptManager.copyPrompt(prompt);
    if (success) {
      UI.showToast('Copied to clipboard!');
      this.saveData();
    } else {
      UI.showToast('Copy failed');
    }
  }

  toggleFavorite(promptId) {
    const newFavoriteStatus = PromptManager.toggleFavorite(
      this.prompts,
      promptId
    );
    if (newFavoriteStatus !== false) {
      this.saveData();
      this.renderPrompts();
      UI.showToast(
        newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!'
      );
    }
  }

  deletePrompt(promptId) {
    const newPrompts = PromptManager.deletePrompt(this.prompts, promptId);
    if (newPrompts) {
      this.prompts = newPrompts;
      this.saveData();
      this.renderPrompts();
      UI.showToast('Prompt deleted!');
    }
  }

  editPrompt(promptId) {
    const prompt = this.prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    this.editingPromptId = promptId;
    UI.openModal('edit', prompt, this.currentFolder, this.folders);
  }

  openAddModal() {
    this.editingPromptId = null;
    UI.openModal('add', null, this.currentFolder, this.folders);
  }

  savePrompt() {
    try {
      const formData = UI.getFormData();
      const result = PromptManager.savePrompt(
        this.prompts,
        formData,
        this.editingPromptId
      );

      this.prompts = result.prompts;
      this.saveData();
      this.renderPrompts();
      UI.closeModal();
      UI.showToast(result.isNew ? 'Prompt added!' : 'Prompt updated!');

      this.editingPromptId = null;
    } catch (error) {
      alert(error.message);
    }
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.renderPrompts();
  }

  deleteFolder(folderId) {
    const result = FolderManager.deleteFolder(
      this.folders,
      this.prompts,
      folderId
    );
    if (result) {
      this.folders = result.folders;
      this.prompts = result.prompts;

      // If we were viewing this folder, switch to programming
      if (
        this.currentFolder === folderId ||
        this.currentFolder.startsWith(folderId + '/')
      ) {
        this.currentFolder = 'programming';
      }

      this.saveData();
      this.render();
      UI.showToast(`Folder "${result.folderName}" deleted!`);
    }
  }

  openFolderModal(mode, parentFolderId = null) {
    this.editingFolderId = null;
    this.folderMode = mode;
    UI.openFolderModal(
      mode,
      parentFolderId,
      this.folders,
      this.editingFolderId
    );
  }

  saveFolder() {
    try {
      const formData = UI.getFolderFormData();

      if (!formData.name) {
        throw new Error('Folder name is required!');
      }

      let newFolders;
      if (this.editingFolderId) {
        // Edit existing folder
        newFolders = FolderManager.editFolder(
          this.folders,
          this.editingFolderId,
          formData
        );
      } else {
        // Create new folder
        newFolders = FolderManager.createFolder(this.folders, formData);
      }

      this.folders = newFolders;
      this.saveData();
      this.renderFolders();
      UI.closeFolderModal();
      UI.showToast(
        this.editingFolderId ? 'Folder updated!' : 'Folder created!'
      );

      this.editingFolderId = null;
    } catch (error) {
      alert(error.message);
    }
  }

  editFolder(folderId) {
    const folder = this.folders[folderId];
    if (!folder) return;

    // Prevent editing system folders
    const systemFolders = [
      'favorites',
      'programming',
      'business',
      'personal',
      'creative',
      'research',
    ];
    if (systemFolders.includes(folderId)) {
      UI.showToast('System folders cannot be edited!');
      return;
    }

    this.editingFolderId = folderId;
    UI.openFolderModal('edit', null, this.folders, folderId);
  }

  importPrompts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = PromptManager.importPrompts(
          this.prompts,
          e.target.result
        );

        if (result.success) {
          this.prompts = result.prompts;
          this.saveData();
          this.renderPrompts();
          UI.showToast(`Imported ${result.count} prompts!`);
        } else {
          alert(result.error);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  exportPrompts() {
    PromptManager.exportPrompts(this.prompts);
    UI.showToast('Prompts exported!');
  }

  openSettingsModal() {
    UI.openSettingsModal(this.settings);
  }

  saveSettings() {
    const formData = UI.getSettingsFormData();
    this.settings = { ...this.settings, ...formData };
    StorageManager.saveSettings(this.settings);
    UI.closeSettingsModal();
    UI.showToast('Settings saved!');

    // Apply settings that affect the UI immediately
    this.applySettings();
  }

  resetSettings() {
    this.settings = StorageManager.getDefaultSettings();
    StorageManager.saveSettings(this.settings);
    UI.openSettingsModal(this.settings);
    UI.showToast('Settings reset to defaults!');
  }

  applySettings() {
    // Apply theme
    if (this.settings.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Apply default folder
    if (this.settings.defaultFolder && this.currentFolder === 'programming') {
      this.currentFolder = this.settings.defaultFolder;
      this.render();
    }
  }

  setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Add prompt button
    const addBtn = document.getElementById('addPromptBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openAddModal();
      });
    }

    // Delete folder button
    const deleteFolderBtn = document.getElementById('deleteFolderBtn');
    if (deleteFolderBtn) {
      deleteFolderBtn.addEventListener('click', () => {
        this.deleteFolder(this.currentFolder);
      });
    }

    // Modal controls
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => UI.closeModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => UI.closeModal());

    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.savePrompt();
      });
    }

    // Form submit
    const form = document.getElementById('promptForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePrompt();
      });
    }

    // Import/Export
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    if (importBtn)
      importBtn.addEventListener('click', () => this.importPrompts());
    if (exportBtn)
      exportBtn.addEventListener('click', () => this.exportPrompts());

    // Folder modal controls
    const closeFolderBtn = document.getElementById('closeFolderModal');
    const cancelFolderBtn = document.getElementById('cancelFolderBtn');
    if (closeFolderBtn)
      closeFolderBtn.addEventListener('click', () => UI.closeFolderModal());
    if (cancelFolderBtn)
      cancelFolderBtn.addEventListener('click', () => UI.closeFolderModal());

    // Save folder button
    const saveFolderBtn = document.getElementById('saveFolderBtn');
    if (saveFolderBtn) {
      saveFolderBtn.addEventListener('click', () => {
        this.saveFolder();
      });
    }

    // Folder form submit
    const folderForm = document.getElementById('folderForm');
    if (folderForm) {
      folderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFolder();
      });
    }

    // Settings
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    // Settings modal controls
    const closeSettingsBtn = document.getElementById('closeSettingsModal');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    if (closeSettingsBtn)
      closeSettingsBtn.addEventListener('click', () => UI.closeSettingsModal());
    if (cancelSettingsBtn)
      cancelSettingsBtn.addEventListener('click', () =>
        UI.closeSettingsModal()
      );

    // Save settings button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        this.saveSettings();
      });
    }

    // Reset settings button
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', () => {
        this.resetSettings();
      });
    }

    // Settings form submit
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }
  }

  // Debug methods
  debugStorage() {
    StorageManager.debug();
  }

  debugPrompts() {
    console.log('=== PROMPT DEBUG ===');
    console.log('Current folder:', this.currentFolder);
    console.log('Total prompts:', this.prompts.length);
    this.prompts.forEach((prompt, index) => {
      console.log(`Prompt ${index + 1}:`, {
        id: prompt.id,
        title: prompt.title,
        category: prompt.category,
        favorite: prompt.favorite,
      });
    });

    console.log('Filtered for current folder:');
    const filtered = PromptManager.filterPrompts(
      this.prompts,
      this.folders,
      this.currentFolder
    );
    console.log(
      'Result:',
      filtered.map((p) => p.title)
    );
  }

  async clearAllData() {
    await StorageManager.clear();
  }

  forceDefaults() {
    this.prompts = DefaultData.getPrompts();
    this.folders = DefaultData.getFolders();
    this.saveData();
    this.render();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const app = new App();
  app.init();

  // Make debug functions available globally
  window.debugStorage = () => app.debugStorage();
  window.debugPrompts = () => app.debugPrompts();
  window.clearAllData = () => app.clearAllData();
  window.forceDefaults = () => app.forceDefaults();
});
