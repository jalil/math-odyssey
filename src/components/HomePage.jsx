"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import topics from '../data/topics.json';

import AdminDashboard from './AdminDashboard';

export default function HomePage() {
    const router = useRouter();
    const { user, progress } = useUser();
    const [showAdmin, setShowAdmin] = React.useState(false);

    // Calculate progress for each module
    const getModuleProgress = (topicId) => {
        if (!progress) return 0;
        const quizIds = Object.keys(progress).filter(id => id.startsWith(topicId));
        if (quizIds.length === 0) return 0;
        const passed = quizIds.filter(id => progress[id].passed).length;
        return Math.round((passed / quizIds.length) * 100);
    };

    // Estimate time for each module (based on number of sections)
    const getEstimatedTime = (topic) => {
        const sectionCount = topic.sections.length;
        return `${Math.max(10, sectionCount * 2)} min`;
    };

    // Get badge type based on topic
    const getBadge = (topicId) => {
        if (topicId === 'bar-model-level-1') return { text: 'Intro', color: '#10B981' };
        if (topicId.includes('p3') || topicId.includes('singapore-p3')) return { text: 'P3', color: '#F59E0B' };
        if (topicId.includes('p4') || topicId.includes('singapore-p4')) return { text: 'P4', color: '#06B6D4' };
        if (topicId.includes('p5')) return { text: 'P5', color: '#3B82F6' };
        if (topicId.includes('p6')) return { text: 'P6', color: '#8B5CF6' };
        if (topicId.includes('ultimate')) return { text: 'Challenge', color: '#EF4444' };
        return { text: 'P5', color: '#3B82F6' };
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
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
                </div>

                {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
            </header>

            {/* Module Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {topics.map((topic) => {
                    const progressPercent = getModuleProgress(topic.id);
                    const estimatedTime = getEstimatedTime(topic);
                    const badge = getBadge(topic.id);

                    return (
                        <div
                            key={topic.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onClick={() => {
                                if (!user) {
                                    router.push('/login');
                                } else {
                                    router.push(`/?topic=${topic.id}`);
                                }
                            }}
                        >


                            {/* Badge */}
                            <div style={{
                                display: 'inline-block',
                                background: badge.color,
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginBottom: '1rem',
                                textTransform: 'uppercase'
                            }}>
                                {badge.text}
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: '0.75rem',
                                lineHeight: '1.3'
                            }}>
                                {topic.title}
                            </h3>

                            {/* Time Estimate */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                marginBottom: '1rem'
                            }}>
                                <span>🕐</span>
                                <span>{estimatedTime}</span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    background: '#2A2A2A',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${progressPercent}%`,
                                        height: '100%',
                                        background: 'var(--primary)',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '0.25rem'
                                }}>
                                    {progressPercent}% Complete
                                </div>
                            </div>

                            {/* Start Lesson Button */}
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: !user ? '#3f3f46' : (progressPercent === 100 ? '#10B981' : 'var(--primary)'),
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                                onMouseEnter={(e) => {
                                    if (!user) return;
                                    if (progressPercent !== 100) e.target.style.background = 'var(--primary-hover)'
                                }}
                                onMouseLeave={(e) => {
                                    if (!user) return;
                                    if (progressPercent !== 100) e.target.style.background = 'var(--primary)'
                                }}
                            >
                                {!user ? (
                                    <>
                                        <span>🔒</span> Log in to Start
                                    </>
                                ) : progressPercent === 100 ? (
                                    <>
                                        <span>✅</span> Completed
                                    </>
                                ) : 'Start Lesson'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
