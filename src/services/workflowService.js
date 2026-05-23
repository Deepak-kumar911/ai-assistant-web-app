// services/workflowService.js
import axios from 'axios';

const API_BASE = '/api/workflows';

export const workflowService = {
    // Fetch all workflows
    getAllWorkflows: async () => {
        const response = await axios.get(API_BASE);
        return response.data;
    },

    // Fetch single workflow
    getWorkflow: async (id) => {
        const response = await axios.get(`${API_BASE}/${id}`);
        return response.data;
    },

    // Create new workflow
    createWorkflow: async (workflowData) => {
        const response = await axios.post(API_BASE, workflowData);
        return response.data;
    },

    // Update workflow
    updateWorkflow: async (id, workflowData) => {
        const response = await axios.put(`${API_BASE}/${id}`, workflowData);
        return response.data;
    },

    // Delete workflow
    deleteWorkflow: async (id) => {
        const response = await axios.delete(`${API_BASE}/${id}`);
        return response.data;
    },

    // Duplicate workflow
    duplicateWorkflow: async (id) => {
        const response = await axios.post(`${API_BASE}/${id}/duplicate`);
        return response.data;
    },

    // Validate workflow before saving
    validateWorkflow: async (nodes, edges) => {
        const response = await axios.post(`${API_BASE}/validate`, { nodes, edges });
        return response.data;
    }
};