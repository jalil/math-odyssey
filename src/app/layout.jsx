import React, { Suspense } from 'react';
import './globals.css';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProvider, useUser } from '../context/UserContext';
import { Inter } from 'next/font/google';
import SidebarSearch from '../components/SidebarSearch';
import StreakCounter from '../components/StreakCounter';

const inter = Inter({ subsets: ['latin'] });

// Separate component for Sidebar to use useUser hook
function Sidebar() {
    const { user, logout } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTopicId = searchParams.get('topic');

    const NavLink = ({ topicId, children, hasBadge }) => {
        const isActive = currentTopicId === topicId;
        return (
            <Link
                href={`/?topic=${topicId}`}
                className="nav-item"
                style={{
                    fontSize: '0.95rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 400,
                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between', // For badge positioning if needed
                    textDecoration: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isActive && <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>▶</span>}
                    {children}
                </div>
                {hasBadge && (
                    <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--success)',
                        marginLeft: '8px'
                    }}></span>
                )}
            </Link>
        );
    };

    return (
        <nav style={{
            width: '260px',
            backgroundColor: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 50,
            position: 'relative',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto'
        }}>
            <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    Math <span style={{ color: 'var(--primary)' }}>Odyssey</span>
                </span>
            </div>

            {user && <SidebarSearch />}

            <Link href="/" className="nav-item" style={{
                color: !currentTopicId ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: !currentTopicId ? 700 : 400
            }}>
                <span style={{ marginRight: '8px' }}>🏠</span> Home
            </Link>

            {/* Only show Dashboard for admin users */}
            {user && user.name.toLowerCase() === 'admin' && (
                <Link href="/dashboard" className="nav-item">
                    <span style={{ marginRight: '8px' }}>📊</span> Dashboard
                </Link>
            )}

            {user && (
                <>
                    {user.name.toLowerCase() !== 'admin' && <StreakCounter />}
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.75rem',
                            paddingLeft: '0.5rem'
                        }}>
                            Modules
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <NavLink topicId="singapore-p3">🏠 Beginner Village (P3)</NavLink>
                            <NavLink topicId="singapore-p4">🌲 Factor Forest (P4)</NavLink>
                            <NavLink topicId="bar-model-level-1" hasBadge={true}>🌉 Bridge of Logic (Bar Models)</NavLink>
                            <NavLink topicId="singapore-p5">🏰 Fraction Fortress (P5)</NavLink>
                            <NavLink topicId="singapore-p6">🏔️ Mt. Mastery (P6)</NavLink>
                            <NavLink topicId="speed-run">🏎️ Speed Run Mode</NavLink>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.75rem',
                            paddingLeft: '0.5rem'
                        }}>
                            Exam Prep
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <NavLink topicId="mita">Mita Intl IC</NavLink>
                            <NavLink topicId="hiroo">Hiroo Gakuen AG</NavLink>
                            <NavLink topicId="ultimate-prep">🚀 Ultimate Prep</NavLink>
                        </div>
                    </div>
                </>
            )}

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                {user && user.name.toLowerCase() === 'admin' && (
                    <button
                        onClick={() => router.push('/admin')}
                        className="nav-item"
                        style={{
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            width: '100%',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                        }}
                    >
                        ⚙️ Admin
                    </button>
                )}
                {user ? (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Learning as
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{user.name}</div>
                        <button
                            onClick={logout}
                            style={{
                                background: '#F1F5F9',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s',
                                fontWeight: 500
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <Link href="/login" style={{
                        display: 'block',
                        padding: '0.75rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '30px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontWeight: 600,
                        marginTop: '1rem',
                        boxShadow: '0 2px 4px rgba(45, 121, 246, 0.2)'
                    }}>
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
}


function TopNav() {
    const { user, logout } = useUser();

    if (!user) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '1rem',
            right: '2rem',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hi, <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
            </span>
            <button
                onClick={logout}
                style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: 'var(--error)',
                    fontWeight: 600,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                Log Out
            </button>
        </div>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <UserProvider>
                    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
                        <Suspense fallback={<div style={{ width: '260px' }}>Loading Sidebar...</div>}>
                            <Sidebar />
                        </Suspense>
                        <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
                            <TopNav />
                            {children}
                        </main>
                    </div>
                </UserProvider>
            </body>
        </html>
    );
}
