import { apiService } from "./api.service.js";

export const groupService = {
    async getAllGroups() {
        return apiService.get('/groups');
    },

    async getGroupById(groupId) {
        return apiService.get(`/groups/${groupId}`);
    },

    async createGroup(groupData) {
        return apiService.post('/groups', groupData);
    },

    async updateGroup(groupId, groupData) {
        return apiService.put(`/groups/${groupId}`, groupData);
    },

    async deleteGroup(groupId) {
        return apiService.delete(`/groups/${groupId}`);
    }
};