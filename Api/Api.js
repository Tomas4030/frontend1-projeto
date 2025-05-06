const apiURL = "https://681900d25a4b07b9d1d1a5a2.mockapi.io/ToDo/";

const mapApiPriority = (apiPriority) => {
    switch(apiPriority) {
        case 'high': return 'high_priority';
        case 'medium': return 'medium_priority';
        case 'low': return 'low_priority';
        case 'urgent': return 'urgent';
        default: return 'low_priority';
    }
};

export const getTodos = async () => {
    const response = await fetch(apiURL + "todos");
    const data = await response.json();
    
    return data.map(todo => ({
        ...todo,
        priority: mapApiPriority(todo.priority),
    }));
};

export const getTodo = async (id) => {
    const response = await fetch(apiURL + "todos/" + id);
    const data = await response.json();
    return data;
};

export const createTodo = async (todo) => {
    const response = await fetch(apiURL + "todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });
    const data = await response.json();
    return data;
};

export const updateTodo = async (id, todo) => {
    const response = await fetch(apiURL + "todos/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });
    const data = await response.json();
    return data;
};

export const deleteTodo = async (id) => {
    const response = await fetch(apiURL + "todos/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};