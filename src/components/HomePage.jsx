"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import topics from '../data/topics.json';
import AdventureMap from './AdventureMap';

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
        'singapore-p4': getModuleProgress('singapore-p3') < 100,
        'bar-model-level-1': getModuleProgress('singapore-p4') < 100,
        'singapore-p5': getModuleProgress('bar-model-level-1') < 100,
        'singapore-p6': getModuleProgress('singapore-p5') < 100,
        'hiroo': getModuleProgress('singapore-p6') < 100
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
