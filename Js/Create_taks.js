import { createTodo, getTodos, deleteTodo, updateTodo, getTodo, completeTodo } from '../Api/Api.js';

// DOM Elements
const createButton = document.getElementById('createBtn');
const taskList = document.getElementById('taskList');
const taskCreateModal = document.getElementById('taskCreateModal');
const closeCreateModal = document.getElementById('closeCreateModal');
const taskViewModal = document.getElementById('taskViewModal');
const closeTaskViewModal = document.getElementById('closeTaskViewModal');
const taskEditModal = document.getElementById('taskEditModal');
const closeEditModal = document.getElementById('closeEditModal');
const taskForm = document.getElementById('taskForm');
const editTaskForm = document.getElementById('editTaskForm');
const filterSelect = document.getElementById('filter');

let currentEditingTask = null;
let currentTaskInView = null;

const formatDueDate = (date, time) => {
    if (!date) return 'No due date';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dueDate = new Date(`${date}T${time || '00:00:00'}`);
    return dueDate.toLocaleDateString('en-US', options) + (time ? ` at ${time}` : '');
};

const getPriorityLabel = (priority) => {
    switch (priority) {
        case 'urgent_priority': return 'Urgent ⚠️';
        case 'high_priority': return 'High Priority 🔥';
        case 'medium_priority': return 'Medium Priority ⚖️';
        case 'low_priority': return 'Low Priority 🕒';
        default: return 'Medium Priority ⚖️';
    }
};

const truncateDescription = (description) => {
    const maxLength = 100;
    if (!description) return 'No description';
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
};

// Modal functions
const openCreateModal = () => {
    taskCreateModal.style.display = 'block';
};

const closeCreateModalHandler = () => {
    taskCreateModal.style.display = 'none';
    taskForm.reset();
};

const openEditModal = (task) => {
    currentEditingTask = task;

    document.getElementById('editTaskTitle').value = task.title || '';
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskDate').value = task.date || '';
    document.getElementById('editTaskTime').value = task.time || '';
    document.getElementById('editTaskCategory').value = task.category || 'home';
    document.getElementById('editTaskPriority').value = task.priority || 'medium_priority';

    taskEditModal.style.display = 'block';
};

const closeEditModalHandler = () => {
    taskEditModal.style.display = 'none';
    editTaskForm.reset();
    currentEditingTask = null;
};

const openTaskViewModal = (task) => {
    currentTaskInView = task;
    const modalContent = document.querySelector('#taskViewModal .modal-content');
    const completeBtn = document.getElementById('completeTaskBtn');

    // Reset classes
    modalContent.className = 'modal-content';
    modalContent.classList.add(`priority-${task.priority}`);

    // Mostra/esconde o botão de completar
    if (task.completed) {
        completeBtn.style.display = 'none'; // Esconde se já está completa
    } else {
        completeBtn.style.display = 'block'; // Mostra se está pendente
    }

    // Restante do código da função permanece igual...
    document.getElementById('modalTaskTitle').textContent = task.title || 'No Title';
    document.getElementById('modalTaskDescription').textContent = task.description || 'No Description';
    document.getElementById('modalTaskPriority').textContent = getPriorityLabel(task.priority);
    document.getElementById('modalTaskCategory').textContent = task.category || 'No Category';
    document.getElementById('modalTaskDueDate').textContent = formatDueDate(task.date, task.time);

    // Set status
    const statusElement = document.getElementById('modalTaskStatus');
    if (task.completed) {
        statusElement.textContent = 'Completed';
        statusElement.className = 'info-value status-completed';
    } else {
        statusElement.textContent = 'Pending';
        statusElement.className = 'info-value status-pending';
    }

    // Show modal
    taskViewModal.style.display = 'block';
};

// Complete task from modal
document.getElementById('completeTaskBtn').addEventListener('click', async (e) => {
    e.stopPropagation();
    const taskId = currentTaskInView?.id;
    if (!taskId) return;

    try {
        await completeTodo(taskId);
        const statusElement = document.getElementById('modalTaskStatus');
        statusElement.textContent = 'Completed';
        statusElement.className = 'info-value status-completed';
        document.getElementById('completeTaskBtn').classList.add('completed');

        // Atualiza a lista após marcar como concluído
        await displayTasks();
    } catch (error) {
        console.error("Error completing task:", error);
        alert("Failed to complete task. Please try again.");
    }
});

const closeTaskViewModalHandler = () => {
    taskViewModal.style.display = 'none';
};

// Display tasks
const displayTasks = async () => {
    try {
        const tasks = await getTodos();

        // Sort by nearest due date
        tasks.sort((a, b) => {
            const aDate = new Date(`${a.date || '9999-12-31'}T${a.time || '23:59'}`);
            const bDate = new Date(`${b.date || '9999-12-31'}T${b.time || '23:59'}`);
            return aDate - bDate;
        });

        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks found. Create your first task!</li>';
            return;
        }

        tasks.forEach((task, index) => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item priority-${task.priority}`;
            taskElement.style.setProperty('--order', index);

            const priorityLabel = getPriorityLabel(task.priority);
            const dueDate = formatDueDate(task.date, task.time);

            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title ${task.completed ? 'completed-task' : ''}">${task.title || 'No Title'}</h3>
                    <span class="task-priority priority-${task.priority}">${priorityLabel}</span>
                </div>
                <div class="task-content">
                    <p class="task-description">${truncateDescription(task.description)}</p>
                </div>
                <div class="task-footer">
                    <task-status status="${task.completed ? 'completed' : 'pending'}"></task-status>
                    <span class="task-category">${task.category || 'No Category'}</span>
                    <span class="task-date">${dueDate}</span>
                    <div class="task-actions">
                        <button class="edit-task-btn" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="delete-task-btn" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            taskElement.querySelector('.edit-task-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(task);
            });

            taskElement.querySelector('.delete-task-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this task?")) {
                    await deleteTodo(task.id);
                    await displayTasks();
                }
            });

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

    const date = document.getElementById('taskdate').value;
    const time = document.getElementById('tasktime').value;

    let taskDateTime = new Date();
    if (date && time) {
        taskDateTime = new Date(`${date}T${time}`);
        if (taskDateTime < new Date()) {
            alert("You can't set a date/time in the past.");
            return;
        }
    } else {
        taskDateTime = new Date(Date.now() + 10 * 60 * 1000);
    }

    const isoDate = taskDateTime.toISOString().split('T')[0];
    const isoTime = taskDateTime.toTimeString().slice(0, 5);

    const newTask = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: document.getElementById('taskCategoryPriority').value,
        category: document.getElementById('taskCategoryCategory').value,
        date: isoDate,
        time: isoTime,
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

// Update existing task
const updateTask = async (event) => {
    event.preventDefault();

    if (!currentEditingTask) return;

    const date = document.getElementById('editTaskDate').value;
    const time = document.getElementById('editTaskTime').value;

    let taskDateTime = new Date();
    if (date && time) {
        taskDateTime = new Date(`${date}T${time}`);
        if (taskDateTime < new Date()) {
            alert("You can't set a date/time in the past.");
            return;
        }
    } else {
        taskDateTime = new Date(Date.now() + 10 * 60 * 1000);
    }

    const isoDate = taskDateTime.toISOString().split('T')[0];
    const isoTime = taskDateTime.toTimeString().slice(0, 5);

    const updatedTask = {
        ...currentEditingTask,
        title: document.getElementById('editTaskTitle').value,
        description: document.getElementById('editTaskDescription').value,
        priority: document.getElementById('editTaskPriority').value,
        category: document.getElementById('editTaskCategory').value,
        date: isoDate,
        time: isoTime,
    };

    try {
        await updateTodo(currentEditingTask.id, updatedTask);
        closeEditModalHandler();
        await displayTasks();
    } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task. Please try again.");
    }
};

// Filter tasks - ATUALIZADA PARA OS NOVOS FILTROS
const filterTasks = async () => {
    const filterValue = filterSelect.value;

    try {
        const tasks = await getTodos();

        // Sort by nearest due date
        tasks.sort((a, b) => {
            const aDate = new Date(`${a.date || '9999-12-31'}T${a.time || '23:59'}`);
            const bDate = new Date(`${b.date || '9999-12-31'}T${b.time || '23:59'}`);
            return aDate - bDate;
        });

        taskList.innerHTML = '';

        let filteredTasks = [];
        if (filterValue === 'all') {
            filteredTasks = tasks;
        } else if (filterValue === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filterValue === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if ([
            'urgent_priority',
            'high_priority',
            'medium_priority',
            'low_priority'
        ].includes(filterValue)) {
            filteredTasks = tasks.filter(task => task.priority === filterValue);
        } else {
            filteredTasks = tasks.filter(task => task.category === filterValue);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks match this filter.</li>';
            return;
        }

        filteredTasks.forEach((task, index) => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item priority-${task.priority}`;
            taskElement.style.setProperty('--order', index);

            const priorityLabel = getPriorityLabel(task.priority);
            const dueDate = formatDueDate(task.date, task.time);

            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title ${task.completed ? 'completed-task' : ''}">${task.title || 'No Title'}</h3>
                    <span class="task-priority priority-${task.priority}">${priorityLabel}</span>
                </div>
                <div class="task-content">
                    <p class="task-description">${truncateDescription(task.description)}</p>
                </div>
                <div class="task-footer">
                    <task-status status="${task.completed ? 'completed' : 'pending'}"></task-status>
                    <span class="task-category">${task.category || 'No Category'}</span>
                    <span class="task-date">${dueDate}</span>
                    <div class="task-actions">
                        <button class="edit-task-btn" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="delete-task-btn" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            taskElement.querySelector('.edit-task-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(task);
            });

            taskElement.querySelector('.delete-task-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this task?")) {
                    await deleteTodo(task.id);
                    await displayTasks();
                }
            });

            taskElement.addEventListener('click', () => openTaskViewModal(task));
            taskList.appendChild(taskElement);
        });
    } catch (error) {
        console.error("Error filtering tasks:", error);
        taskList.innerHTML = '<li class="error">Error filtering tasks. Please try again.</li>';
    }
};

// Initialize date inputs
const initializeDateInputs = () => {
    const dateInput = document.getElementById('taskdate');
    const timeInput = document.getElementById('tasktime');
    const editDateInput = document.getElementById('editTaskDate');
    const editTimeInput = document.getElementById('editTaskTime');

    const updateTimeMin = (dateInput, timeInput) => {
        const selectedDate = new Date(dateInput.value);
        const now = new Date();

        if (selectedDate.toDateString() === now.toDateString()) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeInput.min = `${hours}:${minutes}`;
        } else {
            timeInput.removeAttribute('min');
        }
    };

    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    editDateInput.min = today;

    dateInput.addEventListener('change', () => updateTimeMin(dateInput, timeInput));
    editDateInput.addEventListener('change', () => updateTimeMin(editDateInput, editTimeInput));

    updateTimeMin(dateInput, timeInput);
};

// Event listeners
createButton.addEventListener('click', openCreateModal);
closeCreateModal.addEventListener('click', closeCreateModalHandler);
closeEditModal.addEventListener('click', closeEditModalHandler);
closeTaskViewModal.addEventListener('click', closeTaskViewModalHandler);
taskForm.addEventListener('submit', createTask);
editTaskForm.addEventListener('submit', updateTask);
filterSelect.addEventListener('change', filterTasks);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDateInputs();
    displayTasks();
});

