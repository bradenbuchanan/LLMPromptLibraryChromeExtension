// Storage management module
class StorageManager {
    static async load() {
        console.log('=== LOADING FROM STORAGE ===');
        
        return new Promise((resolve) => {
            chrome.storage.local.get(['prompts', 'folders'], function(result) {
                console.log('Storage result:', result);
                
                if (chrome.runtime.lastError) {
                    console.error('Storage error:', chrome.runtime.lastError);
                    resolve({
                        prompts: DefaultData.getPrompts(),
                        folders: DefaultData.getFolders(),
                        shouldSave: true
                    });
                    return;
                }
                
                let shouldSave = false;
                let prompts, folders;
                
                if (result.prompts && result.prompts.length > 0) {
                    prompts = result.prompts;
                    console.log('Loaded', prompts.length, 'prompts from storage');
                } else {
                    console.log('No stored prompts, using defaults');
                    prompts = DefaultData.getPrompts();
                    shouldSave = true;
                }
                
                if (result.folders && Object.keys(result.folders).length > 0) {
                    folders = result.folders;
                    console.log('Loaded folders from storage');
                } else {
                    console.log('No stored folders, using defaults');
                    folders = DefaultData.getFolders();
                    shouldSave = true;
                }
                
                resolve({ prompts, folders, shouldSave });
            });
        });
    }
    
    static save(prompts, folders) {
        console.log('=== SAVING TO STORAGE ===', prompts.length, 'prompts,', Object.keys(folders).length, 'folders');
        
        chrome.storage.local.set({ prompts, folders }, function() {
            if (chrome.runtime.lastError) {
                console.error('Save error:', chrome.runtime.lastError);
            } else {
                console.log('✅ Saved successfully');
            }
        });
    }
    
    static clear() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(() => {
                console.log('Storage cleared!');
                resolve();
            });
        });
    }
    
    static debug() {
        console.log('=== STORAGE DEBUG ===');
        
        chrome.storage.local.get(null, function(result) {
            console.log('Complete storage contents:', result);
            console.log('Prompts in storage:', result.prompts ? result.prompts.length : 'none');
            console.log('Folders in storage:', result.folders ? Object.keys(result.folders).length : 'none');
            
            if (result.prompts) {
                result.prompts.forEach((prompt, index) => {
                    console.log(`Prompt ${index + 1}: ${prompt.title} (ID: ${prompt.id})`);
                });
            }
        });
    }
}