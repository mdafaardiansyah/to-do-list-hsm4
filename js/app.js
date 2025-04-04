/**
 * @fileoverview Logika aplikasi utama untuk To-Do List
 * @author Muhammad Dafa Ardiansyah
 * @version 1.0.0
 * @requires ./utils.js
 */

// DOM Elements
const taskInput = document.getElementById('task-input');
const priorityBtns = document.querySelectorAll('.priority-btn');
const submitBtn = document.getElementById('submit-btn');
const todoContainer = document.getElementById('todo-container');
const doneContainer = document.getElementById('done-container');
const deleteBtn = document.getElementById('delete-btn');
const tabs = document.querySelectorAll('.tab');
const userName = document.getElementById('user-name');
const userPosition = document.getElementById('user-position');

/**
 * Array untuk menyimpan semua tugas
 * @type {Array<Task>}
 */
let tasks = [];

/**
 * Menyimpan prioritas yang dipilih untuk tugas baru
 * @type {string|null}
 */
let selectedPriority = null;

/**
 * Inisialisasi aplikasi, dijalankan saat halaman dimuat
 *
 * @function init
 * @returns {void}
 */
function init() {
    // Load tasks from localStorage
    tasks = loadTasks();

    // Load user profile from localStorage or set default
    const profile = loadUserProfile();
    if (profile) {
        userName.textContent = profile.name;
        userPosition.textContent = profile.position;
    } else {
        // Ask for user info on first load
        setTimeout(() => {
            const name = prompt('Enter your name:', 'John Doe');
            const position = prompt('Enter your position:', 'Software Developer');

            if (name) userName.textContent = name;
            if (position) userPosition.textContent = position;

            // Save to localStorage
            saveUserProfile({
                name: name || 'John Doe',
                position: position || 'Software Developer'
            });
        }, 500);
    }

    // Set current date
    updateDateTime();

    // Update the task lists
    renderTasks();

    // Set up event listeners
    setupEventListeners();
}

/**
 * Menyiapkan event listener untuk interaksi pengguna
 *
 * @function setupEventListeners
 * @returns {void}
 */
function setupEventListeners() {
    // Priority buttons
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all buttons
            priorityBtns.forEach(otherBtn => {
                otherBtn.classList.remove('selected');
            });

            // Add selected class to clicked button
            btn.classList.add('selected');

            // Update selected priority
            selectedPriority = btn.dataset.priority;

            // Enable submit button if task input has text
            validateForm(taskInput, selectedPriority, submitBtn);
        });
    });

    // Task input
    taskInput.addEventListener('input', () => {
        validateForm(taskInput, selectedPriority, submitBtn);
    });

    // Submit button
    submitBtn.addEventListener('click', addTask);

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding container
            if (tab.dataset.tab === 'todo') {
                todoContainer.style.display = 'block';
                doneContainer.style.display = 'none';
            } else {
                todoContainer.style.display = 'none';
                doneContainer.style.display = 'block';
            }
        });
    });

    // Delete button
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks(tasks);
            renderTasks();
        }
    });
}

/**
 * Menambahkan tugas baru ke daftar
 *
 * @function addTask
 * @returns {void}
 */
function addTask() {
    const taskText = taskInput.value.trim();

    if (!taskText || !selectedPriority) return;

    const now = new Date();

    /**
     * Objek tugas baru yang akan ditambahkan
     * @type {Task}
     */
    const newTask = {
        id: Date.now(),
        text: taskText,
        priority: selectedPriority,
        completed: false,
        createdAt: now.toISOString(),
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    tasks.unshift(newTask); // Add to beginning of array
    saveTasks(tasks);
    renderTasks();

    // Reset form
    taskInput.value = '';
    priorityBtns.forEach(btn => btn.classList.remove('selected'));
    selectedPriority = null;
    submitBtn.disabled = true;
}

/**
 * Mengubah status penyelesaian tugas
 *
 * @function toggleTaskCompletion
 * @param {number} taskId - ID tugas yang akan diubah statusnya
 * @returns {void}
 */
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;

        // If task is being completed, add completion time
        if (tasks[taskIndex].completed) {
            tasks[taskIndex].completedAt = new Date().toISOString();
        } else {
            delete tasks[taskIndex].completedAt;
        }

        saveTasks(tasks);
        renderTasks();
    }
}

/**
 * Menghapus tugas individual dari daftar
 *
 * @function deleteTask
 * @param {number} taskId - ID tugas yang akan dihapus
 * @returns {void}
 */
function deleteTask(taskId) {
    // Konfirmasi penghapusan
    if (confirm('Are you sure you want to delete this task?')) {
        // Filter array tasks untuk menghapus tugas dengan ID yang cocok
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks(tasks);
        renderTasks();
    }
}

/**
 * Menampilkan daftar tugas ke antarmuka pengguna
 *
 * @function renderTasks
 * @returns {void}
 */
function renderTasks() {
    const todoTasks = tasks.filter(task => !task.completed);
    const doneTasks = tasks.filter(task => task.completed);

    // Render to-do tasks
    if (todoTasks.length === 0) {
        todoContainer.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No tasks yet. Add your first task!</p>
            </div>
        `;
    } else {
        todoContainer.innerHTML = todoTasks.map(task => createTaskElement(task)).join('');
    }

    // Render completed tasks
    if (doneTasks.length === 0) {
        doneContainer.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No completed tasks yet.</p>
            </div>
        `;
    } else {
        doneContainer.innerHTML = doneTasks.map(task => createTaskElement(task)).join('');
    }

    // Add event listeners to checkboxes
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            const taskId = parseInt(this.closest('.task-item').dataset.id);
            toggleTaskCompletion(taskId);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Menghentikan event agar tidak mempengaruhi elemen parent
            e.stopPropagation();

            // Mengambil ID tugas dari dataset
            const taskId = parseInt(this.closest('.task-item').dataset.id);

            // Menghapus tugas dengan ID yang sesuai
            deleteTask(taskId);
        });
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);