import { groupService } from "../services/groups.service.js";
import { applicationState } from '../state.js';
import { 
    openModal, 
    closeModal, 
    createInputField, 
    createSelectField,
    createActionButton,
    createInfoRow,
    createSimpleCard,
    displayEmptyState,
    clearContainer,
    formatDateTime,
    showLoader,
    showButtonLoader,
    hideButtonLoader,
    showWarning,
    showConfirm
} from '../ui.js';

export async function loadGroups() {
    showLoader('groupsList', 'groups');
    
    try {
        applicationState.groups = await groupService.getAllGroups();
        renderGroupsList();
    } catch (error) {
        console.error('Failed to load groups:', error);
        displayEmptyState('groupsList', 'Failed to load groups. Please try again.');
    }
}

export function renderGroupsList() {
    const container = document.getElementById('groupsList');
    clearContainer(container);

    if (applicationState.groups.length === 0) {
        displayEmptyState('groupsList', 'No groups yet. Create your first group!');
        return;
    }

    const topLevelGroups = applicationState.groups.filter(group => !group.parentGroupId);
    
    topLevelGroups.forEach(group => {
        const groupElement = createGroupElement(group);
        container.appendChild(groupElement);
    });
}

function createGroupElement(group) {
    const container = document.createElement('article');
    container.className = 'expandable-item';

    const header = document.createElement('button');
    header.className = 'expandable-header';

    const expandIcon = document.createElement('span');
    expandIcon.className = 'expand-icon';
    expandIcon.textContent = '›';

    const title = document.createElement('strong');
    title.textContent = group.name;
    title.style.flex = '1';

    const actions = document.createElement('section');
    actions.className = 'card-actions';
    actions.addEventListener('click', (event) => event.stopPropagation());

    const editButton = createActionButton('✎', 'edit', () => openGroupModal(group));
    const deleteButton = createActionButton('✕', 'delete', (e) => handleGroupDeletion(group.groupId, e));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    header.appendChild(expandIcon);
    header.appendChild(title);
    header.appendChild(actions);

    const content = document.createElement('section');
    content.className = 'expandable-content';

    const body = document.createElement('section');
    body.className = 'expandable-body';

    const details = document.createElement('section');
    details.className = 'card-content';

    if (group.parentGroupId) {
        const parentGroup = applicationState.groups.find(g => g.groupId === group.parentGroupId);
        details.appendChild(createInfoRow('Parent Group', parentGroup ? parentGroup.name : 'Unknown'));
    }

    details.appendChild(createInfoRow('Created', formatDateTime(group.createdAt)));

    body.appendChild(details);

    const childGroups = applicationState.groups.filter(g => g.parentGroupId === group.groupId);
    if (childGroups.length > 0) {
        const childrenContainer = document.createElement('section');
        childrenContainer.style.marginTop = 'var(--spacing-md)';
        childrenContainer.style.paddingLeft = 'var(--spacing-lg)';
        
        const indicator = document.createElement('p');
        indicator.textContent = 'Child groups:';
        indicator.style.marginBottom = 'var(--spacing-sm)';
        childrenContainer.appendChild(indicator);
        childGroups.forEach(childGroup => {
            const childCard = createSimpleCard(
                childGroup.name, 
                () => openGroupModal(childGroup), 
                (e) => handleGroupDeletion(childGroup.groupId, e)
            );
            childrenContainer.appendChild(childCard);
        });
        
        body.appendChild(childrenContainer);
    }
    content.appendChild(body);

    header.addEventListener('click', () => {
        container.classList.toggle('expanded');
    });

    container.appendChild(header);
    container.appendChild(content);

    return container;
}

export function openGroupModal(group = null) {
    const isEditMode = !!group;
    applicationState.currentModal = {
        type: 'group',
        data: group,
        isEditMode
    };

    document.getElementById('modalTitle').textContent = isEditMode ? 'Edit Group' : 'New Group';

    const formFields = document.getElementById('formFields');
    clearContainer(formFields);

    formFields.appendChild(createInputField('name', 'text', 'Group Name', group?.name || '', true));

    const parentGroupOptions = [
        { value: '', label: 'None' },
        ...applicationState.groups
            .filter(g => !group || g.groupId !== group.groupId)
            .map(g => ({ value: g.groupId, label: g.name }))
    ];

    formFields.appendChild(createSelectField('parentGroupId', 'Parent Group', parentGroupOptions, group?.parentGroupId || ''));

    openModal();
}

export async function processGroupSubmission(data) {
    const submitButton = document.querySelector('.modal-actions button[type="submit"]');
    
    if (submitButton) {
        showButtonLoader(submitButton, submitButton.textContent);
    }
    
    try {
        if (applicationState.currentModal.isEditMode) {
            await groupService.updateGroup(applicationState.currentModal.data.groupId, data);
        } else {
            await groupService.createGroup(data);
        }
        await loadGroups();
    } catch (error) {
        console.error('Failed to process group:', error);
        throw error; // Re-throw so handleFormSubmission can catch it
    } finally {
        if (submitButton) {
            hideButtonLoader(submitButton);
        }
    }
}

export async function handleGroupDeletion(groupId, event) {
    const confirmed = await showConfirm(
        'Are you sure you want to delete this group? This action cannot be undone.',
        'Delete Group',
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
        await groupService.deleteGroup(groupId);
        await loadGroups();
    } catch (error) {
        await showWarning(error.message || 'Failed to delete group', "Deletion Error");
        if (deleteButton) {
            hideButtonLoader(deleteButton);
        }
    }
}