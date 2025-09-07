// Event management for DOM interactions
// Handles all user interface events and delegates to appropriate handlers
class EventManager {
  constructor(stateManager, settingsManager) {
    this.stateManager = stateManager;
    this.settingsManager = settingsManager;
    this.eventHandlers = new Map();
    this.initialized = false;
  }

  // Initialize all event listeners
  init() {
    if (this.initialized) {
      console.warn('EventManager already initialized');
      return;
    }

    this.setupSearchEvents();
    this.setupPromptEvents();
    this.setupFolderEvents();
    this.setupModalEvents();
    this.setupImportExportEvents();
    this.setupFormEvents();

    this.initialized = true;
    console.log('EventManager initialized');
  }

  // Search-related events
  setupSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
      const searchHandler = (e) => {
        const query = e.target.value;
        this.stateManager.setSearchQuery(query);
      };

      searchInput.addEventListener('input', searchHandler);
      this.addEventHandler('search-input', searchInput, 'input', searchHandler);
    }

    if (searchBtn) {
      const searchBtnHandler = () => {
        const query = searchInput ? searchInput.value : '';
        this.stateManager.setSearchQuery(query);
      };

      searchBtn.addEventListener('click', searchBtnHandler);
      this.addEventHandler('search-button', searchBtn, 'click', searchBtnHandler);
    }
  }

  // Prompt-related events
  setupPromptEvents() {
    const addBtn = document.getElementById('addPromptBtn');
    const deleteFolderBtn = document.getElementById('deleteFolderBtn');

    if (addBtn) {
      const addHandler = () => {
        this.emit('promptAddRequested');
      };

      addBtn.addEventListener('click', addHandler);
      this.addEventHandler('add-prompt', addBtn, 'click', addHandler);
    }

    if (deleteFolderBtn) {
      const deleteHandler = () => {
        const currentFolder = this.stateManager.getCurrentFolder();
        this.emit('folderDeleteRequested', { folderId: currentFolder });
      };

      deleteFolderBtn.addEventListener('click', deleteHandler);
      this.addEventHandler('delete-folder', deleteFolderBtn, 'click', deleteHandler);
    }
  }

  // Folder-related events (delegated to folder tree)
  setupFolderEvents() {
    const folderTree = document.querySelector('.folder-tree');
    if (folderTree) {
      const folderHandler = (e) => {
        const target = e.target;
        const folderItem = target.closest('.folder-item');
        const actionBtn = target.closest('[data-folder-action]');
        const addFolderBtn = target.closest('.add-folder-btn');

        if (addFolderBtn) {
          const action = addFolderBtn.getAttribute('data-folder-action');
          this.emit('folderActionRequested', { action, folderId: null, event: e });
          return;
        }

        if (actionBtn) {
          e.stopPropagation();
          const action = actionBtn.getAttribute('data-folder-action');
          const folderId = folderItem ? folderItem.getAttribute('data-folder') : null;
          this.emit('folderActionRequested', { action, folderId, event: e });
          return;
        }

        if (folderItem) {
          const folderId = folderItem.getAttribute('data-folder');
          this.emit('folderActionRequested', { action: 'select', folderId, event: e });
        }
      };

      folderTree.addEventListener('click', folderHandler);
      this.addEventHandler('folder-tree', folderTree, 'click', folderHandler);
    }
  }

  // Modal-related events
  setupModalEvents() {
    // Prompt modal events
    this.setupPromptModalEvents();
    // Folder modal events  
    this.setupFolderModalEvents();
    // Settings modal events
    this.setupSettingsModalEvents();
  }

  setupPromptModalEvents() {
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const form = document.getElementById('promptForm');

    if (closeBtn) {
      const closeHandler = () => this.emit('promptModalCloseRequested');
      closeBtn.addEventListener('click', closeHandler);
      this.addEventHandler('prompt-modal-close', closeBtn, 'click', closeHandler);
    }

    if (cancelBtn) {
      const cancelHandler = () => this.emit('promptModalCloseRequested');
      cancelBtn.addEventListener('click', cancelHandler);
      this.addEventHandler('prompt-modal-cancel', cancelBtn, 'click', cancelHandler);
    }

    if (saveBtn) {
      const saveHandler = () => this.emit('promptSaveRequested');
      saveBtn.addEventListener('click', saveHandler);
      this.addEventHandler('prompt-modal-save', saveBtn, 'click', saveHandler);
    }

    if (form) {
      const submitHandler = (e) => {
        e.preventDefault();
        this.emit('promptSaveRequested');
      };
      form.addEventListener('submit', submitHandler);
      this.addEventHandler('prompt-form-submit', form, 'submit', submitHandler);
    }
  }

  setupFolderModalEvents() {
    const closeFolderBtn = document.getElementById('closeFolderModal');
    const cancelFolderBtn = document.getElementById('cancelFolderBtn');
    const saveFolderBtn = document.getElementById('saveFolderBtn');
    const folderForm = document.getElementById('folderForm');

    if (closeFolderBtn) {
      const closeHandler = () => this.emit('folderModalCloseRequested');
      closeFolderBtn.addEventListener('click', closeHandler);
      this.addEventHandler('folder-modal-close', closeFolderBtn, 'click', closeHandler);
    }

    if (cancelFolderBtn) {
      const cancelHandler = () => this.emit('folderModalCloseRequested');
      cancelFolderBtn.addEventListener('click', cancelHandler);
      this.addEventHandler('folder-modal-cancel', cancelFolderBtn, 'click', cancelHandler);
    }

    if (saveFolderBtn) {
      const saveHandler = () => this.emit('folderSaveRequested');
      saveFolderBtn.addEventListener('click', saveHandler);
      this.addEventHandler('folder-modal-save', saveFolderBtn, 'click', saveHandler);
    }

    if (folderForm) {
      const submitHandler = (e) => {
        e.preventDefault();
        this.emit('folderSaveRequested');
      };
      folderForm.addEventListener('submit', submitHandler);
      this.addEventHandler('folder-form-submit', folderForm, 'submit', submitHandler);
    }
  }

  setupSettingsModalEvents() {
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsModal');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const settingsForm = document.getElementById('settingsForm');

    if (settingsBtn) {
      const openHandler = () => this.emit('settingsModalOpenRequested');
      settingsBtn.addEventListener('click', openHandler);
      this.addEventHandler('settings-open', settingsBtn, 'click', openHandler);
    }

    if (closeSettingsBtn) {
      const closeHandler = () => this.emit('settingsModalCloseRequested');
      closeSettingsBtn.addEventListener('click', closeHandler);
      this.addEventHandler('settings-modal-close', closeSettingsBtn, 'click', closeHandler);
    }

    if (cancelSettingsBtn) {
      const cancelHandler = () => this.emit('settingsModalCloseRequested');
      cancelSettingsBtn.addEventListener('click', cancelHandler);
      this.addEventHandler('settings-modal-cancel', cancelSettingsBtn, 'click', cancelHandler);
    }

    if (saveSettingsBtn) {
      const saveHandler = () => this.emit('settingsSaveRequested');
      saveSettingsBtn.addEventListener('click', saveHandler);
      this.addEventHandler('settings-modal-save', saveSettingsBtn, 'click', saveHandler);
    }

    if (resetSettingsBtn) {
      const resetHandler = () => this.emit('settingsResetRequested');
      resetSettingsBtn.addEventListener('click', resetHandler);
      this.addEventHandler('settings-reset', resetSettingsBtn, 'click', resetHandler);
    }

    if (settingsForm) {
      const submitHandler = (e) => {
        e.preventDefault();
        this.emit('settingsSaveRequested');
      };
      settingsForm.addEventListener('submit', submitHandler);
      this.addEventHandler('settings-form-submit', settingsForm, 'submit', submitHandler);
    }
  }

  // Import/Export events
  setupImportExportEvents() {
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (importBtn) {
      const importHandler = () => this.emit('importRequested');
      importBtn.addEventListener('click', importHandler);
      this.addEventHandler('import', importBtn, 'click', importHandler);
    }

    if (exportBtn) {
      const exportHandler = () => this.emit('exportRequested');
      exportBtn.addEventListener('click', exportHandler);
      this.addEventHandler('export', exportBtn, 'click', exportHandler);
    }
  }

  // Form validation events
  setupFormEvents() {
    // Add any form-specific validation listeners here
    // This could include real-time validation, character counters, etc.
  }

  // Dynamic event delegation for prompt list items
  setupPromptListEvents() {
    const promptList = document.getElementById('promptList');
    if (promptList) {
      // Remove existing handler if any
      if (this.eventHandlers.has('prompt-list')) {
        const { element, eventType, handler } = this.eventHandlers.get('prompt-list');
        element.removeEventListener(eventType, handler);
      }

      const promptHandler = (e) => {
        const target = e.target;
        const promptItem = target.closest('.prompt-item');
        if (!promptItem) return;

        const promptId = promptItem.getAttribute('data-prompt-id');
        if (!promptId) return;

        // Handle specific actions
        if (target.closest('.copy-btn')) {
          e.stopPropagation();
          this.emit('promptActionRequested', { action: 'copy', promptId });
        } else if (target.closest('.favorite-btn')) {
          e.stopPropagation();
          this.emit('promptActionRequested', { action: 'favorite', promptId });
        } else if (target.closest('.edit-btn')) {
          e.stopPropagation();
          this.emit('promptActionRequested', { action: 'edit', promptId });
        } else if (target.closest('.delete-btn')) {
          e.stopPropagation();
          this.emit('promptActionRequested', { action: 'delete', promptId });
        } else if (target.closest('.prompt-item')) {
          // Click on prompt item itself (could be used for preview/selection)
          this.emit('promptActionRequested', { action: 'select', promptId });
        }
      };

      promptList.addEventListener('click', promptHandler);
      this.addEventHandler('prompt-list', promptList, 'click', promptHandler);
    }
  }

  // Event handler management
  addEventHandler(key, element, eventType, handler) {
    this.eventHandlers.set(key, { element, eventType, handler });
  }

  removeEventHandler(key) {
    if (this.eventHandlers.has(key)) {
      const { element, eventType, handler } = this.eventHandlers.get(key);
      element.removeEventListener(eventType, handler);
      this.eventHandlers.delete(key);
    }
  }

  // Event emission to communicate with AppController
  emit(eventName, data = null) {
    const event = new CustomEvent(eventName, { 
      detail: data,
      bubbles: false,
      cancelable: false
    });
    
    // Emit on document to allow AppController to listen
    document.dispatchEvent(event);
  }

  // Cleanup all event listeners
  destroy() {
    this.eventHandlers.forEach((handlerInfo, key) => {
      this.removeEventHandler(key);
    });
    this.eventHandlers.clear();
    this.initialized = false;
    console.log('EventManager destroyed');
  }

  // Debug method
  debugEvents() {
    console.log('=== EVENT DEBUG ===');
    console.log('Initialized:', this.initialized);
    console.log('Event handlers:', Array.from(this.eventHandlers.keys()));
    console.log('Total handlers:', this.eventHandlers.size);
  }

  // Refresh dynamic event listeners (called after UI updates)
  refreshDynamicEvents() {
    this.setupPromptListEvents();
  }
}