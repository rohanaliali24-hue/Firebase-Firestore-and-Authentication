
import { db, auth } from "../firebase.config.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// HTML ELEMENTS
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoBtn = document.getElementById("todo-btn");
const todosList = document.getElementById("todos");
const greetingText = document.getElementById("greeting-text");
const todoMessage = document.getElementById("todo-message");
const logoutBtn = document.getElementById("logout");

// VARIABLES
let currentUser = null;
let isAddingTodo = false;

// SHOW MESSAGE
const showMessage = (message, isError = false) => {
    todoMessage.textContent = message;
    todoMessage.className = isError
        ? "text-danger small mt-3"
        : "text-success small mt-3";
};

// LOAD PROFILE
const loadProfile = async (user) => {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        const userData = userSnap.exists()
            ? userSnap.data()
            : {};

        const name =
            userData.fullName ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "User";

        greetingText.textContent = `Welcome back, ${name}!`;

    } catch (error) {
        console.error("Profile Error:", error);
        greetingText.textContent = "Welcome back!";
    }
};

// GET TODOS
const getTodos = async () => {
    if (!currentUser) return;

    todosList.replaceChildren();

    try {
        const todosQuery = query(
            collection(db, "todos"),
            where("user_uid", "==", currentUser.uid)
        );

        const snapshot = await getDocs(todosQuery);

        if (snapshot.empty) {
            const emptyItem = document.createElement("li");
            emptyItem.className = "text-secondary";
            emptyItem.textContent =
                "No tasks yet. Add your first task!";

            todosList.appendChild(emptyItem);
            return;
        }

        snapshot.forEach((todoDocument) => {
            const todo = todoDocument.data();
            const todoId = todoDocument.id;

            const item = document.createElement("li");

            const taskName = document.createElement("span");
            taskName.className = "task-name";
            taskName.textContent = todo.name || "Untitled task";

            const actions = document.createElement("div");
            actions.className = "task-actions";

            // EDIT
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className =
                "btn btn-sm btn-outline-info";
            editButton.textContent = "Edit";

            editButton.addEventListener("click", async () => {
                const updatedName = prompt(
                    "Edit your task:",
                    todo.name || ""
                );

                if (updatedName === null) return;

                const newName = updatedName.trim();

                if (!newName) {
                    alert("Task cannot be empty!");
                    return;
                }

                editButton.disabled = true;

                try {
                    await updateDoc(
                        doc(db, "todos", todoId),
                        {
                            name: newName,
                            updated_at: Date.now()
                        }
                    );

                    await getTodos();
                    showMessage("Todo updated successfully!");

                } catch (error) {
                    console.error("Edit Error:", error);
                    showMessage(error.message, true);
                    editButton.disabled = false;
                }
            });

            // DELETE
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className =
                "btn btn-sm btn-outline-danger";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async () => {
                const confirmDelete = confirm(
                    "Are you sure you want to delete this task?"
                );

                if (!confirmDelete) return;

                deleteButton.disabled = true;

                try {
                    await deleteDoc(doc(db, "todos", todoId));

                    await getTodos();
                    showMessage("Todo deleted successfully!");

                } catch (error) {
                    console.error("Delete Error:", error);
                    showMessage(error.message, true);
                    deleteButton.disabled = false;
                }
            });

            actions.append(editButton, deleteButton);
            item.append(taskName, actions);
            todosList.appendChild(item);
        });

    } catch (error) {
        console.error("Get Todos Error:", error);
        showMessage(error.message, true);
    }
};

// ADD TODO
const addTodo = async () => {
    if (isAddingTodo) return;

    const name = todoInput.value.trim();

    if (!name) {
        showMessage("Please enter a task!", true);
        todoInput.focus();
        return;
    }

    if (!currentUser) {
        showMessage("Please login first!", true);
        return;
    }

    isAddingTodo = true;
    todoBtn.disabled = true;
    todoBtn.textContent = "Adding...";

    try {
        await addDoc(collection(db, "todos"), {
            name: name,
            user_uid: currentUser.uid,
            created_at: Date.now()
        });

        todoInput.value = "";

        await getTodos();

        showMessage("Todo added successfully!");

    } catch (error) {
        console.error("Add Todo Error:", error);
        showMessage(error.message, true);

    } finally {
        isAddingTodo = false;
        todoBtn.disabled = false;
        todoBtn.textContent = "+ Add Task";
    }
};

// FORM SUBMIT
todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await addTodo();
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = "Logging out...";

    try {
        await signOut(auth);
        window.location.replace("../login/login.html");

    } catch (error) {
        console.error("Logout Error:", error);
        showMessage(error.message, true);

        logoutBtn.disabled = false;
        logoutBtn.textContent = "Logout";
    }
});

// AUTHENTICATION CHECK
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        currentUser = null;
        window.location.replace("../login/login.html");
        return;
    }

    currentUser = user;

    greetingText.textContent = "Loading profile...";

    await loadProfile(user);
    await getTodos();
});
