/**
 * @fileoverview Fungsi utilitas untuk aplikasi To-Do List
 * @author Muhammad Dafa Ardiansyah
 * @version 1.0.0
 */

/**
 * Memperbarui tampilan hari dan tanggal saat ini pada antarmuka pengguna
 *
 * @function updateDateTime
 * @returns {void}
 */
function updateDateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const currentDayEl = document.getElementById('current-day');
    const currentDateEl = document.getElementById('current-date');

    currentDayEl.textContent = days[now.getDay()];
    currentDateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

/**
 * Memvalidasi apakah form input tugas sudah valid untuk disubmit
 *
 * @function validateForm
 * @param {HTMLTextAreaElement} taskInput - Elemen input untuk teks tugas
 * @param {string|null} selectedPriority - Prioritas yang dipilih ("low", "medium", "high" atau null)
 * @param {HTMLButtonElement} submitBtn - Tombol submit yang akan diaktifkan/nonaktifkan
 * @returns {void}
 */
function validateForm(taskInput, selectedPriority, submitBtn) {
    if (taskInput.value.trim() && selectedPriority) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

/**
 * Menyimpan daftar tugas ke localStorage browser
 *
 * @function saveTasks
 * @param {Array<Task>} tasks - Array yang berisi objek tugas
 * @returns {void}
 */
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Mengambil daftar tugas dari localStorage browser
 *
 * @function loadTasks
 * @returns {Array<Task>} Array tugas dari localStorage atau array kosong jika tidak ada
 */
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
}

/**
 * Mengambil profil pengguna dari localStorage browser
 *
 * @function loadUserProfile
 * @returns {Object|null} Objek profil pengguna atau null jika tidak ada
 * @property {string} name - Nama pengguna
 * @property {string} position - Jabatan pengguna
 */
function loadUserProfile() {
    const savedProfile = localStorage.getItem('profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
}

/**
 * Menyimpan profil pengguna ke localStorage browser
 *
 * @function saveUserProfile
 * @param {Object} profile - Objek profil pengguna
 * @param {string} profile.name - Nama pengguna
 * @param {string} profile.position - Jabatan pengguna
 * @returns {void}
 */
function saveUserProfile(profile) {
    localStorage.setItem('profile', JSON.stringify(profile));
}

/**
 * Memeriksa apakah suatu tugas sudah terlambat (overdue)
 * Tugas dianggap terlambat jika dibuat lebih dari 24 jam yang lalu dan belum selesai
 *
 * @function isTaskOverdue
 * @param {Task} task - Objek tugas yang akan diperiksa
 * @returns {boolean} True jika tugas terlambat, false jika tidak
 */
function isTaskOverdue(task) {
    if (task.completed) return false;

    const taskDate = new Date(task.createdAt);
    const now = new Date();

    const hoursDiff = (now - taskDate) / (1000 * 60 * 60);
    return hoursDiff > 24;
}

/**
 * Membuat HTML untuk satu item tugas
 *
 * @function createTaskElement
 * @param {Task} task - Objek tugas yang akan dibuat HTML-nya
 * @returns {string} String HTML untuk item tugas
 */
function createTaskElement(task) {
    const isOverdue = isTaskOverdue(task);
    const overdueClass = isOverdue && !task.completed ? 'overdue' : '';

    return `
        <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''} ${overdueClass}" data-id="${task.id}">
            <div class="checkbox-container">
                <div class="checkbox ${task.completed ? 'checked' : ''}">
                    ${task.completed ? '✓' : ''}
                </div>
            </div>
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-date">${task.date}</span>
                    <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    ${isOverdue && !task.completed ? '<span class="task-priority high" style="margin-left: 5px;">Overdue</span>' : ''}
                </div>
            </div>
            <div class="delete-task-btn" title="Delete task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </div>
        </div>
    `;
}

/**
 * Representasi objek tugas
 *
 * @typedef {Object} Task
 * @property {number} id - ID unik tugas
 * @property {string} text - Deskripsi tugas
 * @property {string} priority - Prioritas tugas ("low", "medium", atau "high")
 * @property {boolean} completed - Status penyelesaian tugas
 * @property {string} createdAt - Timestamp ISO pembuatan tugas
 * @property {string} date - Tanggal dalam format yang ramah untuk dibaca
 * @property {string} [completedAt] - Timestamp ISO penyelesaian tugas (opsional)
 */