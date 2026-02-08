import { deviceService } from "../services/device.service.js";
import { applicationState } from '../state.js';
import { 
    openModal,
    createInputField,
    createSelectField,
    createActionButton,
    createInfoRow,
    displayEmptyState,
    clearContainer,
    formatDateTime
} from '../ui.js';

export async function loadDevices() {
    try {
        applicationState.devices = await deviceService.getAllDevices();
        renderDevicesList();
    } catch (error) {
        console.error('Failed to load devices:', error);
        displayEmptyState('devicesList', 'No devices found');
    }
}

export function renderDevicesList() {
    const container = document.getElementById('devicesList');
    clearContainer(container);

    if (applicationState.devices.length === 0) {
        displayEmptyState('devicesList', 'No devices yet. Create your first device!');
        return;
    }

    applicationState.devices.forEach(device => {
        const card = createDeviceCard(device);
        container.appendChild(card);
    });
}

function createDeviceCard(device) {
    const card = document.createElement('article');
    card.className = 'item-card';

    const header = document.createElement('header');
    header.className = 'card-header';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = device.name;

    const actions = document.createElement('section');
    actions.className = 'card-actions';

    const editButton = createActionButton('✎', 'edit', () => openDeviceModal(device));
    const deleteButton = createActionButton('✕', 'delete', () => handleDeviceDeletion(device.deviceId));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    header.appendChild(title);
    header.appendChild(actions);

    const content = document.createElement('section');
    content.className = 'card-content';

    if (device.serialNumber) {
        content.appendChild(createInfoRow('Serial Number', device.serialNumber));
    }

    // Find device type - ensure type matching
    const deviceType = applicationState.deviceTypes.find(dt => 
        Number(dt.deviceTypeId) === Number(device.deviceTypeId)
    );
    content.appendChild(createInfoRow('Device Type', deviceType ? deviceType.name : 'Unknown'));

    // Find firmware - ensure type matching
    const firmware = applicationState.firmware.find(f => 
        Number(f.firmwareId) === Number(device.firmwareId)
    );
    content.appendChild(createInfoRow('Firmware', firmware ? `${firmware.name} (${firmware.version})` : 'Unknown'));

    // Find group if exists
    if (device.groupId) {
        const group = applicationState.groups.find(g => 
            Number(g.groupId) === Number(device.groupId)
        );
        content.appendChild(createInfoRow('Group', group ? group.name : 'Unknown'));
    }

    content.appendChild(createInfoRow('Added', formatDateTime(device.addedAt)));

    card.appendChild(header);
    card.appendChild(content);

    return card;
}

export function openDeviceModal(device = null) {
    const isEditMode = !!device;
    applicationState.currentModal = {
        type: 'device',
        data: device,
        isEditMode
    };

    document.getElementById('modalTitle').textContent = isEditMode ? 'Edit Device' : 'New Device';

    const formFields = document.getElementById('formFields');
    clearContainer(formFields);

    formFields.appendChild(createInputField('name', 'text', 'Device Name', device?.name || '', true));
    formFields.appendChild(createInputField('serialNumber', 'text', 'Serial Number', device?.serialNumber || '', false));

    const deviceTypeOptions = applicationState.deviceTypes.map(dt => ({
        value: dt.deviceTypeId,
        label: dt.name
    }));

    const deviceTypeSelect = createSelectField('deviceTypeId', 'Device Type', deviceTypeOptions, device?.deviceTypeId || '', true);
    formFields.appendChild(deviceTypeSelect);

    const firmwareContainer = document.createElement('section');
    firmwareContainer.id = 'firmwareSelectContainer';
    formFields.appendChild(firmwareContainer);

    const selectedDeviceType = device?.deviceTypeId || '';
    updateFirmwareOptions(selectedDeviceType, device?.firmwareId || '');

    const deviceTypeSelectElement = deviceTypeSelect.querySelector('select');
    deviceTypeSelectElement.addEventListener('change', (event) => {
        updateFirmwareOptions(event.target.value, '');
    });

    const groupOptions = [
        { value: '', label: 'None' },
        ...applicationState.groups.map(g => ({ value: g.groupId, label: g.name }))
    ];

    formFields.appendChild(createSelectField('groupId', 'Group', groupOptions, device?.groupId || ''));

    openModal();
}

export function updateFirmwareOptions(deviceTypeId, selectedFirmwareId) {
    const container = document.getElementById('firmwareSelectContainer');
    clearContainer(container);

    const filteredFirmware = deviceTypeId
        ? applicationState.firmware.filter(f => Number(f.deviceTypeId) === Number(deviceTypeId))
        : [];

    const firmwareOptions = filteredFirmware.map(f => ({
        value: f.firmwareId,
        label: `${f.name} (${f.version})`
    }));

    container.appendChild(createSelectField('firmwareId', 'Firmware', firmwareOptions, selectedFirmwareId, true));
}

export async function processDeviceSubmission(data) {
    if (applicationState.currentModal.isEditMode) {
        await deviceService.updateDevice(applicationState.currentModal.data.deviceId, data);
    } else {
        await deviceService.createDevice(data);
    }
    await loadDevices();
}

export async function handleDeviceDeletion(deviceId) {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
        await deviceService.deleteDevice(deviceId);
        await loadDevices();
    } catch (error) {
        alert(error.message || 'Failed to delete device');
    }
}
