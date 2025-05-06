import { createTodo, getTodos } from '../Api/Api.js';

// DOM Elements
const createButton = document.getElementById('createBtn');
const taskList = document.getElementById('taskList');
const taskCreateModal = document.getElementById('taskCreateModal');
const closeCreateModal = document.getElementById('closeCreateModal');
const taskViewModal = document.getElementById('taskViewModal');
const closeTaskViewModal = document.getElementById('closeTaskViewModal');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const submitTaskBtn = document.getElementById('submitTaskBtn');
const filterSelect = document.getElementById('filter');

// Priority mapping
const mapPriority = (apiPriority) => {
    switch(apiPriority) {
        case 'high': return 'high_priority';
        case 'medium': return 'medium_priority';
        case 'low': return 'low_priority';
        case 'urgent': return 'urgent';
        default: return 'low_priority';
    }
};

// Modal functions
const openCreateModal = () => {
    taskCreateModal.style.display = 'block';
};

const closeCreateModalHandler = () => {
    taskCreateModal.style.display = 'none';
    taskForm.reset();
};

const openTaskViewModal = (task) => {
    const modalContent = document.querySelector('#taskViewModal .modal-content');
    
    // Clear all priority classes
    modalContent.classList.remove(
        'priority-urgent',
        'priority-high_priority',
        'priority-medium_priority',
        'priority-low_priority'
    );
    
    // Add correct priority class
    const priorityClass = mapPriority(task.priority);
    modalContent.classList.add(`priority-${priorityClass}`);
    
    // Set modal content
    document.getElementById('modalTaskTitle').textContent = task.title || 'No Title';
    document.getElementById('modalTaskDescription').textContent = task.description || 'No Description';
    
    // Update metadata
    const metaContainer = document.createElement('div');
    metaContainer.className = 'modal-meta';
    metaContainer.innerHTML = `
        <div class="modal-meta-item">
            <span class="meta-label">Priority:</span>
            <span class="meta-value priority-${priorityClass}">${getPriorityLabel(task.priority)}</span>
        </div>
        <div class="modal-meta-item">
            <span class="meta-label">Category:</span>
            <span class="meta-value">${task.category || 'No Category'}</span>
        </div>
        <div class="modal-meta-item">
            <span class="meta-label">Due Date:</span>
            <span class="meta-value">${formatDueDate(task.date, task.time)}</span>
        </div>
    `;
    
    // Replace old metadata
    const oldMeta = document.querySelector('#taskViewModal .modal-meta');
    if (oldMeta) oldMeta.remove();
    modalContent.insertBefore(metaContainer, document.getElementById('modalTaskDescription'));
    
    taskViewModal.style.display = 'block';
};

const closeTaskViewModalHandler = () => {
    taskViewModal.style.display = 'none';
};

// Helper functions
const formatDueDate = (date, time) => {
    if (!date) return 'No due date';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dueDate = new Date(`${date}T${time || '00:00:00'}`);
    return dueDate.toLocaleDateString('en-US', options) + (time ? ` at ${time}` : '');
};

const getPriorityLabel = (priority) => {
    const normalizedPriority = mapPriority(priority);
    switch (normalizedPriority) {
        case 'urgent': return 'Urgent ⚠️';
        case 'high_priority': return 'High Priority 🔥';
        case 'medium_priority': return 'Medium Priority ⚖️';
        case 'low_priority': return 'Low Priority 🕒';
        default: return 'No Priority';
    }
};

const truncateDescription = (description) => {
    const maxLength = 100;
    if (!description) return 'No description';
    if (description.length > maxLength) {
        return description.slice(0, maxLength) + '...';
    }
    return description;
};

// Display tasks
const displayTasks = async () => {
    try {
        const response = await getTodos();
        const tasks = Array.isArray(response) ? response : [];
        
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks found. Create your first task!</li>';
            return;
        }

        tasks.forEach((task, index) => {
            const taskElement = document.createElement('li');
            const priorityClass = mapPriority(task.priority);
            
            // Add priority class to task element
            taskElement.className = `task-item priority-${priorityClass}`;
            taskElement.style.setProperty('--order', index);
            
            const priorityLabel = getPriorityLabel(task.priority);
            const dueDate = formatDueDate(task.date, task.time);

            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title || 'No Title'}</h3>
                    <span class="task-priority priority-${priorityClass}">${priorityLabel}</span>
                </div>
                <div class="task-content">
                    <p class="task-description">${truncateDescription(task.description)}</p>
                </div>
                <div class="task-footer">
                    <span class="task-category">${task.category || 'No Category'}</span>
                    <span class="task-date">${dueDate}</span>
                </div>
            `;

            taskElement.addEventListener('click', () => openTaskViewModal(task));
            taskList.appendChild(taskElement);
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        taskList.innerHTML = '<li class="error">Error loading tasks. Please try again.</li>';
    }
};

// Create new task
const createTask = async (event) => {
    event.preventDefault();

    const newTask = {
        title: taskTitle.value,
        description: taskDescription.value,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: document.getElementById('taskCategoryPriority').value,
        category: document.getElementById('taskCategoryCategory').value,
        date: document.getElementById('taskdate').value,
        time: document.getElementById('tasktime').value,
    };

    try {
        await createTodo(newTask);
        closeCreateModalHandler();
        await displayTasks();
    } catch (error) {
        console.error("Error creating task:", error);
        alert("Failed to create task. Please try again.");
    }
};

// Filter tasks
const filterTasks = async () => {
    const filterValue = filterSelect.value;
    
    try {
        const response = await getTodos();
        const tasks = Array.isArray(response) ? response : [];
        
        taskList.innerHTML = '';

        const filteredTasks = filterValue === 'all' 
            ? tasks 
            : tasks.filter(task => task.category === filterValue);

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks match this filter.</li>';
            return;
        }

        filteredTasks.forEach((task, index) => {
            const taskElement = document.createElement('li');
            const priorityClass = mapPriority(task.priority);
            
            taskElement.className = `task-item priority-${priorityClass}`;
            taskElement.style.setProperty('--order', index);
            
            const priorityLabel = getPriorityLabel(task.priority);
            const dueDate = formatDueDate(task.date, task.time);

            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title || 'No Title'}</h3>
                    <span class="task-priority priority-${priorityClass}">${priorityLabel}</span>
                </div>
                <div class="task-content">
                    <p class="task-description">${truncateDescription(task.description)}</p>
                </div>
                <div class="task-footer">
                    <span class="task-category">${task.category || 'No Category'}</span>
                    <span class="task-date">${dueDate}</span>
                </div>
            `;

            taskElement.addEventListener('click', () => openTaskViewModal(task));
            taskList.appendChild(taskElement);
        });
    } catch (error) {
        console.error("Error filtering tasks:", error);
        taskList.innerHTML = '<li class="error">Error filtering tasks. Please try again.</li>';
    }
};

// Event listeners
createButton.addEventListener('click', openCreateModal);
closeCreateModal.addEventListener('click', closeCreateModalHandler);
closeTaskViewModal.addEventListener('click', closeTaskViewModalHandler);
taskForm.addEventListener('submit', createTask);
filterSelect.addEventListener('change', filterTasks);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayTasks();
});