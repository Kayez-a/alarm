// --- 1. CLOCK & GREETING ---
function updateClockAndGreeting() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    document.getElementById('datetime').innerText = 
        `${now.toLocaleTimeString(undefined, timeOptions)} • ${now.toLocaleDateString(undefined, dateOptions)}`;

    const hour = now.getHours();
    let greetingText = "Good Evening!";
    if (hour < 12) greetingText = "Good Morning!";
    else if (hour < 18) greetingText = "Good Afternoon!";
    
    document.getElementById('greeting').innerText = greetingText;
}
setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

// --- 2. LIGHT / DARK MODE ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- 3. FOCUS TIMER ---
let timerInterval;
let timerMinutes = localStorage.getItem('pomodoroMinutes') || 25;
let timeLeft = timerMinutes * 60;
let isRunning = false;

const timeDisplay = document.getElementById('time-display');
const customTimeInput = document.getElementById('custom-time');

customTimeInput.value = timerMinutes;

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timeDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.getElementById('start-btn').addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            alert("Focus session complete!");
        }
    }, 1000);
});

document.getElementById('stop-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
});

document.getElementById('reset-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = timerMinutes * 60;
    updateDisplay();
});

document.getElementById('set-time-btn').addEventListener('click', () => {
    let newMins = parseInt(customTimeInput.value);
    if (newMins > 0) {
        timerMinutes = newMins;
        localStorage.setItem('pomodoroMinutes', timerMinutes);
        timeLeft = timerMinutes * 60;
        updateDisplay();
        clearInterval(timerInterval);
        isRunning = false;
    }
});
updateDisplay();

// --- 4. TO-DO LIST (With Duplicate Prevention) ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const duplicateWarning = document.getElementById('duplicate-warning');

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <span class="task-text" style="cursor:pointer;">${task.text}</span>
            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">X</button>
            </div>
        `;

        // Toggle completed
        li.querySelector('.task-text').addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        });

        // Edit
        li.querySelector('.edit-btn').addEventListener('click', () => {
            const newText = prompt("Edit task:", task.text);
            if (newText && newText.trim() !== '') {
                // Check duplicate on edit too
                const isDuplicate = tasks.some((t, i) => t.text.toLowerCase() === newText.trim().toLowerCase() && i !== index);
                if(isDuplicate) {
                    alert("This task name already exists!");
                } else {
                    tasks[index].text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
            }
        });

        // Delete
        li.querySelector('.delete-btn').addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        taskList.appendChild(li);
    });
}

document.getElementById('add-task-btn').addEventListener('click', () => {
    const text = taskInput.value.trim();
    duplicateWarning.classList.add('hidden');

    if (!text) return;

    // Check for duplicate tasks (case-insensitive)
    const isDuplicate = tasks.some(task => task.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        duplicateWarning.classList.remove('hidden');
        return;
    }

    tasks.push({ text: text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
});

// Allow hitting Enter to add task
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('add-task-btn').click();
});

renderTasks();

// --- 5. QUICK LINKS ---
let links = JSON.parse(localStorage.getItem('links')) || [];
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linksContainer = document.getElementById('links-container');

function saveLinks() {
    localStorage.setItem('links', JSON.stringify(links));
}

function renderLinks() {
    linksContainer.innerHTML = '';
    links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
            <button class="link-delete" title="Delete Link">✖</button>
        `;

        div.querySelector('.link-delete').addEventListener('click', () => {
            links.splice(index, 1);
            saveLinks();
            renderLinks();
        });

        linksContainer.appendChild(div);
    });
}

document.getElementById('add-link-btn').addEventListener('click', () => {
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();

    if (!name || !url) {
        alert("Please provide both a name and a URL.");
        return;
    }

    // Auto-prepend https:// if the user forgets it
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    links.push({ name, url });
    saveLinks();
    renderLinks();
    
    linkNameInput.value = '';
    linkUrlInput.value = '';
});

renderLinks();