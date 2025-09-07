// UI management and rendering
class UI {
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.style.display = 'block';

      setTimeout(function () {
        toast.style.display = 'none';
      }, 2000);
    }
  }

  static renderFolderTree(folders, currentFolder, onFolderAction) {
    const folderTreeElement = document.querySelector('.folder-tree');
    if (!folderTreeElement) {
      return;
    }

    // Clear existing content
    folderTreeElement.innerHTML = '';

    // Add favorites folder (always first)
    const favoritesDiv = document.createElement('div');
    favoritesDiv.className = 'folder-item';
    favoritesDiv.setAttribute('data-folder', 'favorites');
    favoritesDiv.innerHTML = `
            <span class="folder-icon">⭐</span>
            <span class="folder-name">Favorites</span>
            <span class="folder-actions">
                <button class="folder-action-btn" data-folder-action="add-sub" title="Add subfolder">➕</button>
            </span>
        `;
    folderTreeElement.appendChild(favoritesDiv);

    // Add main folders (only top-level folders, subfolders are handled within createFolderElement)
    Object.values(folders).forEach((folder) => {
      if (!folder.parent) {
        // Top-level folders only
        const folderElement = this.createFolderElement(folder, folders);
        folderTreeElement.appendChild(folderElement);
      }
    });

    // Add "Add Folder" button
    const addFolderDiv = document.createElement('div');
    addFolderDiv.className = 'add-folder-item';
    addFolderDiv.innerHTML = `
            <button class="add-folder-btn" data-folder-action="add-main">
                <span class="folder-icon">➕</span>
                <span class="folder-name">Add Folder</span>
            </button>
        `;
    folderTreeElement.appendChild(addFolderDiv);

    // Add event listeners
    this.addFolderEventListeners(folderTreeElement, onFolderAction);
  }

  static createFolderElement(folder, folders) {
    const div = document.createElement('div');
    div.className = 'folder-item';
    div.setAttribute('data-folder', folder.id);

    const hasSubfolders = folder.subfolders && folder.subfolders.length > 0;

    div.innerHTML = `
            <div class="folder-content">
                <span class="folder-icon">${folder.icon}</span>
                <span class="folder-name">${folder.name}</span>
            </div>
            <div class="folder-actions">
                <button class="folder-action-btn" data-folder-action="edit" title="Edit folder">✏️</button>
                <button class="folder-action-btn" data-folder-action="add-sub" title="Add subfolder">➕</button>
                <button class="folder-action-btn" data-folder-action="delete" title="Delete folder">🗑️</button>
            </div>
            ${
              hasSubfolders
                ? '<div class="subfolder-list" style="display: none;"></div>'
                : ''
            }
        `;

    // Add subfolders if they exist
    if (hasSubfolders) {
      const subfolderList = div.querySelector('.subfolder-list');
      folder.subfolders.forEach((subfolderId) => {
        const subfolder = folders[subfolderId];
        if (subfolder) {
          const subfolderElement = this.createSubfolderElement(subfolder);
          subfolderList.appendChild(subfolderElement);
        }
      });
    }

    return div;
  }

  static createSubfolderElement(subfolder) {
    const div = document.createElement('div');
    div.className = 'subfolder-item';
    div.setAttribute('data-folder', subfolder.id);

    div.innerHTML = `
            <div class="subfolder-content">
                <span class="subfolder-icon">${subfolder.icon}</span>
                <span class="subfolder-name">${subfolder.name}</span>
            </div>
            <div class="subfolder-actions">
                <button class="folder-action-btn" data-folder-action="edit" title="Edit subfolder">✏️</button>
            </div>
        `;

    return div;
  }

  static addFolderEventListeners(folderTreeElement, onFolderAction) {
    folderTreeElement.addEventListener('click', function (e) {
      const action = e.target.getAttribute('data-folder-action');
      const folderItem = e.target.closest('[data-folder]');
      const folderId = folderItem
        ? folderItem.getAttribute('data-folder')
        : null;

      if (action) {
        onFolderAction(action, folderId, e);
        e.stopPropagation();
      } else if (folderId) {
        // Regular folder click - select the folder
        onFolderAction('select', folderId, e);
        e.stopPropagation();
      }
    });
  }

  static updateFolderSelection(currentFolder, folders = {}) {
    // Update active states
    document
      .querySelectorAll('.folder-item, .subfolder-item')
      .forEach((item) => {
        item.classList.remove('active');
      });

    const selectedElement = document.querySelector(
      `[data-folder="${currentFolder}"]`
    );
    if (selectedElement) {
      selectedElement.classList.add('active');
    }

    // Update header
    const header = document.getElementById('currentFolder');
    if (header) {
      header.textContent = FolderManager.getFolderName(currentFolder);
    }

    // Show/hide delete button based on folder type
    const deleteFolderBtn = document.getElementById('deleteFolderBtn');
    if (deleteFolderBtn) {
      const isDeleteableFolder =
        currentFolder !== 'all' &&
        currentFolder !== 'favorites' &&
        currentFolder !== 'programming' &&
        currentFolder !== 'business' &&
        currentFolder !== 'personal' &&
        currentFolder !== 'creative' &&
        currentFolder !== 'research' &&
        folders[currentFolder];

      deleteFolderBtn.style.display = isDeleteableFolder ? 'block' : 'none';
    }
  }

  static displayPrompts(prompts) {
    const promptList = document.getElementById('promptList');
    const emptyState = document.getElementById('emptyState');

    if (!promptList) {
      return;
    }

    // Clear existing content
    promptList.innerHTML = '';

    if (prompts.length === 0) {
      if (emptyState) {
        const emptyClone = emptyState.cloneNode(true);
        emptyClone.style.display = 'block';
        promptList.appendChild(emptyClone);
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Create prompt elements
    prompts.forEach((prompt) => {
      const promptElement = this.createPromptElement(prompt);
      promptList.appendChild(promptElement);
    });
  }

  static createPromptElement(prompt) {
    const div = document.createElement('div');
    div.className = 'prompt-item';
    div.setAttribute('data-prompt-id', prompt.id);

    const tags = prompt.tags
      .map((tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`)
      .join('');

    div.innerHTML = `
            <div class="prompt-header">
                <div class="prompt-title">${this.escapeHtml(prompt.title)}</div>
                <div class="prompt-actions">
                    <button class="action-btn favorite-btn ${
                      prompt.favorite ? 'active' : ''
                    }" data-action="favorite" title="Toggle favorite">⭐</button>
                    <button class="action-btn edit-btn" data-action="edit" title="Edit prompt">✏️</button>
                    <button class="action-btn delete-btn" data-action="delete" title="Delete prompt">🗑️</button>
                    <button class="action-btn copy-btn" data-action="copy" title="Copy to clipboard">📋</button>
                </div>
            </div>
            <div class="prompt-description">${this.escapeHtml(
              prompt.description || ''
            )}</div>
            <div class="prompt-tags">${tags}</div>
        `;

    // Note: Click events are handled by EventManager's setupPromptListEvents

    return div;
  }

  static openModal(
    mode,
    prompt = null,
    currentFolder = 'programming',
    folders = {}
  ) {
    const modal = document.getElementById('promptModal');
    const title = document.getElementById('modalTitle');
    const categorySelect = document.getElementById('promptCategory');

    // Update category dropdown with current folders
    this.updateCategoryOptions(categorySelect, folders);

    if (mode === 'add') {
      const defaultCategory =
        currentFolder !== 'all' && currentFolder !== 'favorites'
          ? currentFolder
          : 'programming';

      title.textContent = 'Add New Prompt';
      document.getElementById('promptTitle').value = '';
      document.getElementById('promptDescription').value = '';
      categorySelect.value = defaultCategory;
      document.getElementById('promptContent').value = '';
      document.getElementById('promptTags').value = '';
    } else if (mode === 'edit' && prompt) {
      title.textContent = 'Edit Prompt';
      document.getElementById('promptTitle').value = prompt.title || '';
      document.getElementById('promptDescription').value =
        prompt.description || '';
      categorySelect.value = prompt.category || '';
      document.getElementById('promptContent').value = prompt.content || '';
      document.getElementById('promptTags').value = prompt.tags
        ? prompt.tags.join(', ')
        : '';
    }

    modal.style.display = 'flex';
    document.getElementById('promptTitle').focus();
  }

  static updateCategoryOptions(selectElement, folders) {
    selectElement.innerHTML = '';

    // Add default categories first
    const defaultCategories = [
      { value: 'programming', text: 'Programming' },
      { value: 'business', text: 'Business' },
      { value: 'personal', text: 'Personal' },
      { value: 'creative', text: 'Creative' },
      { value: 'research', text: 'Research' },
    ];

    defaultCategories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.text;
      selectElement.appendChild(option);
    });

    // Add all folders from the current folder structure
    Object.values(folders).forEach((folder) => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.parent
        ? `${folders[folder.parent]?.name || folder.parent} > ${folder.name}`
        : folder.name;
      selectElement.appendChild(option);
    });
  }

  static closeModal() {
    document.getElementById('promptModal').style.display = 'none';
  }

  static getFormData() {
    return {
      title: document.getElementById('promptTitle').value.trim(),
      description: document.getElementById('promptDescription').value.trim(),
      category: document.getElementById('promptCategory').value,
      content: document.getElementById('promptContent').value.trim(),
      tags: document.getElementById('promptTags').value.trim(),
    };
  }

  static clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
  }

  static toggleSubfolder(folderElement) {
    const subfolder = folderElement.querySelector('.subfolder-list');
    if (subfolder) {
      const isVisible = subfolder.style.display !== 'none';
      subfolder.style.display = isVisible ? 'none' : 'block';
    }
  }

  static openFolderModal(
    mode,
    parentFolderId = null,
    folders = {},
    folderId = null
  ) {
    const modal = document.getElementById('folderModal');
    const title = document.getElementById('folderModalTitle');
    const parentGroup = document.getElementById('parentFolderGroup');
    const parentSelect = document.getElementById('parentFolder');

    if (mode === 'add-main') {
      title.textContent = 'Add New Folder';
      parentGroup.style.display = 'none';
      document.getElementById('folderName').value = '';
      document.getElementById('folderIcon').value = '📁';
    } else if (mode === 'add-sub') {
      title.textContent = 'Add New Subfolder';
      parentGroup.style.display = 'block';

      // Populate parent folder options
      parentSelect.innerHTML = '';
      Object.values(folders).forEach((folder) => {
        if (!folder.parent) {
          // Only show top-level folders as parent options
          const option = document.createElement('option');
          option.value = folder.id;
          option.textContent = folder.name;
          option.selected = folder.id === parentFolderId;
          parentSelect.appendChild(option);
        }
      });

      document.getElementById('folderName').value = '';
      document.getElementById('folderIcon').value = '📁';
    } else if (mode === 'edit' && folderId) {
      title.textContent = 'Edit Folder';
      parentGroup.style.display = 'none'; // Can't change parent
      const folder = folders[folderId];
      document.getElementById('folderName').value = folder.name;
      document.getElementById('folderIcon').value = folder.icon;
    }

    modal.style.display = 'flex';
    document.getElementById('folderName').focus();
  }

  static closeFolderModal() {
    document.getElementById('folderModal').style.display = 'none';
  }

  static getFolderFormData() {
    return {
      name: document.getElementById('folderName').value.trim(),
      icon: document.getElementById('folderIcon').value.trim() || '📁',
      parent: document.getElementById('parentFolder').value || null,
    };
  }

  static openSettingsModal(settings) {
    const modal = document.getElementById('settingsModal');

    // Populate form with current settings
    document.getElementById('defaultFolder').value =
      settings.defaultFolder || 'programming';
    document.getElementById('theme').value = settings.theme || 'light';
    document.getElementById('autoSave').value =
      settings.autoSave || 'immediate';
    document.getElementById('exportFormat').value =
      settings.exportFormat || 'json';
    document.getElementById('showDescriptions').checked =
      settings.showDescriptions !== false;
    document.getElementById('showTags').checked = settings.showTags !== false;

    modal.style.display = 'flex';
  }

  static closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
  }

  static getSettingsFormData() {
    return {
      defaultFolder: document.getElementById('defaultFolder').value,
      theme: document.getElementById('theme').value,
      autoSave: document.getElementById('autoSave').value,
      exportFormat: document.getElementById('exportFormat').value,
      showDescriptions: document.getElementById('showDescriptions').checked,
      showTags: document.getElementById('showTags').checked,
    };
  }
}
