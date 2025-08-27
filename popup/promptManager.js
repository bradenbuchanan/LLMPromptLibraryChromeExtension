// Prompt management operations
class PromptManager {
    static copyPrompt(prompt) {
        console.log('=== COPYING PROMPT ===', prompt.id);
        console.log('Copying:', prompt.title);
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(prompt.content).then(function() {
                console.log('✅ Copied to clipboard');
                prompt.lastUsed = new Date().toISOString();
                return true;
            }).catch(function(error) {
                console.error('❌ Copy failed:', error);
                return false;
            });
        } else {
            // Fallback
            return new Promise((resolve) => {
                const textArea = document.createElement('textarea');
                textArea.value = prompt.content;
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
        console.log('=== DELETING PROMPT ===', promptId);
        
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt) {
            console.error('❌ Prompt not found:', promptId);
            return null;
        }
        
        if (confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
            console.log('Deleting:', prompt.title);
            
            const beforeCount = prompts.length;
            const newPrompts = prompts.filter(p => p.id !== promptId);
            const afterCount = newPrompts.length;
            
            console.log('Count before:', beforeCount, 'after:', afterCount);
            console.log('✅ Prompt deleted successfully');
            
            return newPrompts;
        }
        
        return null;
    }
    
    static toggleFavorite(prompts, promptId) {
        console.log('=== TOGGLING FAVORITE ===', promptId);
        
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt) {
            console.error('❌ Prompt not found:', promptId);
            return false;
        }
        
        prompt.favorite = !prompt.favorite;
        console.log('Favorite toggled for:', prompt.title, 'Now:', prompt.favorite);
        console.log('✅ Favorite toggled successfully');
        
        return prompt.favorite;
    }
    
    static savePrompt(prompts, promptData, editingPromptId = null) {
        console.log('=== SAVING PROMPT ===');
        
        const { title, description, category, content, tags } = promptData;
        
        if (!title || !content) {
            throw new Error('Title and content are required!');
        }
        
        const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        if (editingPromptId) {
            // Edit existing
            console.log('Updating existing prompt:', editingPromptId);
            
            const prompt = prompts.find(p => p.id === editingPromptId);
            if (prompt) {
                prompt.title = title;
                prompt.description = description;
                prompt.category = category;
                prompt.content = content;
                prompt.tags = processedTags;
                
                console.log('✅ Prompt updated:', prompt.title);
                return { prompts, isNew: false };
            }
        } else {
            // Add new
            console.log('Adding new prompt:', title);
            
            const newPrompt = {
                id: 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                title,
                description,
                content,
                category,
                tags: processedTags,
                favorite: false,
                created: new Date().toISOString(),
                lastUsed: null
            };
            
            const newPrompts = [...prompts, newPrompt];
            console.log('✅ New prompt added:', newPrompt.title);
            return { prompts: newPrompts, isNew: true };
        }
        
        return { prompts, isNew: false };
    }
    
    static importPrompts(currentPrompts, fileContent) {
        console.log('=== IMPORTING PROMPTS ===');
        
        try {
            const data = JSON.parse(fileContent);
            
            if (data.prompts && Array.isArray(data.prompts)) {
                const importedPrompts = data.prompts.map(prompt => ({
                    ...prompt,
                    id: 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                }));
                
                const newPrompts = [...currentPrompts, ...importedPrompts];
                console.log('✅ Imported', importedPrompts.length, 'prompts');
                
                return { success: true, prompts: newPrompts, count: importedPrompts.length };
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('❌ Import error:', error);
            return { success: false, error: 'Error importing file. Please check the format.' };
        }
    }
    
    static exportPrompts(prompts) {
        console.log('=== EXPORTING PROMPTS ===');
        
        const exportData = {
            prompts: prompts,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-library-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('✅ Prompts exported successfully');
        
        return true;
    }
    
    static filterPrompts(prompts, folders, currentFolder, searchQuery = '') {
        console.log('Filtering prompts for folder:', currentFolder, 'search:', searchQuery);
        
        let filtered;
        
        if (searchQuery.trim()) {
            // Search across all prompts
            const query = searchQuery.toLowerCase();
            filtered = prompts.filter(p => 
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        } else {
            // Filter by folder
            if (currentFolder === 'all') {
                filtered = prompts;
            } else if (currentFolder === 'favorites') {
                filtered = prompts.filter(p => p.favorite);
            } else {
                // Check if this is a parent folder (has subfolders) or a leaf folder
                const currentFolderObj = folders[currentFolder];
                const isParentFolder = currentFolderObj && currentFolderObj.subfolders && currentFolderObj.subfolders.length > 0;
                
                filtered = prompts.filter(p => {
                    if (isParentFolder) {
                        // For parent folders, show prompts from this folder AND its direct subfolders
                        return p.category === currentFolder || 
                               (p.category.startsWith(currentFolder + '/') && 
                                p.category.split('/').length === currentFolder.split('/').length + 1);
                    } else {
                        // For leaf folders, exact match only
                        return p.category === currentFolder;
                    }
                });
            }
        }
        
        console.log('Filtered prompts:', filtered.map(p => p.title));
        return filtered;
    }
}