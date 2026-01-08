"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null); // Current logged in user
    const [allUsers, setAllUsers] = useState([]); // Registry of all users
    const [progress, setProgress] = useState({}); // Current user's progress
    const [isLoading, setIsLoading] = useState(true);

    // Load Registry on Mount
    useEffect(() => {
        try {
            const storedUsers = localStorage.getItem('math_mastery_users_registry');
            if (storedUsers) {
                setAllUsers(JSON.parse(storedUsers));
            }

            // Attempt to restore session
            const lastUser = localStorage.getItem('math_mastery_last_user');
            if (lastUser) {
                // Verify user still exists
                const users = storedUsers ? JSON.parse(storedUsers) : [];
                if (users.find(u => u.name === lastUser)) {
                    loadUserSession(lastUser);
                }
            }
        } catch (e) {
            console.error("Failed to load registry:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadUserSession = (name) => {
        const storedProgress = localStorage.getItem(`math_mastery_progress_${name}`);
        // Safety check: fetch registry again or use state? best to read fresh to be safe, but handle null.
        const rawRegistry = localStorage.getItem('math_mastery_users_registry');
        const registry = rawRegistry ? JSON.parse(rawRegistry) : [];

        const userData = registry.find(u => u.name === name);

        if (userData) {
            setUser(userData);
            setProgress(storedProgress ? JSON.parse(storedProgress) : {});
            localStorage.setItem('math_mastery_last_user', name);
        } else {
            // Fallback if user missing from registry but referred (shouldn't happen often)
            console.warn("User referrenced but not in registry:", name);
        }
    };

    const register = (name) => {
        // Check if exists
        if (allUsers.find(u => u.name.toLowerCase() === name.toLowerCase())) {
            return false; // User exists
        }
        const newUser = { name, joinedAt: new Date().toISOString(), role: 'student' };
        const newRegistry = [...allUsers, newUser];

        setAllUsers(newRegistry);
        localStorage.setItem('math_mastery_users_registry', JSON.stringify(newRegistry));
        return true;
    };

    const deleteUser = (name) => {
        const newRegistry = allUsers.filter(u => u.name !== name);
        setAllUsers(newRegistry);
        localStorage.setItem('math_mastery_users_registry', JSON.stringify(newRegistry));
        localStorage.removeItem(`math_mastery_progress_${name}`);

        // If deleting current user, logout
        if (user && user.name === name) {
            logout();
        }
    };

    const login = (name) => {
        // If user doesn't exist in registry, auto-register (backward compatibility/easy mode) or fail?
        // Let's AUTO-REGISTER for smooth UX unless strictly "Admin Only" creation is enforced.
        // Given the prompt "admin dashboard so i can add users", maybe we can allow both.
        // Let's check registry first.
        let targetUser = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());

        if (!targetUser) {
            register(name);
            targetUser = { name, joinedAt: new Date().toISOString() }; // Optimistic
        }

        loadUserSession(targetUser.name);
    };

    const logout = () => {
        setUser(null);
        setProgress({});
        localStorage.removeItem('math_mastery_last_user');
    };

    const saveProgress = (quizId, score, maxScore) => {
        if (!user) return; // Don't save for guests (or handle differently)

        const newProgress = {
            ...progress,
            [quizId]: { score, maxScore, timestamp: new Date().toISOString(), passed: (score / maxScore) >= 0.8 }
        };

        setProgress(newProgress);
        localStorage.setItem(`math_mastery_progress_${user.name}`, JSON.stringify(newProgress));
    };

    const markTopicComplete = (topicId, sections) => {
        if (!user) return;

        const updates = {};
        const quizzes = [];

        // Recursively find all quizzes
        const findQuizzes = (items) => {
            items.forEach(item => {
                if (item.type === 'quiz') quizzes.push(item);
                if (item.sections) findQuizzes(item.sections);
            });
        };

        findQuizzes(sections);

        quizzes.forEach(q => {
            // Logic to construct key based on how page.jsx does it.
            // page.jsx uses: `${currentTopic.id}-${q.originalIndex}`
            // But originalIndex is added during page render. 
            // We need to replicate that or assume sections passed in have it?
            // UserContext doesn't know about page.jsx's processing.
            // Actually, topics.json structure is static. 
            // But page.jsx flattens/processes it to assign IDs.
            // The safest key generation is tricky without the processed structure.

            // Let's rely on the fact that we can just pass the PROCESSED sections from the caller.
        });

        // Actually, let's just use the `progress` keys approach? 
        // No, we want to mark *unattempted* ones too.

        // Simpler approach:
        // In HomePage, we have `topics` data. But we don't have the `processedSections` logic which assigns IDs.
        // `page.jsx` logic: `const quizKey = ${currentTopic.id}-${q.originalIndex};`
        // We know `originalIndex` comes from the index in `topic.sections`.

        // So we can iterate `topic.sections` and use the index.
        sections.forEach((s, idx) => {
            if (s.type === 'quiz') {
                const key = `${topicId}-${idx}`;
                updates[key] = { score: 1, maxScore: 1, timestamp: new Date().toISOString(), passed: true };
            }
        });

        const newProgress = {
            ...progress,
            ...updates
        };

        setProgress(newProgress);
        localStorage.setItem(`math_mastery_progress_${user.name}`, JSON.stringify(newProgress));
    };

    return (
        <UserContext.Provider value={{ user, allUsers, progress, login, logout, register, deleteUser, saveProgress, markTopicComplete, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
