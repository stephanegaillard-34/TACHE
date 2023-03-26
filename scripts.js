const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const exportCSVBtn = document.getElementById("export-csv");
const importCSVBtn = document.getElementById("import-csv");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = input.value.trim();
  if (task) {
    addTask(task);
  }
  input.value = "";
});

function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationInMinutes = (end - start) / 60000;
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = Math.floor(durationInMinutes % 60);
  return `${hours}h ${minutes}m`;
}

function addTask(task) {
  if (task.length > 20) {
    task = task.substring(0, 20);
  }
  const startTime = new Date().toISOString();
  addImportedTask(task, startTime);
}

function addImportedTask(task, startTimeText, endTimeText) {
  const startTime = new Date(startTimeText);
  const endTime = endTimeText ? new Date(endTimeText) : null;

  const tr = document.createElement("tr");

  const taskTd = document.createElement("td");
  taskTd.textContent = task;
  tr.appendChild(taskTd);

  const startTimeDisplay = startTime.toLocaleString('fr-FR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });


  const startTimeTd = document.createElement("td");
  startTimeTd.setAttribute('data-iso', startTimeText);
  startTimeTd.textContent = startTimeDisplay;
  tr.appendChild(startTimeTd);

  const endTimeTd = document.createElement("td");
  if (endTime) {
    endTimeTd.setAttribute('data-iso', endTimeText);
  }
  tr.appendChild(endTimeTd);

  const durationTd = document.createElement("td");
  durationTd.classList.add("duration");
  tr.appendChild(durationTd);

  if (endTime) {
    const endTimeDisplay = endTime.toLocaleString('fr-FR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    endTimeTd.textContent = endTimeDisplay;
    endTimeTd.setAttribute('data-iso', endTimeText);
    durationTd.textContent = calculateDuration(startTime, endTime);

  }

  const actionsTd = document.createElement("td");
  tr.appendChild(actionsTd);

  if (!endTime) {
    const endTaskBtn = document.createElement("button");
    endTaskBtn.textContent = "Fin de tâche";
    endTaskBtn.addEventListener("click", () => {
      const endTime = new Date().toISOString();
      const endTimeDisplay = new Date(endTime).toLocaleString('fr-FR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      endTimeTd.textContent = endTimeDisplay;
      endTimeTd.setAttribute('data-iso', endTime);
      actionsTd.removeChild(endTaskBtn);
      durationTd.textContent = calculateDuration(startTime, endTime);
    });
    actionsTd.appendChild(endTaskBtn);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Supprimer";
  deleteBtn.addEventListener("click", () => {
    list.removeChild(tr);
  });
  actionsTd.appendChild(deleteBtn);

  list.appendChild(tr);
}

exportCSVBtn.addEventListener("click", () => {
  const rows = Array.from(list.children);
  const csvContent = rows
    .map((row) => {
      const task = row.children[0].textContent;
      const startTime = row.children[1].getAttribute('data-iso');
      const endTime = row.children[2].getAttribute('data-iso') || "";
      return `"${task}","${startTime}","${endTime}"`;
    })
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "tasks.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

importCSVBtn.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n");
      for (const line of lines) {
        const [task, startTime, endTime] = line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
        if (task && startTime) {
          addImportedTask(task, startTime, endTime);
        }
      }
    };
    reader.readAsText(file);
  }
});


