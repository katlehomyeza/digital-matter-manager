import { deviceTypeService } from "../services/deviceType.service.js";
import { applicationState } from '../state.js';
import { 
    openModal,
    createInputField,
    createTextareaField,
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

export async function loadDeviceTypes() {
    showLoader('deviceTypesList', "device types");
    try {
        applicationState.deviceTypes = await deviceTypeService.getAllDeviceTypes();
        renderDeviceTypesList();
    } catch (error) {
        console.error('Failed to load device types:', error);
        displayEmptyState('deviceTypesList', 'Failed to load device types. Please try again.');
    }
}

export function renderDeviceTypesList() {
    const container = document.getElementById('deviceTypesList');
    clearContainer(container);

    if (applicationState.deviceTypes.length === 0) {
        displayEmptyState('deviceTypesList', 'No device types yet. Create your first device type!');
        return;
    }

    applicationState.deviceTypes.forEach(deviceType => {
        const card = createDeviceTypeCard(deviceType);
        container.appendChild(card);
    });
}

function createDeviceTypeCard(deviceType) {
    const card = document.createElement('article');
    card.className = 'item-card';

    const header = document.createElement('header');
    header.className = 'card-header';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = deviceType.name;

    const actions = document.createElement('section');
    actions.className = 'card-actions';

    const editButton = createActionButton('✎', 'edit', () => openDeviceTypeModal(deviceType));
    const deleteButton = createActionButton('✕', 'delete', (e) => handleDeviceTypeDeletion(deviceType.deviceTypeId, e));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    header.appendChild(title);
    header.appendChild(actions);

    const content = document.createElement('section');
    content.className = 'card-content';

    if (deviceType.description) {
        content.appendChild(createInfoRow('Description', deviceType.description));
    }

    content.appendChild(createInfoRow('Created', formatDateTime(deviceType.createdAt)));

    card.appendChild(header);
    card.appendChild(content);

    return card;
}

export function openDeviceTypeModal(deviceType = null) {
    const isEditMode = !!deviceType;
    applicationState.currentModal = {
        type: 'deviceType',
        data: deviceType,
        isEditMode
    };

    document.getElementById('modalTitle').textContent = isEditMode ? 'Edit Device Type' : 'New Device Type';

    const formFields = document.getElementById('formFields');
    clearContainer(formFields);

    formFields.appendChild(createInputField('name', 'text', 'Device Type Name', deviceType?.name || '', true));
    formFields.appendChild(createTextareaField('description', 'Description', deviceType?.description || '', false));

    openModal();
}

export async function processDeviceTypeSubmission(data) {
    const submitButton = document.querySelector('.modal-actions button[type="submit"]');
    
    if (submitButton) {
        showButtonLoader(submitButton, submitButton.textContent);
    }
    
    try {
        if (applicationState.currentModal.isEditMode) {
            await deviceTypeService.updateDeviceType(applicationState.currentModal.data.deviceTypeId, data);
        } else {
            await deviceTypeService.createDeviceType(data);
        }
        await loadDeviceTypes();
    } catch (error) {
        console.error('Failed to process device type:', error);
        throw error; // Re-throw so handleFormSubmission can catch it
    } finally {
        if (submitButton) {
            hideButtonLoader(submitButton);
        }
    }
}

export async function handleDeviceTypeDeletion(deviceTypeId, event) {

    const confirmed = await showConfirm(
        'Are you sure you want to delete this device type? This action cannot be undone.',
        'Delete Device Type',
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
        await deviceTypeService.deleteDeviceType(deviceTypeId);
        await loadDeviceTypes();
    } catch (error) {
        await showWarning(error.message || 'Failed to delete device type', "Deletion Error");
        if (deleteButton) {
            hideButtonLoader(deleteButton);
        }
    }
}