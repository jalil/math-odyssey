"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import topics from '../data/topics.json';

export default function AdminDashboard({ onClose, isModal = true }) {
    const { allUsers, deleteUser } = useUser();
    const [userStats, setUserStats] = useState([]);

    useEffect(() => {
        // Calculate stats for all users
        const stats = allUsers.map(u => {
            let progress = {};
            try {
                const stored = localStorage.getItem(`math_mastery_progress_${u.name}`);
                if (stored) {
                    progress = JSON.parse(stored);
                }
            } catch (e) {
                console.error("Error reading progress for", u.name, e);
            }

            // Calculate progress per module
            const moduleStats = topics.map(topic => {
                const topicQuizzes = topic.sections.filter(s => s.type === 'quiz');
                const totalTopicQuizzes = topicQuizzes.length;

                // Find passed quizzes for this topic
                // Quizzes are stored with keys like "singapore-p3-1", "bar-models-0" etc.
                // We check if the key starts with the topic id.
                const passedCount = Object.keys(progress).filter(key =>
                    key.startsWith(topic.id + '-') && progress[key].passed
                ).length;

                return {
                    id: topic.id,
                    title: topic.title,
                    passed: passedCount,
                    total: totalTopicQuizzes,
                    percentage: totalTopicQuizzes > 0 ? Math.round((passedCount / totalTopicQuizzes) * 100) : 0
                };
            });

            const quizzesTaken = Object.keys(progress).length;
            const quizzesPassed = Object.values(progress).filter(p => p.passed).length;

            return {
                ...u,
                quizzesTaken,
                quizzesPassed,
                moduleStats,
                progress
            };
        });
        setUserStats(stats);
    }, [allUsers]);

    const handleDelete = (name) => {
        if (confirm(`Are you sure you want to delete user "${name}"? This cannot be undone.`)) {
            deleteUser(name);
        }
    };

    return (
        <div style={isModal ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        } : {
            width: '100%',
            height: '100%'
        }}>
            <div style={{
                background: '#18181b', // Zinc-900
                width: '100%',
                maxWidth: isModal ? '900px' : '100%',
                maxHeight: isModal ? '90vh' : 'none',
                borderRadius: '24px',
                border: '1px solid #27272a',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#09090b'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🛡️</span> Admin Dashboard
                    </h2>
                    {isModal && (
                        <button
                            onClick={onClose}
                            style={{
                                background: '#27272a',
                                border: 'none',
                                color: '#a1a1aa',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = '#3f3f46'; e.target.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#27272a'; e.target.style.color = '#a1a1aa'; }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #27272a' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ background: '#27272a', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem', color: '#a1a1aa' }}>User</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem', color: '#a1a1aa' }}>Joined</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem', color: '#a1a1aa' }}>Progress</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem', color: '#a1a1aa', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userStats.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    userStats.map((u, i) => (
                                        <tr key={u.name} style={{ borderBottom: i < userStats.length - 1 ? '1px solid #27272a' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{u.role || 'Student'}</div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                                {new Date(u.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    {u.moduleStats.map(module => (
                                                        <div key={module.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                                                <span style={{ color: '#d4d4d8' }}>{module.title}</span>
                                                                <span style={{ color: '#a1a1aa' }}>{module.passed}/{module.total} ({module.percentage}%)</span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '4px',
                                                                background: '#27272a',
                                                                borderRadius: '2px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${module.percentage}%`,
                                                                    height: '100%',
                                                                    background: module.percentage > 0 ? '#10B981' : 'transparent',
                                                                    borderRadius: '2px',
                                                                    transition: 'width 0.3s'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {u.name !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(u.name)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#EF4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.target.style.background = '#EF4444'; e.target.style.color = '#fff'; }}
                                                        onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = '#EF4444'; }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}
