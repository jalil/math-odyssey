"use client";
import React from 'react';

export default function ModuleCompletionCard({ moduleTitle, onContinue, onBackToMenu, nextModuleName }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '55vh',
            textAlign: 'center',
            padding: '2rem',
        }}>
            {/* Celebration Card */}
            <div style={{
                background: 'white',
                borderRadius: '28px',
                padding: '3rem 2.5rem',
                maxWidth: '480px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #fbbf24',
                boxShadow: '0 20px 60px rgba(251, 191, 36, 0.2), 0 8px 24px rgba(0,0,0,0.06)',
            }}>
                {/* Top gradient accent */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981)',
                }} />

                {/* Decorative dots */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '1.2rem', opacity: 0.5 }}>✨</div>
                <div style={{ position: 'absolute', top: '40px', right: '25px', fontSize: '1rem', opacity: 0.4 }}>⭐</div>
                <div style={{ position: 'absolute', bottom: '60px', left: '30px', fontSize: '0.9rem', opacity: 0.3 }}>🌟</div>
                <div style={{ position: 'absolute', bottom: '30px', right: '20px', fontSize: '1.1rem', opacity: 0.4 }}>💫</div>

                {/* Trophy / Celebration */}
                <div style={{
                    fontSize: '5rem',
                    marginBottom: '0.5rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.4))',
                }}>
                    🏆
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem',
                    lineHeight: 1.2,
                }}>
                    Module Complete!
                </h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    marginBottom: '2rem',
                    lineHeight: 1.5,
                }}>
                    You've mastered <span style={{ color: '#1e293b', fontWeight: 700 }}>{moduleTitle}</span> 🎉
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {/* Primary: Continue */}
                    <button
                        onClick={onContinue}
                        style={{
                            width: '100%',
                            padding: '1.1rem 1.5rem',
                            background: 'linear-gradient(135deg, #f97316, #ef4444)',
                            border: 'none',
                            borderRadius: '16px',
                            color: 'white',
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(249, 115, 22, 0.35)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 14px 36px rgba(249, 115, 22, 0.45)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.35)';
                        }}
                    >
                        {nextModuleName ? `Start ${nextModuleName}` : 'Continue'} <span>→</span>
                    </button>

                    {/* Secondary: Back to Menu */}
                    <button
                        onClick={onBackToMenu}
                        style={{
                            width: '100%',
                            padding: '0.9rem 1.5rem',
                            background: '#f1f5f9',
                            border: '2px solid #e2e8f0',
                            borderRadius: '14px',
                            color: '#64748b',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e2e8f0';
                            e.currentTarget.style.color = '#334155';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        ← Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
}

