// Settings management for application preferences
// Handles theme, UI preferences, and user configuration
class SettingsManager {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      defaultFolder: 'programming',
      theme: 'light',
      autoSave: 'immediate',
      exportFormat: 'json',
      showDescriptions: true,
      showTags: true,
      autoCloseAfterCopy: false,
      showToasts: true
    };
    this.listeners = new Map();
    this.initialized = false;
  }

  // Event system for settings changes
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

  // Initialize settings from storage
  async init() {
    if (this.initialized) {
      console.warn('SettingsManager already initialized');
      return;
    }

    try {
      const { settings } = await StorageManager.load();
      this.settings = { ...this.defaultSettings, ...settings };
      this.applySettings();
      this.initialized = true;
      this.emit('settingsLoaded', { settings: this.settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { ...this.defaultSettings };
      this.emit('settingsLoadFailed', { error });
    }
  }

  // Get all settings
  getSettings() {
    return { ...this.settings };
  }

  // Get specific setting
  getSetting(key) {
    return this.settings[key];
  }

  // Set specific setting
  setSetting(key, value) {
    if (this.settings[key] !== value) {
      const oldValue = this.settings[key];
      this.settings[key] = value;
      this.saveSettings();
      this.emit('settingChanged', { key, value, oldValue });
      
      // Apply setting if it affects UI immediately
      this.applyIndividualSetting(key, value);
    }
  }

  // Update multiple settings
  updateSettings(newSettings) {
    const changes = {};
    let hasChanges = false;

    Object.keys(newSettings).forEach(key => {
      if (this.settings[key] !== newSettings[key]) {
        changes[key] = {
          oldValue: this.settings[key],
          newValue: newSettings[key]
        };
        this.settings[key] = newSettings[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveSettings();
      this.applySettings();
      this.emit('settingsUpdated', { changes, settings: this.settings });
    }
  }

  // Save settings to storage
  saveSettings() {
    StorageManager.saveSettings(this.settings);
    this.emit('settingsSaved', { settings: this.settings });
  }

  // Reset to default settings
  resetToDefaults() {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
    this.applySettings();
    this.emit('settingsReset', { oldSettings, newSettings: this.settings });
  }

  // Apply all settings to the UI
  applySettings() {
    this.applyTheme();
    this.applyUIPreferences();
    this.emit('settingsApplied', { settings: this.settings });
  }

  // Apply individual setting (for real-time updates)
  applyIndividualSetting(key, value) {
    switch (key) {
      case 'theme':
        this.applyTheme();
        break;
      case 'showDescriptions':
      case 'showTags':
        this.applyUIPreferences();
        break;
      default:
        // Setting doesn't require immediate UI update
        break;
    }
  }

  // Apply theme setting
  applyTheme() {
    const theme = this.settings.theme;
    const body = document.body;

    // Remove all theme classes
    body.classList.remove('light-theme', 'dark-theme', 'auto-theme');

    switch (theme) {
      case 'dark':
        body.classList.add('dark-theme');
        break;
      case 'auto':
        // Detect system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          body.classList.add('dark-theme');
        } else {
          body.classList.add('light-theme');
        }
        break;
      case 'light':
      default:
        body.classList.add('light-theme');
        break;
    }

    this.emit('themeApplied', { theme });
  }

  // Apply UI preferences
  applyUIPreferences() {
    const showDescriptions = this.settings.showDescriptions;
    const showTags = this.settings.showTags;

    // Add CSS classes to control visibility
    const body = document.body;
    
    if (showDescriptions) {
      body.classList.add('show-descriptions');
    } else {
      body.classList.remove('show-descriptions');
    }

    if (showTags) {
      body.classList.add('show-tags');
    } else {
      body.classList.remove('show-tags');
    }

    this.emit('uiPreferencesApplied', { showDescriptions, showTags });
  }

  // Get default folder setting
  getDefaultFolder() {
    return this.settings.defaultFolder;
  }

  // Set default folder
  setDefaultFolder(folderId) {
    this.setSetting('defaultFolder', folderId);
  }

  // Get theme setting
  getTheme() {
    return this.settings.theme;
  }

  // Set theme
  setTheme(theme) {
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.setSetting('theme', theme);
    } else {
      console.warn('Invalid theme:', theme);
    }
  }

  // Get auto-save setting
  getAutoSave() {
    return this.settings.autoSave;
  }

  // Set auto-save mode
  setAutoSave(mode) {
    if (['immediate', 'onClose', 'manual'].includes(mode)) {
      this.setSetting('autoSave', mode);
    } else {
      console.warn('Invalid auto-save mode:', mode);
    }
  }

  // Get export format
  getExportFormat() {
    return this.settings.exportFormat;
  }

  // Set export format
  setExportFormat(format) {
    if (['json', 'csv', 'txt'].includes(format)) {
      this.setSetting('exportFormat', format);
    } else {
      console.warn('Invalid export format:', format);
    }
  }

  // UI preference getters/setters
  getShowDescriptions() {
    return this.settings.showDescriptions;
  }

  setShowDescriptions(show) {
    this.setSetting('showDescriptions', Boolean(show));
  }

  getShowTags() {
    return this.settings.showTags;
  }

  setShowTags(show) {
    this.setSetting('showTags', Boolean(show));
  }

  getAutoCloseAfterCopy() {
    return this.settings.autoCloseAfterCopy;
  }

  setAutoCloseAfterCopy(autoClose) {
    this.setSetting('autoCloseAfterCopy', Boolean(autoClose));
  }

  getShowToasts() {
    return this.settings.showToasts;
  }

  setShowToasts(show) {
    this.setSetting('showToasts', Boolean(show));
  }

  // Validate settings object
  validateSettings(settings) {
    const validated = {};
    const errors = [];

    // Validate each setting
    Object.keys(this.defaultSettings).forEach(key => {
      const value = settings[key];
      const defaultValue = this.defaultSettings[key];

      switch (key) {
        case 'theme':
          validated[key] = ['light', 'dark', 'auto'].includes(value) ? value : defaultValue;
          break;
        case 'autoSave':
          validated[key] = ['immediate', 'onClose', 'manual'].includes(value) ? value : defaultValue;
          break;
        case 'exportFormat':
          validated[key] = ['json', 'csv', 'txt'].includes(value) ? value : defaultValue;
          break;
        case 'defaultFolder':
          validated[key] = typeof value === 'string' ? value : defaultValue;
          break;
        case 'showDescriptions':
        case 'showTags':
        case 'autoCloseAfterCopy':
        case 'showToasts':
          validated[key] = typeof value === 'boolean' ? value : defaultValue;
          break;
        default:
          validated[key] = defaultValue;
          errors.push(`Unknown setting: ${key}`);
          break;
      }

      if (validated[key] !== value) {
        errors.push(`Invalid value for ${key}: ${value}, using default: ${validated[key]}`);
      }
    });

    return {
      valid: errors.length === 0,
      settings: validated,
      errors
    };
  }

  // System theme detection
  setupSystemThemeDetection() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleThemeChange = (e) => {
        if (this.settings.theme === 'auto') {
          this.applyTheme();
          this.emit('systemThemeChanged', { isDark: e.matches });
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleThemeChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleThemeChange);
        } else {
          mediaQuery.removeListener(handleThemeChange);
        }
      };
    }

    return null;
  }

  // Export settings
  exportSettings() {
    const exportData = {
      settings: this.settings,
      exported: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-library-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.emit('settingsExported');
    return true;
  }

  // Import settings
  importSettings(fileContent) {
    try {
      const data = JSON.parse(fileContent);
      
      if (!data.settings) {
        throw new Error('Invalid settings file format');
      }

      const validation = this.validateSettings(data.settings);
      
      if (validation.errors.length > 0) {
        console.warn('Settings validation warnings:', validation.errors);
      }

      this.updateSettings(validation.settings);
      this.emit('settingsImported', { settings: validation.settings });
      
      return {
        success: true,
        settings: validation.settings,
        warnings: validation.errors
      };
    } catch (error) {
      this.emit('settingsImportFailed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Debug methods
  debugSettings() {
    console.log('=== SETTINGS DEBUG ===');
    console.log('Initialized:', this.initialized);
    console.log('Current settings:', this.settings);
    console.log('Default settings:', this.defaultSettings);
    console.log('Event listeners:', Array.from(this.listeners.keys()));
  }

  // Cleanup
  destroy() {
    this.listeners.clear();
    this.initialized = false;
    console.log('SettingsManager destroyed');
  }
}