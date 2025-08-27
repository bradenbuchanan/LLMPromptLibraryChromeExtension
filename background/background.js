// Background service worker for LLM Prompt Library Extension
// This handles extension lifecycle and storage management

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First time installation
    console.log('LLM Prompt Library extension installed');
    
    // Initialize default settings if needed
    try {
      const result = await chrome.storage.local.get(['settings']);
      if (!result.settings) {
        const defaultSettings = {
          autoCloseAfterCopy: true,
          showToasts: true,
          theme: 'light'
        };
        await chrome.storage.local.set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('LLM Prompt Library extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle storage errors and cleanup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Log storage changes for debugging (in development only)
    if (chrome.runtime.getManifest().version.includes('dev')) {
      console.log('Storage changes:', changes);
    }
  }
});

// Extension icon click handler (already handled by popup, but keeping for future features)
chrome.action.onClicked.addListener((tab) => {
  // This won't fire when popup is set, but could be used for alternative behaviors
  console.log('Extension icon clicked on tab:', tab.url);
});

// Message handling for future features (like context menus, keyboard shortcuts, etc.)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStorageInfo':
      getStorageInfo().then(sendResponse);
      return true; // Will respond asynchronously
      
    case 'clearStorage':
      clearStorage().then(sendResponse);
      return true;
      
    default:
      console.warn('Unknown message action:', request.action);
  }
});

// Utility functions
async function getStorageInfo() {
  try {
    const data = await chrome.storage.local.get(null);
    const size = JSON.stringify(data).length;
    const promptCount = data.prompts ? data.prompts.length : 0;
    
    return {
      success: true,
      data: {
        totalSize: size,
        promptCount: promptCount,
        hasSettings: !!data.settings
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function clearStorage() {
  try {
    await chrome.storage.local.clear();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Cleanup old data (if needed in future versions)
async function cleanupOldData() {
  try {
    const data = await chrome.storage.local.get(null);
    
    // Example: Remove prompts older than 1 year that haven't been used
    if (data.prompts) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const cleanedPrompts = data.prompts.filter(prompt => {
        const created = new Date(prompt.created);
        const lastUsed = prompt.lastUsed ? new Date(prompt.lastUsed) : null;
        
        // Keep if created less than a year ago, used recently, or is favorited
        return created > oneYearAgo || 
               (lastUsed && lastUsed > oneYearAgo) || 
               prompt.favorite;
      });
      
      if (cleanedPrompts.length !== data.prompts.length) {
        await chrome.storage.local.set({ prompts: cleanedPrompts });
        console.log(`Cleaned up ${data.prompts.length - cleanedPrompts.length} old prompts`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Periodic cleanup (run monthly)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'monthly-cleanup') {
    cleanupOldData();
  }
});

// Set up periodic cleanup alarm
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('monthly-cleanup', {
    delayInMinutes: 1, // Start after 1 minute
    periodInMinutes: 43800 // Approximately 1 month (30.4 days)
  });
});