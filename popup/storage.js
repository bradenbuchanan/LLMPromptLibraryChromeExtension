// Storage management module
class StorageManager {
  static async load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prompts', 'folders'], function (result) {
        if (chrome.runtime.lastError) {
          resolve({
            prompts: DefaultData.getPrompts(),
            folders: DefaultData.getFolders(),
            shouldSave: true,
          });
          return;
        }

        let shouldSave = false;
        let prompts, folders;

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

        resolve({ prompts, folders, shouldSave });
      });
    });
  }

  static save(prompts, folders) {
    chrome.storage.local.set({ prompts, folders }, function () {
      if (chrome.runtime.lastError) {
        console.error('Save error:', chrome.runtime.lastError);
      }
    });
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
