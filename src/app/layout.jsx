"use client";
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
// Sidebar removed for Quest Map design


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

// ... (TopNav stays mostly the same but maybe needs positioning tweak for mobile)

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <UserProvider>
                    <div className="app-container">
                        <main className="main-content">
                            {children}
                        </main>
                    </div>
                </UserProvider>
            </body>
        </html>
    );
}
