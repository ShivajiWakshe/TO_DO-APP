let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";

const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const taskList = document.getElementById("taskList");
const msg = document.getElementById("msg");
const sound = document.getElementById("alertSound");

// ===== Add Task =====
function addTask() {
  const taskName = taskInput.value.trim();
  const taskTime = timeInput.value;
  if (!taskName || !taskTime) { alert("Enter task & time"); return; }

  tasks.push({ text: taskName, time: taskTime, completed: false, reminded: false, removeAfter: null });
  taskInput.value = "";
  timeInput.value = "";
  saveTasks();
  showMsg("Task added successfully ✅");
  render();
}

// ===== Show Message =====
function showMsg(text) {
  msg.innerText = text;
  setTimeout(() => msg.innerText = "", 2000);
}

// ===== Set Filter =====
function setFilter(type) { filter = type; render(); }

// ===== Complete All Pending =====
function completeAllPending() {
  const now = new Date();
  tasks.forEach(task => {
    if (!task.completed) {
      task.completed = true;
      task.removeAfter = new Date(now.getTime() + 10000);
    }
  });
  saveTasks();
  render();
  showMsg("All pending tasks completed ✅");
}

// ===== Render Tasks =====
function render() {
  taskList.innerHTML = "";
  tasks.forEach((task, i) => {

    const now = new Date();

    // Remove completed tasks after 10 sec
    if (task.completed && task.removeAfter && now >= new Date(task.removeAfter)) {
      tasks.splice(i, 1);
      saveTasks();
      return;
    }

    // Apply filter
    if ((filter === "pending" && task.completed) || (filter === "completed" && !task.completed)) return;

    // Create List Item
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.index = i;

    if (task.completed) li.classList.add("completed");

    const countdown = document.createElement("div");
    countdown.className = "remaining";

    // Function to update countdown every second
    function updateCountdown() {
      const now = new Date();
      const taskTime = new Date(task.time);
      const diff = taskTime - now;

      if (!task.completed && diff <= 10000 && diff > 0 && !task.reminded) {
        sound.play();
        task.reminded = true;
        saveTasks();
        alert(`⏰ Reminder: ${task.text}`);
      }

      if (diff > 0) {
        const sec = Math.floor((diff / 1000) % 60);
        const min = Math.floor((diff / 1000 / 60) % 60);
        const hr = Math.floor(diff / 1000 / 3600);
        countdown.innerText = `⏳ ${hr}h ${min}m ${sec}s remaining`;
        if (diff <= 10000) li.classList.add("near-deadline");
      } else {
        countdown.innerText = "⏰ Time over";
        li.classList.remove("near-deadline");
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    li.innerHTML = `<strong>${task.text}</strong>`;
    li.appendChild(countdown);

    if (!task.completed) {
      const btn = document.createElement("button");
      btn.className = "task-btn";
      btn.innerText = "✔ Complete";
      btn.onclick = () => completeTask(i);
      li.appendChild(btn);
    }

    // Drag & Drop
    li.addEventListener('dragstart', e => e.dataTransfer.setData("text/plain", i));
    li.addEventListener('dragover', e => e.preventDefault());
    li.addEventListener('drop', e => {
      const fromIndex = e.dataTransfer.getData("text/plain");
      const toIndex = i;
      const movedTask = tasks.splice(fromIndex,1)[0];
      tasks.splice(toIndex,0,movedTask);
      saveTasks();
      render();
    });

    taskList.appendChild(li);
  });
}

// ===== Complete Single Task =====
function completeTask(index) {
  tasks[index].completed = true;
  tasks[index].removeAfter = new Date(new Date().getTime() + 10000);
  saveTasks();
  render();
}

// ===== Save to localStorage =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== Initial Render =====
render();
