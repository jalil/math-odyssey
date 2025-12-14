"use client";
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [name, setName] = useState('');
    const { login, allUsers } = useUser();
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            login(name.trim());
            router.push('/dashboard');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)'
        }}>
            <div className="card" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center', background: 'white' }}>
                <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: 'var(--primary)', fontWeight: 800 }}>
                    Who is learning?
                </h1>

                {/* Quick Select */}
                {allUsers.length > 0 && (
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Profile:</p>
                        {allUsers.map(u => (
                            <button
                                key={u.name}
                                onClick={() => {
                                    login(u.name);
                                    router.push('/dashboard');
                                }}
                                style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    background: 'var(--primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 4px rgba(45, 121, 246, 0.2)',
                                    fontWeight: 600
                                }}
                            >
                                <span>{u.name}</span>
                                <span style={{ fontSize: '1.2rem' }}>→</span>
                            </button>
                        ))}

                        <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 0' }}></div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Or create new profile:
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter User Name"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: '#F8FAFC',
                                color: 'var(--text-primary)',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="interactive-card"
                        style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Create & Start
                    </button>
                </form>
            </div>
        </div>
    );
}
