import { handleFormSubmission, closeModal } from './ui.js';
import { loadGroups, openGroupModal, processGroupSubmission } from './components/groups.js';
import { loadDeviceTypes, openDeviceTypeModal, processDeviceTypeSubmission } from './components/deviceTypes.js';
import { loadFirmware, openFirmwareModal, processFirmwareSubmission } from './components/firmware.js';
import { loadDevices, openDeviceModal, processDeviceSubmission } from './components/devices.js';

function initializeApplication() {
    setupNavigationHandlers();
    setupModalEventHandlers();
    setupAddButtonHandlers();
    loadAllData();
}

function setupNavigationHandlers() {
    const navigationMapping = {
        navGroups: 'groupsSection',
        navDeviceTypes: 'deviceTypesSection',
        navFirmware: 'firmwareSection',
        navDevices: 'devicesSection',
    };

    Object.entries(navigationMapping).forEach(([buttonId, sectionId]) => {
        const button = document.getElementById(buttonId);
        button.addEventListener('click', () => {
            activateSection(sectionId);
            setActiveNavigationButton(buttonId);
        });
    });
}

function activateSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function setActiveNavigationButton(activeButtonId) {
    document.querySelectorAll('.nav-item').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(activeButtonId).classList.add('active');
}

function setupModalEventHandlers() {
    const overlay = document.getElementById('modalOverlay');
    const closeButton = document.getElementById('modalClose');
    const cancelButton = document.getElementById('modalCancel');
    const form = document.getElementById('modalForm');

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    form.addEventListener('submit', (event) => {
        handleFormSubmission(
            event, 
            processGroupSubmission, 
            processDeviceTypeSubmission, 
            processFirmwareSubmission, 
            processDeviceSubmission
        );
    });
}

function setupAddButtonHandlers() {
    document.getElementById('addGroupButton').addEventListener('click', () => openGroupModal());
    document.getElementById('addDeviceTypeButton').addEventListener('click', () => openDeviceTypeModal());
    document.getElementById('addFirmwareButton').addEventListener('click', () => openFirmwareModal());
    document.getElementById('addDeviceButton').addEventListener('click', () => openDeviceModal());
}

async function loadAllData() {
    try {
        await Promise.all([
            loadGroups(),
            loadDeviceTypes(),
            loadFirmware()
        ]);
        await loadDevices();
    } catch (error) {
        console.error('Failed to load application data:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApplication);
