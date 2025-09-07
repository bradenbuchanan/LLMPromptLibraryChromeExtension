// Folder management operations
class FolderManager {
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
      research: 'Research',
    };
    return names[folder] || folder;
  }

  static deleteFolder(folders, prompts, folderId) {
    if (folderId === 'favorites') {
      alert('Cannot delete the Favorites folder!');
      return null;
    }

    const folder = folders[folderId];
    if (!folder) {
      return null;
    }

    // Check if folder has prompts
    const promptsInFolder = prompts.filter(
      (p) => p.category === folderId || p.category.startsWith(folderId + '/')
    );

    let message = `Are you sure you want to delete "${folder.name}"?`;
    if (promptsInFolder.length > 0) {
      message += `\n\nThis will also delete ${promptsInFolder.length} prompt(s) in this folder.`;
    }

    if (folder.subfolders && folder.subfolders.length > 0) {
      message += `\n\nThis folder contains ${folder.subfolders.length} subfolder(s) which will also be deleted.`;
    }

    if (confirm(message)) {
      const newFolders = { ...folders };
      const newPrompts = prompts.filter(
        (p) => !p.category.startsWith(folderId)
      );

      // Delete subfolders
      if (folder.subfolders) {
        folder.subfolders.forEach((subfolderId) => {
          delete newFolders[subfolderId];
        });
      }

      // Remove from parent's subfolders list
      if (folder.parent && newFolders[folder.parent]) {
        newFolders[folder.parent].subfolders = newFolders[
          folder.parent
        ].subfolders.filter((id) => id !== folderId);
      }

      // Delete the folder itself
      delete newFolders[folderId];

      return {
        folders: newFolders,
        prompts: newPrompts,
        folderName: folder.name,
      };
    }

    return null;
  }

  static createFolder(folders, folderData) {
    // Validate folder name
    const nameValidation = ValidationUtils.validateFolderName(folderData.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // Validate icon
    const iconValidation = ValidationUtils.validateIcon(folderData.icon);
    if (!iconValidation.valid) {
      throw new Error(iconValidation.error);
    }

    // Generate unique ID from sanitized name
    let folderId = nameValidation.sanitized
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    if (folderData.parent) {
      folderId = `${folderData.parent}/${folderId}`;
    }

    // Check if folder already exists
    if (folders[folderId]) {
      throw new Error('A folder with this name already exists!');
    }

    const newFolders = { ...folders };

    // Create the new folder with validated data
    newFolders[folderId] = {
      id: folderId,
      name: nameValidation.sanitized,
      icon: iconValidation.icon,
      parent: folderData.parent || null,
      subfolders: [],
    };

    // Add to parent's subfolders if it has a parent
    if (folderData.parent && newFolders[folderData.parent]) {
      newFolders[folderData.parent].subfolders.push(folderId);
    }

    return newFolders;
  }

  static editFolder(folders, folderId, folderData) {
    if (!folders[folderId]) {
      throw new Error('Folder not found!');
    }

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
      throw new Error('System folders cannot be edited!');
    }

    // Validate folder name
    const nameValidation = ValidationUtils.validateFolderName(folderData.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // Validate icon
    const iconValidation = ValidationUtils.validateIcon(folderData.icon);
    if (!iconValidation.valid) {
      throw new Error(iconValidation.error);
    }

    // Check if new name conflicts with existing folder
    const newFolderId = nameValidation.sanitized
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    if (folders[newFolderId] && newFolderId !== folderId) {
      throw new Error('A folder with this name already exists!');
    }

    const newFolders = { ...folders };

    // Update the folder with validated data
    newFolders[folderId] = {
      ...newFolders[folderId],
      name: nameValidation.sanitized,
      icon: iconValidation.icon,
    };

    return newFolders;
  }
}
