// Default data definitions
class DefaultData {
    static getPrompts() {
        const now = '2024-01-01T00:00:00.000Z'; // Fixed timestamp to prevent regeneration
        
        return [
            {
                id: 'default-code-review-001',
                title: 'Code Review Checklist',
                description: 'Comprehensive code review focusing on quality and best practices',
                content: 'Please review this code for:\n\n1. Functionality: Does it work as intended?\n2. Code Quality: Is it clean, readable, and maintainable?\n3. Performance: Are there any obvious performance issues?\n4. Security: Are there any security vulnerabilities?\n5. Best Practices: Does it follow language/framework conventions?\n6. Testing: Is it adequately tested?\n\nProvide specific feedback with examples and suggestions for improvement.',
                category: 'programming/code-review',
                tags: ['review', 'quality', 'best-practices'],
                favorite: false,
                created: now,
                lastUsed: null
            },
            {
                id: 'default-debug-analysis-002',
                title: 'Debug Analysis',
                description: 'Systematic approach to debugging code issues',
                content: 'Help me debug this issue:\n\nProblem: [Describe the issue]\nExpected Behavior: [What should happen]\nActual Behavior: [What actually happens]\nCode: [Paste relevant code]\nError Messages: [Any error messages]\n\nPlease:\n1. Analyze the potential root causes\n2. Suggest debugging steps\n3. Provide possible solutions\n4. Explain why the issue might be occurring',
                category: 'programming/debugging',
                tags: ['debug', 'troubleshooting', 'analysis'],
                favorite: true,
                created: now,
                lastUsed: null
            },
            {
                id: 'default-email-template-003',
                title: 'Professional Email Template', 
                description: 'Structure for professional business emails',
                content: 'Subject: [Clear, specific subject line]\n\nDear [Name],\n\n[Opening - brief context or greeting]\n\n[Main content - clear, concise explanation of purpose]\n\n[Action items or next steps if applicable]\n\n[Closing - thank you or call to action]\n\nBest regards,\n[Your name]',
                category: 'business/emails',
                tags: ['email', 'template', 'professional'],
                favorite: false,
                created: now,
                lastUsed: null
            },
            {
                id: 'default-research-summary-004',
                title: 'Research Summary',
                description: 'Template for summarizing research findings', 
                content: 'Please analyze and summarize the following research topic:\n\nTopic: [Research subject]\nSources: [List key sources or specify type]\n\nPlease provide:\n1. Key Findings: Main discoveries or conclusions\n2. Methodology: How the research was conducted\n3. Implications: What this means for the field/industry\n4. Limitations: Any constraints or gaps in the research\n5. Future Directions: Suggested areas for further study\n\nFormat the summary for a general audience while maintaining accuracy.',
                category: 'research',
                tags: ['research', 'summary', 'analysis'],
                favorite: false,
                created: now,
                lastUsed: null
            }
        ];
    }
    
    static getFolders() {
        return {
            'programming': {
                id: 'programming',
                name: 'Programming',
                icon: '💻',
                parent: null,
                subfolders: ['programming/code-review', 'programming/debugging', 'programming/documentation']
            },
            'programming/code-review': {
                id: 'programming/code-review',
                name: 'Code Review',
                icon: '🔍',
                parent: 'programming',
                subfolders: []
            },
            'programming/debugging': {
                id: 'programming/debugging',
                name: 'Debugging',
                icon: '🐛',
                parent: 'programming',
                subfolders: []
            },
            'programming/documentation': {
                id: 'programming/documentation',
                name: 'Documentation',
                icon: '📝',
                parent: 'programming',
                subfolders: []
            },
            'business': {
                id: 'business',
                name: 'Business',
                icon: '💼',
                parent: null,
                subfolders: ['business/emails', 'business/proposals']
            },
            'business/emails': {
                id: 'business/emails',
                name: 'Email Templates',
                icon: '📧',
                parent: 'business',
                subfolders: []
            },
            'business/proposals': {
                id: 'business/proposals',
                name: 'Proposals',
                icon: '📊',
                parent: 'business',
                subfolders: []
            },
            'personal': {
                id: 'personal',
                name: 'Personal',
                icon: '👤',
                parent: null,
                subfolders: []
            },
            'creative': {
                id: 'creative',
                name: 'Creative',
                icon: '🎨',
                parent: null,
                subfolders: []
            },
            'research': {
                id: 'research',
                name: 'Research',
                icon: '🔬',
                parent: null,
                subfolders: []
            }
        };
    }
}