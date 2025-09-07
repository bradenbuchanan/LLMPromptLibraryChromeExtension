// Storage management module
class StorageManager {
  static async load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ['prompts', 'folders', 'settings'],
        function (result) {
          if (chrome.runtime.lastError) {
            console.error('Storage load error:', chrome.runtime.lastError);
            resolve({
              prompts: DefaultData.getPrompts(),
              folders: DefaultData.getFolders(),
              settings: StorageManager.getDefaultSettings(),
              shouldSave: true,
            });
            return;
          }

          let shouldSave = false;
          let prompts, folders, settings;

          // Validate and sanitize prompts data
          if (result.prompts && Array.isArray(result.prompts)) {
            try {
              prompts = StorageManager.validateAndSanitizePrompts(
                result.prompts
              );
            } catch (error) {
              console.error('Prompts validation failed:', error);
              prompts = DefaultData.getPrompts();
              shouldSave = true;
            }
          } else {
            prompts = DefaultData.getPrompts();
            shouldSave = true;
          }

          // Validate and sanitize folders data
          if (result.folders && typeof result.folders === 'object') {
            try {
              folders = StorageManager.validateAndSanitizeFolders(
                result.folders
              );
            } catch (error) {
              console.error('Folders validation failed:', error);
              folders = DefaultData.getFolders();
              shouldSave = true;
            }
          } else {
            folders = DefaultData.getFolders();
            shouldSave = true;
          }

          // Validate settings data
          if (result.settings && typeof result.settings === 'object') {
            try {
              const validation = ValidationUtils.validateSettings(
                result.settings
              );
              settings = validation.valid
                ? validation.settings
                : StorageManager.getDefaultSettings();
              if (!validation.valid) {
                console.warn('Settings validation warning:', validation.error);
                shouldSave = true;
              }
            } catch (error) {
              console.error('Settings validation failed:', error);
              settings = StorageManager.getDefaultSettings();
              shouldSave = true;
            }
          } else {
            settings = StorageManager.getDefaultSettings();
            shouldSave = true;
          }

          resolve({ prompts, folders, settings, shouldSave });
        }
      );
    });
  }

  static save(prompts, folders, settings = null) {
    const data = { prompts, folders };
    if (settings) {
      data.settings = settings;
    }
    chrome.storage.local.set(data, function () {
      if (chrome.runtime.lastError) {
        console.error('Save error:', chrome.runtime.lastError);
      }
    });
  }

  static saveSettings(settings) {
    chrome.storage.local.set({ settings }, function () {
      if (chrome.runtime.lastError) {
        console.error('Settings save error:', chrome.runtime.lastError);
      }
    });
  }

  static getDefaultSettings() {
    return {
      defaultFolder: 'programming',
      theme: 'light',
      autoSave: 'immediate',
      exportFormat: 'json',
      showDescriptions: true,
      showTags: true,
    };
  }

  static clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }

  // Validate and sanitize prompts data from storage
  static validateAndSanitizePrompts(prompts) {
    if (!Array.isArray(prompts)) {
      throw new Error('Prompts must be an array');
    }

    return prompts
      .filter((prompt) => {
        // Basic validation - ensure required fields exist
        return (
          prompt &&
          typeof prompt === 'object' &&
          typeof prompt.id === 'string' &&
          typeof prompt.title === 'string' &&
          typeof prompt.content === 'string'
        );
      })
      .map((prompt) => ({
        ...prompt,
        title: ValidationUtils.sanitizeForHTML(prompt.title || ''),
        description: ValidationUtils.sanitizeForHTML(prompt.description || ''),
        content: ValidationUtils.sanitizeContent(prompt.content || ''),
        category:
          typeof prompt.category === 'string' ? prompt.category : 'programming',
        tags: Array.isArray(prompt.tags)
          ? prompt.tags
              .filter((tag) => typeof tag === 'string')
              .map((tag) => ValidationUtils.sanitizeForHTML(tag))
              .slice(0, 20) // Limit tags
          : [],
        favorite: Boolean(prompt.favorite),
        created: prompt.created || new Date().toISOString(),
        lastUsed: prompt.lastUsed || null,
      }))
      .slice(0, 2000); // Reasonable limit to prevent storage bloat
  }

  // Validate and sanitize folders data from storage
  static validateAndSanitizeFolders(folders) {
    if (!folders || typeof folders !== 'object') {
      throw new Error('Folders must be an object');
    }

    const validatedFolders = {};

    Object.entries(folders).forEach(([key, folder]) => {
      if (folder && typeof folder === 'object') {
        // Validate folder structure
        const nameValidation = ValidationUtils.validateFolderName(folder.name);
        const iconValidation = ValidationUtils.validateIcon(folder.icon);

        validatedFolders[key] = {
          id: folder.id || key,
          name: nameValidation.valid ? nameValidation.sanitized : key,
          icon: iconValidation.valid ? iconValidation.icon : '📁',
          parent: typeof folder.parent === 'string' ? folder.parent : null,
          subfolders: Array.isArray(folder.subfolders)
            ? folder.subfolders.filter((id) => typeof id === 'string')
            : [],
        };
      }
    });

    return validatedFolders;
  }

  static debug() {
    chrome.storage.local.get(null, function (result) {
      console.log('Complete storage contents:', result);
      console.log(
        'Prompts in storage:',
        result.prompts ? result.prompts.length : 'none'
      );
      console.log(
        'Folders in storage:',
        result.folders ? Object.keys(result.folders).length : 'none'
      );

      if (result.prompts) {
        result.prompts.forEach((prompt, index) => {
          console.log(
            `Prompt ${index + 1}: ${prompt.title} (ID: ${prompt.id})`
          );
        });
      }
    });
  }
}
