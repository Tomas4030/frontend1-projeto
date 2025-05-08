const apiURL = "https://681900d25a4b07b9d1d1a5a2.mockapi.io/ToDo/";

export const getTodos = async () => {
    const response = await fetch(apiURL + "todos");
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return await response.json();
};

export const getTodo = async (id) => {
    const response = await fetch(apiURL + "todos/" + id);
    if (!response.ok) throw new Error("Failed to fetch task");
    return await response.json();
};

export const createTodo = async (todo) => {
    const response = await fetch(apiURL + "todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return await response.json();
};

export const updateTodo = async (id, todo) => {
    const response = await fetch(apiURL + "todos/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error("Failed to update task");
    return await response.json();
};

export const deleteTodo = async (id) => {
    const response = await fetch(apiURL + "todos/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) throw new Error("Failed to delete task");
    return await response.json();
};

export const completeTodo = async (id) => {
    const task = await getTodo(id); 
    const response = await fetch(apiURL + "todos/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...task, // Mantemos todas as propriedades existentes
            completed: true // Atualizamos apenas o status
        }),
    });
    if (!response.ok) throw new Error("Failed to complete task");
    return await response.json();
};