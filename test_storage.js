
// Mock LocalStorage
const localStorageStore = {};
const localStorage = {
    getItem: (key) => localStorageStore[key] || null,
    setItem: (key, val) => localStorageStore[key] = val,
    removeItem: (key) => delete localStorageStore[key]
};

// Mock React State
let state = {
    user: null,
    allUsers: [],
    progress: {}
};

const setUser = (u) => state.user = u;
const setAllUsers = (users) => state.allUsers = users;
const setProgress = (p) => state.progress = p;

// UserContext Logic (Simplified copy)
const loadUserSession = (name) => {
    const storedProgress = localStorage.getItem(`math_mastery_progress_${name}`);
    const rawRegistry = localStorage.getItem('math_mastery_users_registry');
    const registry = rawRegistry ? JSON.parse(rawRegistry) : [];

    const userData = registry.find(u => u.name === name);

    if (userData) {
        setUser(userData);
        setProgress(storedProgress ? JSON.parse(storedProgress) : {});
        localStorage.setItem('math_mastery_last_user', name);
        console.log(`[LOAD] session loaded for ${name}. Progress keys: ${Object.keys(state.progress).length}`);
    } else {
        console.log(`[LOAD] user ${name} not found in registry.`);
    }
};

const register = (name) => {
    if (state.allUsers.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        return false;
    }
    const newUser = { name, joinedAt: new Date().toISOString() };
    const newRegistry = [...state.allUsers, newUser];

    setAllUsers(newRegistry);
    localStorage.setItem('math_mastery_users_registry', JSON.stringify(newRegistry));
    console.log(`[REGISTER] ${name} registered.`);
    return true;
};

const login = (name) => {
    let targetUser = state.allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (!targetUser) {
        register(name);
        targetUser = { name };
    }

    loadUserSession(targetUser.name);
};

const saveProgress = (quizId, score) => {
    if (!state.user) return;
    const newProgress = {
        ...state.progress,
        [quizId]: { score, passed: true }
    };
    setProgress(newProgress);
    localStorage.setItem(`math_mastery_progress_${state.user.name}`, JSON.stringify(newProgress));
    console.log(`[SAVE] Progress saved for ${state.user.name}. Key: ${quizId}`);
};

const logout = () => {
    setUser(null);
    setProgress({});
    localStorage.removeItem('math_mastery_last_user');
    console.log("[LOGOUT]");
};

// --- TEST SCENARIO ---

console.log("=== START TEST ===");

// 1. Init Registry
localStorage.setItem('math_mastery_users_registry', JSON.stringify([]));

// 2. Login as 'Jalil'
console.log("\n--- Login 'Jalil' ---");
login('Jalil');
// Expect: Register 'Jalil', Load Session (empty)

// 3. Save Progress
console.log("\n--- Save Progress ---");
saveProgress('quiz-1', 1);

// 4. Logout
console.log("\n--- Logout ---");
logout();

// 5. Login as 'jalil' (lowercase)
console.log("\n--- Login 'jalil' ---");
login('jalil');
// Expect: Find 'Jalil', Load Session 'Jalil' (progress should be found)

if (state.progress['quiz-1']) {
    console.log("\nPASS: Progress persisted across case-insensitive login.");
} else {
    console.log("\nFAIL: Progress LOST.");
    console.log("Current Progress:", state.progress);
}
