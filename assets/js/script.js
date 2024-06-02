// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $(`
    <div class="card task-card mb-2" data-id="${task.id}">
        <div class="card-body">
            <h5 class="card-title">${task.title}</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
            <button class="btn btn-danger btn-sm delete-task">Delete</button>
        </div>
    </div>
`);
return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        if (task.status === 'to-do') {
            $('#todo-cards').append(taskCard);
        } else if (task.status === 'in-progress') {
            $('#in-progress-cards').append(taskCard);
        } else if (task.status === 'done') {
            $('#done-cards').append(taskCard);
        }

        // Color code tasks based on due date
        const now = dayjs();
        const dueDate = dayjs(task.dueDate);
        if (dueDate.isBefore(now, 'day')) {
            taskCard.addClass('bg-danger text-white'); // Overdue
        } else if (dueDate.isSame(now, 'day') || dueDate.isBefore(now.add(2, 'day'), 'day')) {
            taskCard.addClass('bg-warning'); // Nearing deadline
        }
    });

    $('.task-card').draggable({
        revert: "invalid",
        helper: "clone",
        zIndex: 1000,
        start: function () {
            $(this).css('visibility', 'hidden');
        },
        stop: function () {
            $(this).css('visibility', 'visible');
        }
    });
    
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $('#task-title').val().trim();
    const description = $('#task-description').val().trim();
    const dueDate = $('#task-due-date').val().trim();

    if (title && description && dueDate) {
        const newTask = {
            id: generateTaskId(),
            title,
            description,
            dueDate,
            status: 'to-do'
        };
        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("nextId", JSON.stringify(nextId));
        renderTaskList();
        $('#formModal').modal('hide');
    }
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');
    const newStatus = $(this).attr('id');

    taskList.forEach(task => {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    });

    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('.lane').droppable({
        accept: ".task-card",
        drop: handleDrop
    });

    $('#task-due-date').datepicker({
        dateFormat: 'yy-mm-dd'
    });

    $('#add-task-form').on('submit', handleAddTask);
    $(document).on('click', '.delete-task', handleDeleteTask);
});
