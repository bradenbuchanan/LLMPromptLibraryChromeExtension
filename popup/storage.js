// Storage management module
class StorageManager {
  static async load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ['prompts', 'folders', 'settings'],
        function (result) {
          if (chrome.runtime.lastError) {
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

          if (result.prompts && result.prompts.length > 0) {
            prompts = result.prompts;
          } else {
            prompts = DefaultData.getPrompts();
            shouldSave = true;
          }

          if (result.folders && Object.keys(result.folders).length > 0) {
            folders = result.folders;
          } else {
            folders = DefaultData.getFolders();
            shouldSave = true;
          }

          if (result.settings) {
            settings = {
              ...StorageManager.getDefaultSettings(),
              ...result.settings,
            };
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
