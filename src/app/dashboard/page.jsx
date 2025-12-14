"use client";
import React from 'react';
import { useUser } from '../../context/UserContext';
import Link from 'next/link';
import AdminDashboard from '../../components/AdminDashboard'; // Import the component

export default function DashboardPage() {
    const { user, progress } = useUser();

    if (!user) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Please log in to view your dashboard.</h2>
                <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Go to Login</Link>
            </div>
        );
    }

    // If user is admin, show the Admin Dashboard view instead
    if (user.name === 'admin') {
        return (
            <div style={{ padding: '2rem 2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '80vh' }}>
                <AdminDashboard isModal={false} onClose={() => { }} />
            </div>
        );
    }

    // Calculate stats
    const quizIds = Object.keys(progress);
    const totalQuizzesTaken = quizIds.length;
    const passedQuizzes = quizIds.filter(id => progress[id].passed).length;
    const recentActivity = quizIds.sort((a, b) => new Date(progress[b].timestamp) - new Date(progress[a].timestamp)).slice(0, 5);

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 900 }}>
                    Welcome back, {user.name}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Pick up where you left off.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* Stats Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Solved</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                        <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}>{passedQuizzes}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Quizzes</span>
                    </div>
                </div>

                {/* Badges/Status Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Rank</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {passedQuizzes < 5 ? 'Novice' : passedQuizzes < 10 ? 'Apprentice' : passedQuizzes < 20 ? 'Scholar' : 'Grandmaster'}
                    </div>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        {passedQuizzes < 5 ? 'Keep practicing to rank up!' : 'You represent excellence!'}
                    </p>
                </div>
            </div>

            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)', fontWeight: 800 }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivity.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No activity yet. Go take some quizzes!
                    </div>
                ) : (
                    recentActivity.map(id => {
                        const item = progress[id];
                        return (
                            <div key={id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Quiz Result: {item.passed ? "PASSED" : "ATTEMPTED"}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(item.timestamp).toLocaleDateString()}</div>
                                </div>
                                <div style={{
                                    background: item.passed ? '#DCFCE7' : '#FEE2E2',
                                    color: item.passed ? '#166534' : '#991B1B',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontWeight: 700,
                                    fontSize: '0.9rem'
                                }}>
                                    {item.score} / {item.maxScore}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <Link href="/" style={{
                    display: 'inline-block',
                    padding: '1rem 3rem',
                    background: 'var(--text-primary)',
                    color: 'white',
                    borderRadius: '50px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Browse All Topics
                </Link>
            </div>
        </div>
    );
}
