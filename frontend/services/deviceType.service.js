import { apiService } from "./api.service.js";

export const deviceTypeService = {
    async getAllDeviceTypes() {
        return apiService.get('/devicetypes');
    },

    async getDeviceTypeById(deviceTypeId) {
        return apiService.get(`/devicetypes/${deviceTypeId}`);
    },

    async createDeviceType(deviceTypeData) {
        return apiService.post('/devicetypes', deviceTypeData);
    },

    async updateDeviceType(deviceTypeId, deviceTypeData) {
        return apiService.put(`/devicetypes/${deviceTypeId}`, deviceTypeData);
    },

    async deleteDeviceType(deviceTypeId) {
        return apiService.delete(`/devicetypes/${deviceTypeId}`);
    }
};
