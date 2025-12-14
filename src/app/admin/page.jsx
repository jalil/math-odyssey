"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

export default function AdminPage() {
    const { allUsers, deleteUser, register } = useUser();
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    // Quick helper to peek at user stats
    const getUserStats = (name) => {
        if (typeof window === 'undefined') return { passed: 0 };
        try {
            const data = localStorage.getItem(`math_mastery_progress_${name}`);
            if (!data) return { passed: 0 };
            const json = JSON.parse(data);
            const passed = Object.values(json).filter(i => i.passed).length;
            return { passed };
        } catch (e) {
            return { passed: 0 };
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const success = register(newName.trim());
        if (success) {
            setNewName('');
            setError('');
        } else {
            setError('User already exists');
        }
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                Admin Dashboard
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Create User Panel */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0 }}>Add New User</h3>
                    <form onSubmit={handleAdd}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Student Name"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white'
                                }}
                            />
                        </div>
                        {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'var(--success)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Create User
                        </button>
                    </form>
                </div>

                {/* User List Panel */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Registered Students ({allUsers.length})</h3>

                    {allUsers.length === 0 ? (
                        <p style={{ opacity: 0.6 }}>No users found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {allUsers.map((u) => {
                                const stats = getUserStats(u.name);
                                return (
                                    <div key={u.name} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                Joined: {new Date(u.joinedAt).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                                                Progress: {stats.passed} modules passed
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${u.name}? This cannot be undone.`)) {
                                                    deleteUser(u.name);
                                                }
                                            }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                color: '#f87171',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
