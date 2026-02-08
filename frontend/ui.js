import { applicationState } from './state.js';

export function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

export function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('modalForm').reset();
    applicationState.currentModal = null;
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
        alert(error.message || 'An error occurred while saving');
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
