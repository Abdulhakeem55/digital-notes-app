
/* ==========================================
   NOTESPACE DIGITAL NOTES APPLICATION

   SWD 417 ASSIGNMENT

   Student:
   Momoh Onoruoiza Abdulhakeem

   Matric Number:
   2025/HND/SWD/091

   Technologies:
   HTML, CSS and JavaScript
========================================== */


// ==========================================
// 1. SELECT HTML ELEMENTS
// ==========================================

const addNoteBtn = document.getElementById("addNoteBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const noteModal = document.getElementById("noteModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const noteForm = document.getElementById("noteForm");

const noteIdInput = document.getElementById("noteId");
const noteTitleInput = document.getElementById("noteTitle");
const noteCategoryInput = document.getElementById("noteCategory");
const noteContentInput = document.getElementById("noteContent");

const modalTitle = document.getElementById("modalTitle");

const notesContainer = document.getElementById("notesContainer");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const totalNotesElement = document.getElementById("totalNotes");
const pinnedNotesElement = document.getElementById("pinnedNotes");
const totalCategoriesElement = document.getElementById("totalCategories");

const notesHeading = document.getElementById("notesHeading");

const themeToggle = document.getElementById("themeToggle");

const menuItems = document.querySelectorAll(".menu-item");


// ==========================================
// 2. APPLICATION VARIABLES
// ==========================================

const STORAGE_KEY = "notespace_notes";
const THEME_KEY = "notespace_theme";

const categories = ["Personal", "Work", "School", "Ideas"];

let notes = loadNotes();

let currentFilter = "all";

let searchTerm = "";

let lastFocusedElement = null;


// ==========================================
// 3. LOAD NOTES FROM LOCAL STORAGE
// ==========================================

function loadNotes() {

    try {

        const savedNotes = localStorage.getItem(STORAGE_KEY);

        if (!savedNotes) {
            return [];
        }

        const parsedNotes = JSON.parse(savedNotes);

        if (!Array.isArray(parsedNotes)) {
            return [];
        }

        return parsedNotes.filter(note =>
            note &&
            typeof note.id === "string" &&
            typeof note.title === "string" &&
            typeof note.content === "string" &&
            categories.includes(note.category)
        );

    } catch (error) {

        console.error("Unable to load notes:", error);

        return [];

    }

}


// ==========================================
// 4. SAVE NOTES TO LOCAL STORAGE
// ==========================================

function saveNotes() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(notes)
        );

        return true;

    } catch (error) {

        console.error("Unable to save notes:", error);

        alert(
            "Your notes could not be saved. " +
            "Please check your browser storage settings."
        );

        return false;

    }

}


// ==========================================
// 5. GENERATE UNIQUE NOTE ID
// ==========================================

function generateNoteId() {

    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString() +
        Math.random().toString(36).slice(2);

}


// ==========================================
// 6. FORMAT DATE
// ==========================================

function formatDate(dateString) {

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


// ==========================================
// 7. OPEN MODAL
// ==========================================

function openModal(note = null) {

    lastFocusedElement = document.activeElement;

    noteForm.reset();

    if (note) {

        modalTitle.textContent = "Edit Note";

        noteIdInput.value = note.id;

        noteTitleInput.value = note.title;

        noteCategoryInput.value = note.category;

        noteContentInput.value = note.content;

    } else {

        modalTitle.textContent = "Create New Note";

        noteIdInput.value = "";

    }

    noteModal.hidden = false;

    document.body.style.overflow = "hidden";

    noteTitleInput.focus();

}


// ==========================================
// 8. CLOSE MODAL
// ==========================================

function closeModal() {

    noteModal.hidden = true;

    document.body.style.overflow = "";

    noteForm.reset();

    if (lastFocusedElement &&
        typeof lastFocusedElement.focus === "function") {

        lastFocusedElement.focus();

    }

}


// ==========================================
// 9. CREATE OR UPDATE NOTE
// ==========================================

function handleNoteSubmit(event) {

    event.preventDefault();

    const title = noteTitleInput.value.trim();

    const category = noteCategoryInput.value;

    const content = noteContentInput.value.trim();

    const existingId = noteIdInput.value;

    if (!title || !content) {

        alert("Please enter a title and note content.");

        return;

    }

    if (!categories.includes(category)) {

        alert("Please select a valid category.");

        return;

    }

    const now = new Date().toISOString();

    const previousNotes = [...notes];

    if (existingId) {

        // UPDATE EXISTING NOTE

        const noteIndex = notes.findIndex(
            note => note.id === existingId
        );

        if (noteIndex === -1) {

            alert("This note could not be found.");

            return;

        }

        notes[noteIndex] = {
            ...notes[noteIndex],
            title: title,
            category: category,
            content: content,
            updatedAt: now
        };

    } else {

        // CREATE NEW NOTE

        const newNote = {

            id: generateNoteId(),

            title: title,

            category: category,

            content: content,

            pinned: false,

            createdAt: now,

            updatedAt: now

        };

        notes.unshift(newNote);

    }

    if (!saveNotes()) {

        notes = previousNotes;

        return;

    }

    closeModal();

    renderNotes();

    updateStatistics();

}


// ==========================================
// 10. EDIT NOTE
// ==========================================

function editNote(id) {

    const note = notes.find(
        note => note.id === id
    );

    if (!note) {
        return;
    }

    openModal(note);

}


// ==========================================
// 11. DELETE NOTE
// ==========================================

function deleteNote(id) {

    const note = notes.find(
        note => note.id === id
    );

    if (!note) {
        return;
    }

    const confirmation = confirm(
        `Are you sure you want to delete "${note.title}"?`
    );

    if (!confirmation) {
        return;
    }

    const previousNotes = [...notes];

    notes = notes.filter(
        note => note.id !== id
    );

    if (!saveNotes()) {

        notes = previousNotes;

        return;

    }

    renderNotes();

    updateStatistics();

}


// ==========================================
// 12. PIN OR UNPIN NOTE
// ==========================================

function togglePin(id) {

    const note = notes.find(
        note => note.id === id
    );

    if (!note) {
        return;
    }

    note.pinned = !note.pinned;

    note.updatedAt = new Date().toISOString();

    if (!saveNotes()) {

        note.pinned = !note.pinned;

        return;

    }

    renderNotes();

    updateStatistics();

}


// ==========================================
// 13. CREATE NOTE CARD
// ==========================================

function createNoteCard(note) {

    const card = document.createElement("article");

    card.className = "note-card";

    if (note.pinned) {
        card.classList.add("pinned");
    }

    // TOP SECTION

    const top = document.createElement("div");

    top.className = "note-top";

    const categoryBadge = document.createElement("span");

    categoryBadge.className = "note-category";

    categoryBadge.textContent = note.category;

    const pinButton = document.createElement("button");

    pinButton.className = "pin-btn";

    pinButton.type = "button";

    pinButton.textContent = note.pinned ? "📌" : "📍";

    pinButton.setAttribute(
        "aria-label",
        note.pinned ? "Unpin note" : "Pin note"
    );

    pinButton.title = note.pinned ? "Unpin Note" : "Pin Note";

    pinButton.addEventListener("click", () => {
        togglePin(note.id);
    });

    top.appendChild(categoryBadge);

    top.appendChild(pinButton);


    // NOTE TITLE

    const title = document.createElement("h3");

    title.textContent = note.title;


    // NOTE CONTENT

    const content = document.createElement("p");

    content.className = "note-content";

    content.textContent = note.content;


    // NOTE FOOTER

    const footer = document.createElement("div");

    footer.className = "note-footer";

    const date = document.createElement("span");

    date.className = "note-date";

    date.textContent = formatDate(
        note.updatedAt || note.createdAt
    );


    // ACTION BUTTONS

    const actions = document.createElement("div");

    actions.className = "note-actions";


    // EDIT BUTTON

    const editButton = document.createElement("button");

    editButton.className = "edit-btn";

    editButton.type = "button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
        editNote(note.id);
    });


    // DELETE BUTTON

    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-btn";

    deleteButton.type = "button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
        deleteNote(note.id);
    });


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);

    footer.appendChild(date);

    footer.appendChild(actions);


    // BUILD COMPLETE CARD

    card.appendChild(top);

    card.appendChild(title);

    card.appendChild(content);

    card.appendChild(footer);

    return card;

}


// ==========================================
// 14. FILTER AND DISPLAY NOTES
// ==========================================

function renderNotes() {

    notesContainer.replaceChildren();

    let filteredNotes = [...notes];


    // FILTER BY SIDEBAR SELECTION

    if (currentFilter === "pinned") {

        filteredNotes = filteredNotes.filter(
            note => note.pinned
        );

    } else if (currentFilter !== "all") {

        filteredNotes = filteredNotes.filter(
            note => note.category === currentFilter
        );

    }


    // SEARCH NOTES

    if (searchTerm) {

        filteredNotes = filteredNotes.filter(note => {

            const searchableText = (
                note.title + " " +
                note.content + " " +
                note.category
            ).toLowerCase();

            return searchableText.includes(searchTerm);

        });

    }


    // SORT PINNED NOTES FIRST

    filteredNotes.sort((a, b) => {

        if (Boolean(a.pinned) !== Boolean(b.pinned)) {

            return Number(Boolean(b.pinned)) -
                   Number(Boolean(a.pinned));

        }

        return new Date(b.updatedAt || b.createdAt) -
               new Date(a.updatedAt || a.createdAt);

    });


    // SHOW EMPTY STATE

    if (filteredNotes.length === 0) {

        emptyState.style.display = "block";

        if (notes.length > 0) {

            emptyState.querySelector("h2").textContent =
                "No Matching Notes";

            emptyState.querySelector("p").textContent =
                "No notes match your current search or category.";

        } else {

            emptyState.querySelector("h2").textContent =
                "📝 No Notes Yet";

            emptyState.querySelector("p").textContent =
                "Start organizing your thoughts by creating your first note.";

        }

        return;

    }


    emptyState.style.display = "none";


    // DISPLAY EACH NOTE

    filteredNotes.forEach(note => {

        const noteCard = createNoteCard(note);

        notesContainer.appendChild(noteCard);

    });

}


// ==========================================
// 15. UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total = notes.length;

    const pinned = notes.filter(
        note => note.pinned
    ).length;

    const uniqueCategories = new Set(
        notes.map(note => note.category)
    );

    totalNotesElement.textContent = total;

    pinnedNotesElement.textContent = pinned;

    totalCategoriesElement.textContent =
        uniqueCategories.size;

}


// ==========================================
// 16. SIDEBAR CATEGORY FILTERS
// ==========================================

const filterTitles = {

    all: "All Notes",

    pinned: "Pinned Notes",

    Personal: "Personal Notes",

    Work: "Work Notes",

    School: "School Notes",

    Ideas: "Ideas"

};

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(menu => {
            menu.classList.remove("active");
        });

        item.classList.add("active");

        currentFilter = item.dataset.filter;

        notesHeading.textContent =
            filterTitles[currentFilter] || "All Notes";

        renderNotes();

    });

});


// ==========================================
// 17. SEARCH FUNCTIONALITY
// ==========================================

searchInput.addEventListener("input", function () {

    searchTerm = this.value.trim().toLowerCase();

    renderNotes();

});


// ==========================================
// 18. DARK MODE FUNCTIONALITY
// ==========================================

function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle(
        "dark-mode",
        isDark
    );

    themeToggle.textContent = isDark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

    themeToggle.setAttribute(
        "aria-pressed",
        String(isDark)
    );

}


// LOAD SAVED THEME

let savedTheme = "light";

try {

    savedTheme = localStorage.getItem(THEME_KEY) || "light";

} catch (error) {

    console.warn("Theme preference unavailable:", error);

}

applyTheme(savedTheme);


// SWITCH THEME

themeToggle.addEventListener("click", () => {

    const isDark = document.body.classList.contains(
        "dark-mode"
    );

    const newTheme = isDark ? "light" : "dark";

    applyTheme(newTheme);

    try {

        localStorage.setItem(THEME_KEY, newTheme);

    } catch (error) {

        console.warn("Theme could not be saved:", error);

    }

});


// ==========================================
// 19. MODAL BUTTON EVENTS
// ==========================================

// OPEN NEW NOTE MODAL

addNoteBtn.addEventListener("click", () => {
    openModal();
});

emptyAddBtn.addEventListener("click", () => {
    openModal();
});


// CLOSE MODAL BUTTON

closeModalBtn.addEventListener("click", closeModal);


// CANCEL BUTTON

cancelBtn.addEventListener("click", closeModal);


// CLOSE WHEN CLICKING OUTSIDE MODAL

noteModal.addEventListener("click", (event) => {

    if (event.target === noteModal) {
        closeModal();
    }

});


// CLOSE WITH ESCAPE KEY

document.addEventListener("keydown", (event) => {

    if (noteModal.hidden) {
        return;
    }

    if (event.key === "Escape") {

        closeModal();

    }

    // KEEP KEYBOARD FOCUS INSIDE MODAL

    if (event.key === "Tab") {

        const focusableElements = Array.from(
            noteModal.querySelectorAll(
                'button:not([disabled]), input:not([type="hidden"]), select, textarea'
            )
        );

        const first = focusableElements[0];

        const last = focusableElements[
            focusableElements.length - 1
        ];

        if (event.shiftKey &&
            document.activeElement === first) {

            event.preventDefault();

            last.focus();

        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {

            event.preventDefault();

            first.focus();

        }

    }

});


// ==========================================
// 20. FORM SUBMISSION
// ==========================================

noteForm.addEventListener(
    "submit",
    handleNoteSubmit
);


// ==========================================
// 21. INITIALIZE APPLICATION
// ==========================================

function initializeApp() {

    renderNotes();

    updateStatistics();

    console.log(
        "NoteSpace Digital Notes Application is ready!"
    );

}

initializeApp();
