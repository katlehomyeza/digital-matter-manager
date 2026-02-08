import { apiService } from "./api.service.js";
export const deviceService = {
    async getAllDevices() {
        return apiService.get('/devices');
    },

    async getDeviceById(deviceId) {
        return apiService.get(`/devices/${deviceId}`);
    },

    async createDevice(deviceData) {
        return apiService.post('/devices', deviceData);
    },

    async updateDevice(deviceId, deviceData) {
        return apiService.put(`/devices/${deviceId}`, deviceData);
    },

    async deleteDevice(deviceId) {
        return apiService.delete(`/devices/${deviceId}`);
    }
};
