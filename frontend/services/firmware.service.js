import { apiService } from "./api.service.js";

export const firmwareService = {
    async getAllFirmware() {
        return apiService.get('/firmwares');
    },

    async getFirmwareById(firmwareId) {
        return apiService.get(`/firmwares/${firmwareId}`);
    },

    async createFirmware(firmwareData) {
        return apiService.post('/firmwares', firmwareData);
    },

    async updateFirmware(firmwareId, firmwareData) {
        return apiService.put(`/firmwares/${firmwareId}`, firmwareData);
    },

    async deleteFirmware(firmwareId) {
        return apiService.delete(`/firmwares/${firmwareId}`);
    }
};
