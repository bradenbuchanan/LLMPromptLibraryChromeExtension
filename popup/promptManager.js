// Prompt management operations
class PromptManager {
  static copyPrompt(prompt) {
    // Validate prompt data before copying
    if (!prompt || !prompt.content) {
      console.error('Invalid prompt data for copying');
      return Promise.resolve(false);
    }

    // Ensure content is safe (though it should already be sanitized)
    const safeContent = ValidationUtils.sanitizeContent(prompt.content);

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard
        .writeText(safeContent)
        .then(function () {
          prompt.lastUsed = new Date().toISOString();
          return true;
        })
        .catch(function (error) {
          console.error('Clipboard write failed:', error);
          return false;
        });
    } else {
      // Fallback
      return new Promise((resolve) => {
        const textArea = document.createElement('textarea');
        textArea.value = safeContent;
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          console.log('✅ Copied with fallback method');
          prompt.lastUsed = new Date().toISOString();
          resolve(true);
        } catch (error) {
          console.error('❌ Fallback copy failed:', error);
          resolve(false);
        } finally {
          document.body.removeChild(textArea);
        }
      });
    }
  }

  static deletePrompt(prompts, promptId) {
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) {
      return null;
    }

    if (confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      const newPrompts = prompts.filter((p) => p.id !== promptId);
      return newPrompts;
    }

    return null;
  }

  static toggleFavorite(prompts, promptId) {
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) {
      return false;
    }

    prompt.favorite = !prompt.favorite;
    return prompt.favorite;
  }

  static savePrompt(prompts, promptData, editingPromptId = null) {
    // Use comprehensive validation
    const validation = ValidationUtils.validatePromptData(promptData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { title, description, category, content, tags } = validation.data;

    if (editingPromptId) {
      // Edit existing
      const prompt = prompts.find((p) => p.id === editingPromptId);
      if (prompt) {
        prompt.title = title;
        prompt.description = description;
        prompt.category = category;
        prompt.content = content;
        prompt.tags = tags;

        return { prompts, isNew: false };
      }
    } else {
      // Add new
      const newPrompt = {
        id:
          'prompt_' +
          Date.now() +
          '_' +
          Math.random().toString(36).substr(2, 9),
        title,
        description,
        content,
        category,
        tags: tags,
        favorite: false,
        created: new Date().toISOString(),
        lastUsed: null,
      };

      const newPrompts = [...prompts, newPrompt];
      return { prompts: newPrompts, isNew: true };
    }

    return { prompts, isNew: false };
  }

  static importPrompts(currentPrompts, fileContent) {
    try {
      // First validate the JSON structure and content
      const validation = ValidationUtils.validateImportData(
        JSON.parse(fileContent)
      );
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const data = validation.data;

      // Process validated prompts
      const importedPrompts = data.prompts.map((prompt) => ({
        ...prompt,
        id:
          'imported_' +
          Date.now() +
          '_' +
          Math.random().toString(36).substr(2, 9),
      }));

      const newPrompts = [...currentPrompts, ...importedPrompts];
      return {
        success: true,
        prompts: newPrompts,
        count: importedPrompts.length,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error importing file: ' + error.message,
      };
    }
  }

  static exportPrompts(prompts) {
    const exportData = {
      prompts: prompts,
      exported: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-library-${
      new Date().toISOString().split('T')[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
    return true;
  }

  static filterPrompts(prompts, folders, currentFolder, searchQuery = '') {
    let filtered;

    if (searchQuery.trim()) {
      // Search across all prompts
      const query = searchQuery.toLowerCase();
      filtered = prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    } else {
      // Filter by folder
      if (currentFolder === 'all') {
        filtered = prompts;
      } else if (currentFolder === 'favorites') {
        filtered = prompts.filter((p) => p.favorite);
      } else {
        // Check if this is a parent folder (has subfolders) or a leaf folder
        const currentFolderObj = folders[currentFolder];
        const isParentFolder =
          currentFolderObj &&
          currentFolderObj.subfolders &&
          currentFolderObj.subfolders.length > 0;

        filtered = prompts.filter((p) => {
          if (isParentFolder) {
            // For parent folders, show prompts from this folder AND its direct subfolders
            return (
              p.category === currentFolder ||
              (p.category.startsWith(currentFolder + '/') &&
                p.category.split('/').length ===
                  currentFolder.split('/').length + 1)
            );
          } else {
            // For leaf folders, exact match only
            return p.category === currentFolder;
          }
        });
      }
    }

    return filtered;
  }
}
