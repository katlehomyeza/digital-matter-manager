import { applicationState } from './state.js';

export function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

export function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('modalForm').reset();
    applicationState.currentModal = null;
}

export function showWarning(message, title = 'Warning') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active warning-modal';
        overlay.id = 'warningModalOverlay';

        const modal = document.createElement('div');
        modal.className = 'modal warning';

        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        header.appendChild(titleElement);

        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        content.appendChild(messageElement);

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        const okButton = document.createElement('button');
        okButton.className = 'btn btn-primary';
        okButton.textContent = 'OK';
        okButton.onclick = () => {
            overlay.remove();
            resolve();
        };
        
        footer.appendChild(okButton);

        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Focus the OK button
        setTimeout(() => okButton.focus(), 100);

        // Allow Enter key to close
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                overlay.remove();
                document.removeEventListener('keypress', handleKeyPress);
                resolve();
            }
        };
        document.addEventListener('keypress', handleKeyPress);
    });
}

// Confirm Modal - replaces confirm()
export function showConfirm(message, title = 'Confirm', options = {}) {
    const {
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        confirmClass = 'btn-danger'
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active confirm-modal';
        overlay.id = 'confirmModalOverlay';

        const modal = document.createElement('div');
        modal.className = 'modal confirm';

        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        header.appendChild(titleElement);

        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        content.appendChild(messageElement);

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = cancelText;
        cancelButton.onclick = () => {
            overlay.remove();
            resolve(false);
        };

        const confirmButton = document.createElement('button');
        confirmButton.className = `btn ${confirmClass}`;
        confirmButton.textContent = confirmText;
        confirmButton.onclick = () => {
            overlay.remove();
            resolve(true);
        };
        
        footer.appendChild(cancelButton);
        footer.appendChild(confirmButton);

        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Focus the cancel button by default (safer)
        setTimeout(() => cancelButton.focus(), 100);

        // Handle Escape key to cancel
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleKeyPress);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        };
    });
}

export async function handleFormSubmission(event, processGroupSubmission, processDeviceTypeSubmission, processFirmwareSubmission, processDeviceSubmission) {
    event.preventDefault();

    if (!applicationState.currentModal) return;

    const formData = new FormData(event.target);
    const data = {};

    for (const [key, value] of formData.entries()) {
        if (value === '') {
            data[key] = null;
        } else if (key.endsWith('Id') || key === 'deviceTypeId' || key === 'firmwareId' || key === 'groupId' || key === 'parentGroupId') {
            data[key] = parseInt(value);
        } else {
            data[key] = value;
        }
    }

    try {
        if (applicationState.currentModal.type === 'group') {
            await processGroupSubmission(data);
        } else if (applicationState.currentModal.type === 'deviceType') {
            await processDeviceTypeSubmission(data);
        } else if (applicationState.currentModal.type === 'firmware') {
            await processFirmwareSubmission(data);
        } else if (applicationState.currentModal.type === 'device') {
            await processDeviceSubmission(data);
        }

        closeModal();
    } catch (error) {
        await showWarning(error.message || 'An error occurred while saving');
    }
}

export function createInputField(name, type, label, value, required) {
    const group = document.createElement('section');
    group.className = 'form-group';

    const labelElement = document.createElement('label');
    labelElement.textContent = label + (required ? ' *' : '');
    labelElement.setAttribute('for', name);

    const input = document.createElement('input');
    input.type = type;
    input.id = name;
    input.name = name;
    input.value = value;
    if (required) {
        input.required = true;
    }

    group.appendChild(labelElement);
    group.appendChild(input);

    return group;
}

export function createTextareaField(name, label, value, required) {
    const group = document.createElement('section');
    group.className = 'form-group';

    const labelElement = document.createElement('label');
    labelElement.textContent = label + (required ? ' *' : '');
    labelElement.setAttribute('for', name);

    const textarea = document.createElement('textarea');
    textarea.id = name;
    textarea.name = name;
    textarea.value = value;
    if (required) {
        textarea.required = true;
    }

    group.appendChild(labelElement);
    group.appendChild(textarea);

    return group;
}

export function createSelectField(name, label, options, selectedValue, required = false) {
    const group = document.createElement('section');
    group.className = 'form-group';

    const labelElement = document.createElement('label');
    labelElement.textContent = label + (required ? ' *' : '');
    labelElement.setAttribute('for', name);

    const select = document.createElement('select');
    select.id = name;
    select.name = name;
    if (required) {
        select.required = true;
    }

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        if (String(option.value) === String(selectedValue)) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    group.appendChild(labelElement);
    group.appendChild(select);

    return group;
}

export function createActionButton(icon, className, onClick) {
    const button = document.createElement('button');
    button.className = `icon-button ${className}`;
    button.textContent = icon;
    button.addEventListener('click', onClick);
    return button;
}

export function createInfoRow(label, value) {
    const row = document.createElement('section');
    row.className = 'info-row';

    const labelElement = document.createElement('span');
    labelElement.className = 'info-label';
    labelElement.textContent = label;

    const valueElement = document.createElement('span');
    valueElement.className = 'info-value';
    valueElement.textContent = value;

    row.appendChild(labelElement);
    row.appendChild(valueElement);

    return row;
}

export function createSimpleCard(title, onEdit, onDelete) {
    const card = document.createElement('article');
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    card.style.padding = 'var(--spacing-sm)';
    card.style.marginBottom = 'var(--spacing-xs)';
    card.style.background = 'var(--color-gray-light)';
    card.style.borderRadius = 'var(--radius-md)';

    const titleElement = document.createElement('span');
    titleElement.textContent = title;

    const actions = document.createElement('section');
    actions.style.display = 'flex';
    actions.style.gap = 'var(--spacing-xs)';

    const editButton = createActionButton('✎', 'edit', onEdit);
    const deleteButton = createActionButton('✕', 'delete', onDelete);

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(titleElement);
    card.appendChild(actions);

    return card;
}

export function displayEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    clearContainer(container);

    const emptyState = document.createElement('section');
    emptyState.className = 'empty-state';

    const text = document.createElement('p');
    text.textContent = message;

    emptyState.appendChild(text);
    container.appendChild(emptyState);
}

export function clearContainer(container) {
    container.textContent = '';
}

export function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export function showLoader(containerId, component = 'data') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    clearContainer(container);
    
    const loader = document.createElement('div');
    loader.className = 'loader-container';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    const text = document.createElement('p');
    text.className = 'loader-text';
    text.textContent = `Loading ${component}...`;
    
    loader.appendChild(spinner);
    loader.appendChild(text);
    container.appendChild(loader);
}

export function showButtonLoader(button, originalText) {
    button.disabled = true;
    button.dataset.originalText = originalText;
    
    button.textContent = '';
    
    const spinnerSpan = document.createElement('span');
    spinnerSpan.className = 'button-spinner';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = 'Processing...';
    
    button.appendChild(spinnerSpan);
    button.appendChild(textSpan);
}

export function hideButtonLoader(button) {
    button.disabled = false;
    const originalText = button.dataset.originalText || 'Submit';
    button.textContent = originalText;
    delete button.dataset.originalText;
}