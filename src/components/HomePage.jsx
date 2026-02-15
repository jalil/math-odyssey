"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import topics from '../data/topics.json';
import AdventureMap from './AdventureMap';

import AdminDashboard from './AdminDashboard';

export default function HomePage() {
    const router = useRouter();
    const { user, progress, markTopicComplete } = useUser();
    const [showAdmin, setShowAdmin] = React.useState(false);

    // Calculate progress for each module
    // Calculate progress for each module
    const getModuleProgress = (topicId) => {
        if (!progress) return 0;

        // Find the topic to get the actual total number of quizzes
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return 0;

        // Count total quizzes in this topic (recursive if needed, but for now flat list seems effective or we use flat map)
        // Our data structure seems to have quizzes at top level sections mostly, but let's be safe.
        // Actually for now let's stick to how page.jsx works - it processes the top level sections.

        let validQuizCount = 0;
        let passedCount = 0;

        topic.sections.forEach((section, index) => {
            if (section.type === 'quiz') {
                validQuizCount++;
                const key = `${topicId}-${index}`;
                if (progress[key] && progress[key].passed) {
                    passedCount++;
                }
            }
        });

        if (validQuizCount === 0) return 0;
        return Math.round((passedCount / validQuizCount) * 100);
    };

    // Estimate time for each module (based on number of sections)
    const getEstimatedTime = (topic) => {
        const sectionCount = topic.sections.length;
        return `${Math.max(10, sectionCount * 2)} min`;
    };

    // Get badge type based on topic
    // Get badge type based on topic
    const getBadge = (topicId) => {
        if (topicId.includes('bar-model')) {
            if (topicId.includes('level-1')) return { text: 'Intro', color: '#10B981' };
            if (topicId.includes('level-2')) return { text: 'Intermediate', color: '#F59E0B' };
            if (topicId.includes('level-3')) return { text: 'Advanced', color: '#EF4444' };
            return { text: 'Skill', color: '#10B981' };
        }
        if (topicId.includes('mita')) return { text: 'Entrance Exam', color: '#EC4899' };
        if (topicId.includes('hiroo')) return { text: 'Entrance Exam', color: '#8B5CF6' };

        if (topicId.includes('p3') || topicId.includes('singapore-p3')) return { text: 'P3', color: '#F59E0B' };
        if (topicId.includes('p4') || topicId.includes('singapore-p4')) return { text: 'P4', color: '#06B6D4' };
        if (topicId.includes('p5')) return { text: 'P5', color: '#3B82F6' };
        if (topicId.includes('p6')) return { text: 'P6', color: '#8B5CF6' };
        if (topicId.includes('ultimate')) return { text: 'Challenge', color: '#EF4444' };
        return { text: 'General', color: '#64748B' };
    };

    // Calculate locks based on progress
    const locks = {
        'singapore-p3': false, // Always unlocked
        'singapore-p4': false, // UNLOCKED
        'bar-model-level-1': false, // UNLOCKED
        'bar-model-level-2': false, // UNLOCKED
        'bar-model-level-3': false, // UNLOCKED
        'singapore-p5': false, // UNLOCKED
        'singapore-p6': false, // UNLOCKED
        'elite-prep': getModuleProgress('singapore-p6') < 100, // Locked until P6 is 100% complete
        'hiroo': false // UNLOCKED
    };

    // Module Order for Recommendations
    const MODULE_ORDER = [
        'singapore-p3',
        'singapore-p4',
        'bar-model-level-1',
        'bar-model-level-2',
        'bar-model-level-3',
        'singapore-p5',
        'singapore-p6',
        'advanced-word-problems',
        'elite-prep',
        'hiroo'
    ];

    const getNextRecommendedModule = () => {
        for (const moduleId of MODULE_ORDER) {
            if (getModuleProgress(moduleId) < 100) {
                return topics.find(t => t.id === moduleId);
            }
        }
        return null; // All done!
    };

    const nextModule = getNextRecommendedModule();

    return (
        <div className="home-container">
            {/* Header */}
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {user && (
                        <>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                background: 'var(--primary)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '50px',
                            }}>
                                <span style={{ fontSize: '1rem', color: 'white', fontWeight: 700 }}>View My Progress</span>
                                <span style={{
                                    background: '#FFB800',
                                    color: '#000',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700
                                }}>0 Coins</span>
                            </div>

                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to skip Primary 3? This will mark all P3 content as complete.')) {
                                        markTopicComplete('singapore-p3', topics.find(t => t.id === 'singapore-p3').sections);
                                    }
                                }}
                                style={{
                                    background: '#10B981',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '50px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                ✓ Complete P3 & Unlock P4
                            </button>
                        </>
                    )}

                    {user && user.name === 'admin' && (
                        <button
                            onClick={() => setShowAdmin(true)}
                            style={{
                                background: '#3f3f46',
                                color: '#fff',
                                border: '1px solid #52525b',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '50px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span>🛡️</span> Admin
                        </button>
                    )}

                    {/* Recovery Button for 'aio' or anyone stuck due to previous bug */}
                    {user && (user.name === 'aio' || user.name === 'admin') && (
                        <button
                            onClick={() => {
                                if (confirm('Restore progress for Bar Model Foundation & Intermediate?')) {
                                    markTopicComplete('bar-model-level-1', topics.find(t => t.id === 'bar-model-level-1').sections);
                                    markTopicComplete('bar-model-level-2', topics.find(t => t.id === 'bar-model-level-2').sections);
                                    alert('Progress Restored! Level 3 should now be unlocked.');
                                    window.location.reload(); // Force refresh to update locks
                                }
                            }}
                            style={{
                                background: '#8B5CF6',
                                color: '#fff',
                                border: 'none',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '50px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            🔄 Restore Bar Models
                        </button>
                    )}
                </div>

                {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
            </header>

            {/* Recommended Next Step Banner */}
            {nextModule && (
                <div style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}>
                    <div>
                        <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', fontWeight: 600, opacity: 0.9, marginBottom: '0.5rem' }}>
                            Current Objective
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                            {nextModule.title}
                        </h2>
                        <div style={{ marginTop: '0.5rem', opacity: 0.9 }}>
                            {getModuleProgress(nextModule.id)}% Complete
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/?topic=${nextModule.id}`)}
                        style={{
                            background: 'white',
                            color: '#6366F1',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Continue Adventure →
                    </button>
                </div>
            )}

            {/* Module Grid */}
            {/* Adventure Map */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Your Journey Map</h2>
            <AdventureMap locks={locks} />

            {/* Legend / Tip */}
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Click on an island to start your adventure!
            </div>

            {/* Legacy List Link (Optional if they want to switch back, for now just hidden/removed as requested) */}
        </div>
    );
}
