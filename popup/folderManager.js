// Folder management operations
class FolderManager {
    static getFolderName(folder) {
        const names = {
            'all': 'All Prompts',
            'favorites': 'Favorites',
            'programming': 'Programming',
            'programming/code-review': 'Code Review',
            'programming/debugging': 'Debugging',
            'programming/documentation': 'Documentation',
            'business': 'Business',
            'business/emails': 'Email Templates',
            'business/proposals': 'Proposals',
            'personal': 'Personal',
            'creative': 'Creative',
            'research': 'Research'
        };
        return names[folder] || folder;
    }
    
    static deleteFolder(folders, prompts, folderId) {
        console.log('=== DELETING FOLDER ===', folderId);
        
        if (folderId === 'favorites') {
            alert('Cannot delete the Favorites folder!');
            return null;
        }
        
        const folder = folders[folderId];
        if (!folder) {
            console.error('❌ Folder not found:', folderId);
            return null;
        }
        
        // Check if folder has prompts
        const promptsInFolder = prompts.filter(p => p.category === folderId || p.category.startsWith(folderId + '/'));
        
        let message = `Are you sure you want to delete "${folder.name}"?`;
        if (promptsInFolder.length > 0) {
            message += `\n\nThis will also delete ${promptsInFolder.length} prompt(s) in this folder.`;
        }
        
        if (folder.subfolders && folder.subfolders.length > 0) {
            message += `\n\nThis folder contains ${folder.subfolders.length} subfolder(s) which will also be deleted.`;
        }
        
        if (confirm(message)) {
            const newFolders = { ...folders };
            const newPrompts = prompts.filter(p => !p.category.startsWith(folderId));
            
            // Delete subfolders
            if (folder.subfolders) {
                folder.subfolders.forEach(subfolderId => {
                    delete newFolders[subfolderId];
                });
            }
            
            // Remove from parent's subfolders list
            if (folder.parent && newFolders[folder.parent]) {
                newFolders[folder.parent].subfolders = newFolders[folder.parent].subfolders.filter(id => id !== folderId);
            }
            
            // Delete the folder itself
            delete newFolders[folderId];
            
            console.log('✅ Folder deleted successfully');
            return { folders: newFolders, prompts: newPrompts, folderName: folder.name };
        }
        
        return null;
    }
    
    static createFolder(folders, folderData) {
        console.log('=== CREATING FOLDER ===', folderData);
        
        // Generate unique ID
        let folderId = folderData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (folderData.parent) {
            folderId = `${folderData.parent}/${folderId}`;
        }
        
        // Check if folder already exists
        if (folders[folderId]) {
            throw new Error('A folder with this name already exists!');
        }
        
        const newFolders = { ...folders };
        
        // Create the new folder
        newFolders[folderId] = {
            id: folderId,
            name: folderData.name,
            icon: folderData.icon || '📁',
            parent: folderData.parent || null,
            subfolders: []
        };
        
        // Add to parent's subfolders if it has a parent
        if (folderData.parent && newFolders[folderData.parent]) {
            newFolders[folderData.parent].subfolders.push(folderId);
        }
        
        console.log('✅ Folder created successfully:', folderId);
        return newFolders;
    }
    
    static editFolder(folders, folderId, folderData) {
        // Placeholder for folder editing logic
        console.log('Editing folder:', folderId, folderData);
        // TODO: Implement folder editing
        return folders;
    }
}