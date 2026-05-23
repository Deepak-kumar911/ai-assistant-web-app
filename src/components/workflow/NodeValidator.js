// components/workflow/NodeValidator.js
export const validateNode = (node) => {
    const errors = [];
    const warnings = [];

    switch (node.type) {
        case 'schedule':
            if (!node.data.scheduleType) {
                errors.push({ nodeId: node.id, field: 'scheduleType', message: 'Schedule type is required' });
            }
            if (node.data.scheduleType === 'future') {
                if (!node.data.scheduledDate) {
                    errors.push({ nodeId: node.id, field: 'scheduledDate', message: 'Schedule date is required' });
                }
                if (!node.data.scheduledTime) {
                    errors.push({ nodeId: node.id, field: 'scheduledTime', message: 'Schedule time is required' });
                }
                if (node.data.scheduledDate && new Date(node.data.scheduledDate) < new Date()) {
                    errors.push({ nodeId: node.id, field: 'scheduledDate', message: 'Schedule date cannot be in the past' });
                }
            }
            break;

        case 'instagram':
            if (!node.data.credentialId) {
                errors.push({ nodeId: node.id, field: 'credentialId', message: 'Instagram account is required' });
            }
            if (!node.data.postType) {
                errors.push({ nodeId: node.id, field: 'postType', message: 'Post type is required' });
            }
            if (!node.data.media || node.data.media.length === 0) {
                errors.push({ nodeId: node.id, field: 'media', message: 'At least one media file is required' });
            }
            if (node.data.postType === 'carousel' && node.data.media && node.data.media.length < 2) {
                errors.push({ nodeId: node.id, field: 'media', message: 'Carousel requires at least 2 media files' });
            }
            if (node.data.postType === 'reel') {
                const hasVideo = node.data.media?.some(m => m.type === 'video');
                if (!hasVideo) {
                    errors.push({ nodeId: node.id, field: 'media', message: 'Reel requires a video file' });
                }
            }
            if (!node.data.caption || node.data.caption.trim() === '') {
                warnings.push({ nodeId: node.id, field: 'caption', message: 'Caption is empty (recommended)' });
            }
            break;

        case 'commentReply':
            if (!node.data.mode) {
                errors.push({ nodeId: node.id, field: 'mode', message: 'Reply mode is required' });
            }
            if (node.data.mode === 'keyword') {
                if (!node.data.keyword || node.data.keyword.trim() === '') {
                    errors.push({ nodeId: node.id, field: 'keyword', message: 'Keyword is required for keyword mode' });
                }
                if (!node.data.reply || node.data.reply.trim() === '') {
                    errors.push({ nodeId: node.id, field: 'reply', message: 'Reply message is required' });
                }
            } else if (node.data.mode === 'ai') {
                if (!node.data.prompt || node.data.prompt.trim() === '') {
                    errors.push({ nodeId: node.id, field: 'prompt', message: 'AI prompt is required' });
                }
            }
            break;

        case 'dm':
            if (!node.data.dmType) {
                errors.push({ nodeId: node.id, field: 'dmType', message: 'DM type is required' });
            }
            if (node.data.dmType === 'text') {
                if (!node.data.text || node.data.text.trim() === '') {
                    errors.push({ nodeId: node.id, field: 'text', message: 'Message text is required' });
                }
            } else if (node.data.dmType === 'template') {
                if (!node.data.templateName || node.data.templateName.trim() === '') {
                    errors.push({ nodeId: node.id, field: 'templateName', message: 'Template name is required' });
                }
            }
            break;
    }

    return { errors, warnings };
};

export const validateWorkflow = (nodes, edges) => {
    const errors = [];
    const warnings = [];
    const nodeErrors = new Map();
    const nodeWarnings = new Map();

    // Validate each node
    nodes.forEach(node => {
        const validation = validateNode(node);
        if (validation.errors.length > 0) {
            nodeErrors.set(node.id, validation.errors);
            errors.push(...validation.errors);
        }
        if (validation.warnings.length > 0) {
            nodeWarnings.set(node.id, validation.warnings);
            warnings.push(...validation.warnings);
        }
    });

    // Check for disconnected nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    });

    nodes.forEach(node => {
        if (!connectedNodes.has(node.id) && nodes.length > 1) {
            warnings.push({
                nodeId: node.id,
                field: 'connection',
                message: `Node "${node.type}" is not connected to the workflow`
            });
        }
    });

    // Check for cycles
    if (hasCycle(nodes, edges)) {
        errors.push({
            nodeId: null,
            field: 'workflow',
            message: 'Workflow contains cycles which may cause infinite loops'
        });
    }

    // Check for start node (schedule node should be at the beginning)
    const hasScheduleNode = nodes.some(node => node.type === 'schedule');
    if (!hasScheduleNode && nodes.length > 0) {
        errors.push({
            nodeId: null,
            field: 'workflow',
            message: 'Workflow must have a schedule node to trigger the automation'
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        nodeErrors: Object.fromEntries(nodeErrors),
        nodeWarnings: Object.fromEntries(nodeWarnings)
    };
};

const hasCycle = (nodes, edges) => {
    const graph = new Map();
    const visited = new Set();
    const recursionStack = new Set();

    nodes.forEach(node => {
        graph.set(node.id, []);
    });

    edges.forEach(edge => {
        graph.get(edge.source).push(edge.target);
    });

    const hasCycleUtil = (nodeId) => {
        if (recursionStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = graph.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (hasCycleUtil(neighbor)) return true;
        }

        recursionStack.delete(nodeId);
        return false;
    };

    for (const node of nodes) {
        if (hasCycleUtil(node.id)) return true;
    }
    return false;
};