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
        const groupElement = createGroupElement(group, 0);
        container.appendChild(groupElement);
    });
}

function createGroupElement(group, nestingLevel = 0) {
    const container = document.createElement('article');
    container.className = 'expandable-item';
    
    if (nestingLevel > 0) {
        container.style.marginLeft = `${Math.min(nestingLevel * 12, 48)}px`;
        container.style.borderLeft = `2px solid rgba(var(--primary-rgb, 99, 102, 241), ${Math.max(0.15, 0.5 - nestingLevel * 0.05)})`;
        container.style.paddingLeft = '8px';
    }

    const header = document.createElement('button');
    header.className = 'expandable-header';
    
    if (nestingLevel > 3) {
        header.style.fontSize = '0.9rem';
        header.style.padding = '8px 12px';
    }

    const childGroups = applicationState.groups.filter(g => g.parentGroupId === group.groupId);
    const hasChildren = childGroups.length > 0;

    const expandIcon = document.createElement('span');
    expandIcon.className = 'expand-icon';
    expandIcon.textContent = hasChildren ? '›' : '';
    expandIcon.style.opacity = hasChildren ? '1' : '0';
    expandIcon.style.width = '20px';

    const title = document.createElement('strong');
    title.textContent = group.name;
    title.style.flex = '1';
    
    if (nestingLevel > 2) {
        const levelBadge = document.createElement('span');
        levelBadge.textContent = `L${nestingLevel}`;
        levelBadge.style.fontSize = '0.7rem';
        levelBadge.style.padding = '2px 6px';
        levelBadge.style.marginLeft = '8px';
        levelBadge.style.borderRadius = '4px';
        levelBadge.style.background = 'rgba(var(--primary-rgb, 99, 102, 241), 0.1)';
        levelBadge.style.color = 'var(--primary, #6366f1)';
        title.appendChild(levelBadge);
    }

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

    // Show full hierarchy path for deeply nested items
    if (nestingLevel > 1) {
        const pathParts = [];
        let currentGroup = group;
        while (currentGroup.parentGroupId) {
            const parent = applicationState.groups.find(g => g.groupId === currentGroup.parentGroupId);
            if (parent) {
                pathParts.unshift(parent.name);
                currentGroup = parent;
            } else {
                break;
            }
        }
        if (pathParts.length > 0) {
            details.appendChild(createInfoRow('Path', pathParts.join(' → ')));
        }
    }

    details.appendChild(createInfoRow('Created', formatDateTime(group.createdAt)));
    
    if (hasChildren) {
        const totalDescendants = countAllDescendants(group.groupId);
        const childText = childGroups.length === 1 ? '1 direct child' : `${childGroups.length} direct children`;
        const descendantText = totalDescendants > childGroups.length 
            ? ` (${totalDescendants} total)` 
            : '';
        details.appendChild(createInfoRow('Children', childText + descendantText));
    }

    body.appendChild(details);

    if (hasChildren) {
        const childrenContainer = document.createElement('section');
        childrenContainer.style.marginTop = 'var(--spacing-sm)';
        
        if (nestingLevel > 2) {
            childrenContainer.style.marginTop = '4px';
        }

        if (childGroups.length > 5) {
            const controlBar = document.createElement('div');
            controlBar.style.marginBottom = '8px';
            controlBar.style.fontSize = '0.85rem';
            controlBar.style.display = 'flex';
            controlBar.style.gap = '8px';
            
            const expandAllBtn = document.createElement('button');
            expandAllBtn.textContent = `Expand all ${childGroups.length}`;
            expandAllBtn.className = 'btn-link';
            expandAllBtn.style.padding = '4px 8px';
            expandAllBtn.onclick = (e) => {
                e.stopPropagation();
                childrenContainer.querySelectorAll('.expandable-item').forEach(item => {
                    item.classList.add('expanded');
                });
            };
            
            const collapseAllBtn = document.createElement('button');
            collapseAllBtn.textContent = 'Collapse all';
            collapseAllBtn.className = 'btn-link';
            collapseAllBtn.style.padding = '4px 8px';
            collapseAllBtn.onclick = (e) => {
                e.stopPropagation();
                childrenContainer.querySelectorAll('.expandable-item').forEach(item => {
                    item.classList.remove('expanded');
                });
            };
            
            controlBar.appendChild(expandAllBtn);
            controlBar.appendChild(collapseAllBtn);
            childrenContainer.appendChild(controlBar);
        }
        
        childGroups.forEach(childGroup => {
            const childElement = createGroupElement(childGroup, nestingLevel + 1);
            childrenContainer.appendChild(childElement);
        });

        body.appendChild(childrenContainer);
    }
    
    content.appendChild(body);

    // Only make clickable if there are children
    if (hasChildren) {
        header.addEventListener('click', () => {
            container.classList.toggle('expanded');
        });
        header.style.cursor = 'pointer';
    } else {
        header.style.cursor = 'default';
    }

    container.appendChild(header);
    container.appendChild(content);

    return container;
}
function countAllDescendants(groupId) {
    let count = 0;
    const children = applicationState.groups.filter(g => g.parentGroupId === groupId);
    count += children.length;
    children.forEach(child => {
        count += countAllDescendants(child.groupId);
    });
    return count;
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

    const getDescendantIds = (groupId) => {
        const descendants = new Set();
        const findDescendants = (id) => {
            applicationState.groups
                .filter(g => g.parentGroupId === id)
                .forEach(child => {
                    descendants.add(child.groupId);
                    findDescendants(child.groupId);
                });
        };
        findDescendants(groupId);
        return descendants;
    };

    const excludedIds = group ? new Set([group.groupId, ...getDescendantIds(group.groupId)]) : new Set();

    const buildHierarchicalOptions = () => {
        const options = [{ value: '', label: 'None (Top Level)' }];
        
        const addGroupWithIndent = (grp, level = 0) => {
            if (excludedIds.has(grp.groupId)) return;
            
            const indent = '　'.repeat(level);
            const arrow = level > 0 ? '└─ ' : '';
            options.push({ 
                value: grp.groupId, 
                label: `${indent}${arrow}${grp.name}`
            });
            
            const children = applicationState.groups
                .filter(g => g.parentGroupId === grp.groupId)
                .sort((a, b) => a.name.localeCompare(b.name));
            
            children.forEach(child => addGroupWithIndent(child, level + 1));
        };
        
        const topLevel = applicationState.groups
            .filter(g => !g.parentGroupId && !excludedIds.has(g.groupId))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        topLevel.forEach(grp => addGroupWithIndent(grp, 0));
        
        return options;
    };

    const parentGroupOptions = buildHierarchicalOptions();

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
        throw error;
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