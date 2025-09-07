// Input validation and sanitization utilities
// Critical security validations for XSS prevention and data integrity

class ValidationUtils {
  // XSS Prevention - Most Critical Security Feature
  static sanitizeForHTML(text) {
    if (!text || typeof text !== 'string') return '';

    // HTML escape dangerous characters
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Remove potentially dangerous scripts and HTML
  static sanitizeContent(text) {
    if (!text || typeof text !== 'string') return '';

    // Remove script tags and their contents
    text = text.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
    text = text.replace(/<script[^>]*>.*?<\/script>/gis, '');

    // Remove event handlers
    text = text.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
    text = text.replace(/on\w+\s*=\s*'[^']*'/gi, '');

    // Remove javascript: URLs
    text = text.replace(/javascript:[^"']*/gi, '');

    // Remove data: URLs that might contain scripts
    text = text.replace(/data:\s*text\/html[^"']*/gi, '');

    return text;
  }

  // Length validation with security limits
  static validateLength(text, maxLength = 10000, fieldName = 'field') {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: `${fieldName} is required` };
    }

    if (text.length > maxLength) {
      return {
        valid: false,
        error: `${fieldName} is too long (max ${maxLength} characters, got ${text.length})`,
      };
    }

    if (text.trim().length === 0) {
      return { valid: false, error: `${fieldName} cannot be empty` };
    }

    return { valid: true };
  }

  // Validate and sanitize tags
  static validateTags(tagsString, maxTags = 20, maxTagLength = 50) {
    if (!tagsString || typeof tagsString !== 'string') {
      return { valid: true, tags: [] };
    }

    const tags = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => this.sanitizeForHTML(tag))
      .filter((tag) => tag.length <= maxTagLength);

    if (tags.length > maxTags) {
      return {
        valid: false,
        error: `Too many tags (max ${maxTags}, got ${tags.length})`,
      };
    }

    // Remove duplicates
    const uniqueTags = [...new Set(tags)];

    return { valid: true, tags: uniqueTags };
  }

  // Validate folder name
  static validateFolderName(name) {
    const lengthCheck = this.validateLength(name, 100, 'Folder name');
    if (!lengthCheck.valid) return lengthCheck;

    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(name)) {
      return {
        valid: false,
        error: 'Folder name contains invalid characters',
      };
    }

    // Check for reserved names
    const reservedNames = [
      'con',
      'prn',
      'aux',
      'nul',
      'com1',
      'com2',
      'com3',
      'com4',
      'lpt1',
      'lpt2',
      'lpt3',
    ];
    if (reservedNames.includes(name.toLowerCase())) {
      return {
        valid: false,
        error: 'Folder name is reserved',
      };
    }

    return { valid: true, sanitized: this.sanitizeForHTML(name) };
  }

  // Validate icon (emoji or simple unicode)
  static validateIcon(icon) {
    if (!icon || typeof icon !== 'string') {
      return { valid: true, icon: '📁' };
    }

    // Allow emojis and simple unicode symbols
    const emojiRegex =
      /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1f926}-\u{1f937}\u{10000}-\u{10FFFF}\u{1f1f2}-\u{1f1f4}\u{1f1e6}-\u{1f1ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6c0}\u{1f170}-\u{1f251}📁📂📄📋⭐🔖🏷️📝💡🎯⚡🔥💻🖥️📱💾💿📀🎵🎬📺📷🔍🔧⚙️🛠️🔨⛏️⚒️🗂️📁🗃️📂🗄️📅📆🗓️📇🗃️🗄️📁📂📄📋⭐🔖🏷️📝💡🎯⚡🔥💻🖥️📱💾💿📀🎵🎬📺📷🔍🔧⚙️🛠️🔨⛏️⚒️]{1,3}$/u;

    if (!emojiRegex.test(icon)) {
      return {
        valid: false,
        error: 'Icon must be a valid emoji or simple symbol',
      };
    }

    return { valid: true, icon: icon };
  }

  // Validate search query
  static validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return { valid: true, query: '' };
    }

    // Limit search query length
    if (query.length > 200) {
      return {
        valid: false,
        error: 'Search query is too long (max 200 characters)',
      };
    }

    // Remove potentially dangerous characters for search
    const sanitized = query.replace(/[<>]/g, '').trim();

    return { valid: true, query: sanitized };
  }

  // Validate JSON import data
  static validateImportData(data) {
    try {
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid data format' };
      }

      // Check for required structure
      if (!data.prompts || !Array.isArray(data.prompts)) {
        return {
          valid: false,
          error: 'Import data must contain a prompts array',
        };
      }

      // Limit number of prompts to prevent DoS
      if (data.prompts.length > 1000) {
        return {
          valid: false,
          error: 'Too many prompts to import (max 1000)',
        };
      }

      // Validate each prompt
      for (let i = 0; i < data.prompts.length; i++) {
        const prompt = data.prompts[i];

        if (!prompt || typeof prompt !== 'object') {
          return {
            valid: false,
            error: `Invalid prompt at index ${i}`,
          };
        }

        // Check required fields
        if (!prompt.title || typeof prompt.title !== 'string') {
          return {
            valid: false,
            error: `Prompt ${i + 1} is missing a valid title`,
          };
        }

        if (!prompt.content || typeof prompt.content !== 'string') {
          return {
            valid: false,
            error: `Prompt ${i + 1} is missing valid content`,
          };
        }

        // Check content size
        if (prompt.content.length > 50000) {
          return {
            valid: false,
            error: `Prompt ${
              i + 1
            } content is too large (max 50,000 characters)`,
          };
        }

        // Sanitize content
        prompt.title = this.sanitizeForHTML(prompt.title);
        prompt.content = this.sanitizeContent(prompt.content);

        if (prompt.description) {
          prompt.description = this.sanitizeForHTML(prompt.description);
        }

        if (prompt.tags && Array.isArray(prompt.tags)) {
          prompt.tags = prompt.tags
            .filter((tag) => typeof tag === 'string')
            .map((tag) => this.sanitizeForHTML(tag))
            .slice(0, 20); // Limit tags
        }
      }

      return { valid: true, data: data };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate import data: ' + error.message,
      };
    }
  }

  // Validate settings data
  static validateSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return { valid: false, error: 'Invalid settings format' };
    }

    const validated = {};

    // Validate theme
    if (settings.theme && ['light', 'dark'].includes(settings.theme)) {
      validated.theme = settings.theme;
    } else {
      validated.theme = 'light';
    }

    // Validate default folder (basic check)
    if (settings.defaultFolder && typeof settings.defaultFolder === 'string') {
      validated.defaultFolder = this.sanitizeForHTML(settings.defaultFolder);
    }

    // Validate boolean settings
    ['showDescriptions', 'showTags'].forEach((key) => {
      if (typeof settings[key] === 'boolean') {
        validated[key] = settings[key];
      }
    });

    return { valid: true, settings: validated };
  }

  // Comprehensive prompt validation
  static validatePromptData(promptData) {
    const errors = [];

    // Validate title
    const titleValidation = this.validateLength(promptData.title, 200, 'Title');
    if (!titleValidation.valid) {
      errors.push(titleValidation.error);
    }

    // Validate content
    const contentValidation = this.validateLength(
      promptData.content,
      50000,
      'Content'
    );
    if (!contentValidation.valid) {
      errors.push(contentValidation.error);
    }

    // Validate tags
    const tagsValidation = this.validateTags(promptData.tags);
    if (!tagsValidation.valid) {
      errors.push(tagsValidation.error);
    }

    // Validate category
    if (promptData.category && typeof promptData.category !== 'string') {
      errors.push('Invalid category format');
    }

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('. '),
      };
    }

    // Return sanitized data
    return {
      valid: true,
      data: {
        title: this.sanitizeForHTML(promptData.title),
        description: promptData.description
          ? this.sanitizeForHTML(promptData.description)
          : '',
        category: promptData.category || 'programming',
        content: this.sanitizeContent(promptData.content),
        tags: tagsValidation.tags,
      },
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationUtils;
}
