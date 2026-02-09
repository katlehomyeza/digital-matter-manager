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
    formatDateTime,
    showLoader,
    showButtonLoader,
    hideButtonLoader,
    showWarning,
    showConfirm
} from '../ui.js';

export async function loadDevices() {
    showLoader('devicesList', "devices");
    try {
        applicationState.devices = await deviceService.getAllDevices();
        renderDevicesList();
    } catch (error) {
        console.error('Failed to load devices:', error);
        displayEmptyState('devicesList', 'Failed to load devices. Please try again.');
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
    const deleteButton = createActionButton('✕', 'delete', (e) => handleDeviceDeletion(device.deviceId, e));

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

    // Add name field
    formFields.appendChild(createInputField('name', 'text', 'Device Name', device?.name || '', true));
    
    // Add serial number field
    formFields.appendChild(createInputField('serialNumber', 'text', 'Serial Number', device?.serialNumber || '', false));

    // Add device type select
    const deviceTypeOptions = [
        { value: '', label: 'Select a device type' },
        ...applicationState.deviceTypes.map(dt => ({
            value: dt.deviceTypeId,
            label: dt.name
        }))
    ];

    const deviceTypeSelect = createSelectField('deviceTypeId', 'Device Type', deviceTypeOptions, device?.deviceTypeId || '', true);
    formFields.appendChild(deviceTypeSelect);

    // Create firmware container
    const firmwareContainer = document.createElement('section');
    firmwareContainer.id = 'firmwareSelectContainer';
    formFields.appendChild(firmwareContainer);

    // Initialize firmware options based on selected device type
    const selectedDeviceType = device?.deviceTypeId || '';
    updateFirmwareOptions(selectedDeviceType, device?.firmwareId || '');

    // Add event listener to device type select AFTER firmware container is added
    const deviceTypeSelectElement = deviceTypeSelect.querySelector('select');
    deviceTypeSelectElement.addEventListener('change', (event) => {
        updateFirmwareOptions(event.target.value, '');
    });

    // Add group select
    const groupOptions = [
        { value: '', label: 'None' },
        ...applicationState.groups.map(g => ({ value: g.groupId, label: g.name }))
    ];

    formFields.appendChild(createSelectField('groupId', 'Group', groupOptions, device?.groupId || ''));

    openModal();
}

export function updateFirmwareOptions(deviceTypeId, selectedFirmwareId) {
    const container = document.getElementById('firmwareSelectContainer');
    
    if (!container) {
        console.error('Firmware select container not found');
        return;
    }
    
    clearContainer(container);

    // Filter firmware by device type
    const filteredFirmware = deviceTypeId
        ? applicationState.firmware.filter(f => Number(f.deviceTypeId) === Number(deviceTypeId))
        : [];

    // If no firmware available for this device type
    if (filteredFirmware.length === 0) {
        const emptyGroup = document.createElement('section');
        emptyGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = 'Firmware *';
        
        const select = document.createElement('select');
        select.id = 'firmwareId';
        select.name = 'firmwareId';
        select.required = true;
        select.disabled = true;
        
        const option = document.createElement('option');
        option.value = '';
        option.textContent = deviceTypeId ? 'No firmware available for this device type' : 'Select a device type first';
        select.appendChild(option);
        
        emptyGroup.appendChild(label);
        emptyGroup.appendChild(select);
        container.appendChild(emptyGroup);
        return;
    }

    // Create firmware options
    const firmwareOptions = filteredFirmware.map(f => ({
        value: f.firmwareId,
        label: `${f.name} (${f.version})`
    }));

    // Create and append the firmware select field
    const firmwareSelect = createSelectField('firmwareId', 'Firmware', firmwareOptions, selectedFirmwareId, true);
    container.appendChild(firmwareSelect);
}

export async function processDeviceSubmission(data) {
    const submitButton = document.querySelector('.modal-actions button[type="submit"]');
    
    if (submitButton) {
        showButtonLoader(submitButton, submitButton.textContent);
    }
    
    try {
        if (applicationState.currentModal.isEditMode) {
            await deviceService.updateDevice(applicationState.currentModal.data.deviceId, data);
        } else {
            await deviceService.createDevice(data);
        }
        await loadDevices();
    } catch (error) {
        console.error('Failed to process device:', error);
        throw error; // Re-throw so handleFormSubmission can catch it
    } finally {
        if (submitButton) {
            hideButtonLoader(submitButton);
        }
    }
}

export async function handleDeviceDeletion(deviceId, event) {
    const confirmed = await showConfirm(
        'Are you sure you want to delete this device? This action cannot be undone.',
        'Delete Device',
        {
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmClass: 'btn-danger'
        }
    );
    
    if (!confirmed) return;

    const deleteButton = event?.currentTarget;

    if (deleteButton) {
        showButtonLoader(deleteButton, deleteButton.textContent);
    }

    try {
        await deviceService.deleteDevice(deviceId);
        await loadDevices();
    } catch (error) {
        await showWarning(error.message || 'Failed to delete device', 'Deletion Error');
        if (deleteButton) {
            hideButtonLoader(deleteButton);
        }
    }
}