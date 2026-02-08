import { apiService } from "./api.service.js";

export const historyService = {
    async getDeviceHistory(deviceId) {
        return apiService.get(`/devices/${deviceId}/firmware-history`);
    }
};
