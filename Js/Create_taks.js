import { createTodo } from "../Api/Api.js";

document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createBtn");
  const taskList = document.getElementById("taskList");

  function abrirModalTask() {
    const modal = document.createElement('div');
    modal.classList.add('task-modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('task-modal-content');

    const titulo = document.createElement('h2');
    titulo.textContent = "Create New Task";
    modalContent.appendChild(titulo);

    const taskForm = document.createElement("form");
    taskForm.id = "taskForm";

    const titleLabel = document.createElement("label");
    titleLabel.setAttribute("for", "title");
    titleLabel.textContent = "Title:";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.id = "title";
    titleInput.name = "title";
    titleInput.required = true;

    const descriptionLabel = document.createElement("label");
    descriptionLabel.setAttribute("for", "description");
    descriptionLabel.textContent = "Description:";
    const descriptionInput = document.createElement("textarea");
    descriptionInput.id = "description";
    descriptionInput.name = "description";
    descriptionInput.required = true;

    const dueDateLabel = document.createElement("label");
    dueDateLabel.setAttribute("for", "dueDate");
    dueDateLabel.textContent = "Due Date:";
    const dueDateInput = document.createElement("input");
    dueDateInput.type = "date";
    dueDateInput.id = "dueDate";
    dueDateInput.name = "dueDate";
    dueDateInput.required = true;

    const priorityLabel = document.createElement("label");
    priorityLabel.setAttribute("for", "priority");
    priorityLabel.textContent = "Priority:";
    const priorityInput = document.createElement("select");
    priorityInput.id = "priority";
    priorityInput.name = "priority";
    priorityInput.required = true;

    const optionLow = document.createElement("option");
    optionLow.value = "low";
    optionLow.textContent = "Low";

    const optionMedium = document.createElement("option");
    optionMedium.value = "medium";
    optionMedium.textContent = "Medium";

    const optionHigh = document.createElement("option");
    optionHigh.value = "high";
    optionHigh.textContent = "High";

    priorityInput.appendChild(optionLow);
    priorityInput.appendChild(optionMedium);
    priorityInput.appendChild(optionHigh);

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Create Task";

    taskForm.appendChild(titleLabel);
    taskForm.appendChild(titleInput);
    taskForm.appendChild(descriptionLabel);
    taskForm.appendChild(descriptionInput);
    taskForm.appendChild(dueDateLabel);
    taskForm.appendChild(dueDateInput);
    taskForm.appendChild(priorityLabel);
    taskForm.appendChild(priorityInput);
    taskForm.appendChild(submitBtn);

    const closeModal = document.createElement("button");
    closeModal.textContent = "Close";
    closeModal.classList.add("task-modal-close");
    closeModal.addEventListener("click", () => fecharModalTask(modal));

    modalContent.appendChild(closeModal);
    modalContent.appendChild(taskForm);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    taskForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const newTask = {
        title: titleInput.value,
        description: descriptionInput.value,
        dueDate: dueDateInput.value,
        priority: priorityInput.value,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      try {
        const taskResponse = await createTodo(newTask);
        addTaskToDOM(taskResponse);
        taskForm.reset();
        modal.remove();
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        alert("Falha ao criar a tarefa. Tente novamente.");
      }
    });
  }

  const addTaskToDOM = (task) => {
    const li = document.createElement("li");
    li.textContent = `${task.title} - ${task.priority} - Due: ${task.dueDate}`;
    taskList.appendChild(li);
  };

  const fecharModalTask = (modal) => {
    modal.remove();
  };

  createBtn.addEventListener("click", abrirModalTask);
});
