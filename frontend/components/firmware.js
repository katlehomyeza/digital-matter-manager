import { firmwareService } from "../services/firmware.service.js";
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
import { loadDeviceTypes } from "./deviceTypes.js";

export async function loadFirmware() {
    showLoader('firmwareList', 'firmware');
    if (applicationState.deviceTypes.length === 0) {
            await loadDeviceTypes(); 
        }
    
    try {
        applicationState.firmware = await firmwareService.getAllFirmware();
        renderFirmwareList();
    } catch (error) {
        console.error('Failed to load firmware:', error);
        displayEmptyState('firmwareList', 'Failed to load firmware. Please try again.');
    }
}

export function renderFirmwareList() {
    const container = document.getElementById('firmwareList');
    clearContainer(container);

    if (applicationState.firmware.length === 0) {
        displayEmptyState('firmwareList', 'No firmware yet. Create your first firmware!');
        return;
    }

    applicationState.firmware.forEach(firmware => {
        const card = createFirmwareCard(firmware);
        container.appendChild(card);
    });
}

function createFirmwareCard(firmware) {
    const card = document.createElement('article');
    card.className = 'item-card';

    const header = document.createElement('header');
    header.className = 'card-header';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = firmware.name;

    const actions = document.createElement('section');
    actions.className = 'card-actions';

    const editButton = createActionButton('✎', 'edit', () => openFirmwareModal(firmware));
    const deleteButton = createActionButton('✕', 'delete', (e) => handleFirmwareDeletion(firmware.firmwareId, e));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    header.appendChild(title);
    header.appendChild(actions);

    const content = document.createElement('section');
    content.className = 'card-content';

    content.appendChild(createInfoRow('Version', firmware.version));
    console.log('Looking for deviceTypeId:', firmware.deviceTypeId, typeof firmware.deviceTypeId);
console.log('Available deviceTypes:', applicationState.deviceTypes);
    const deviceType = applicationState.deviceTypes.find(dt => dt.deviceTypeId === firmware.deviceTypeId);
    if (deviceType) {
        content.appendChild(createInfoRow('Device Type', deviceType.name));
    }

    content.appendChild(createInfoRow('Created', formatDateTime(firmware.createdAt)));

    card.appendChild(header);
    card.appendChild(content);

    return card;
}

export function openFirmwareModal(firmware = null) {
    const isEditMode = !!firmware;
    applicationState.currentModal = {
        type: 'firmware',
        data: firmware,
        isEditMode
    };

    document.getElementById('modalTitle').textContent = isEditMode ? 'Edit Firmware' : 'New Firmware';

    const formFields = document.getElementById('formFields');
    clearContainer(formFields);

    formFields.appendChild(createInputField('name', 'text', 'Firmware Name', firmware?.name || '', true));
    formFields.appendChild(createInputField('version', 'text', 'Version', firmware?.version || '', true));

    const deviceTypeOptions = applicationState.deviceTypes.map(dt => ({
        value: dt.deviceTypeId,
        label: dt.name
    }));

    formFields.appendChild(createSelectField('deviceTypeId', 'Device Type', deviceTypeOptions, firmware?.deviceTypeId || '', true));

    openModal();
}

export async function processFirmwareSubmission(data) {
    const submitButton = document.querySelector('.modal-actions button[type="submit"]');
    
    if (submitButton) {
        showButtonLoader(submitButton, submitButton.textContent);
    }
    
    try {
        if (applicationState.currentModal.isEditMode) {
            await firmwareService.updateFirmware(applicationState.currentModal.data.firmwareId, data);
        } else {
            await firmwareService.createFirmware(data);
        }
        await loadFirmware();
    } catch (error) {
        console.error('Failed to process firmware:', error);
        throw error; // Re-throw so handleFormSubmission can catch it
    } finally {
        if (submitButton) {
            hideButtonLoader(submitButton);
        }
    }
}

export async function handleFirmwareDeletion(firmwareId, event) {
    const confirmed = await showConfirm(
        'Are you sure you want to delete this firmware? This action cannot be undone.',
        'Delete Firmware',
        {
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmClass: 'btn-danger'
        }
    );
    
    if (!confirmed) return

    const deleteButton = event?.currentTarget;
    
    if (deleteButton) {
        showButtonLoader(deleteButton, deleteButton.textContent);
    }

    try {
        await firmwareService.deleteFirmware(firmwareId);
        await loadFirmware();
    } catch (error) {
        await showWarning(error.message || 'Failed to delete firmware', "Deletion Error");
        if (deleteButton) {
            hideButtonLoader(deleteButton);
        }
    }
}