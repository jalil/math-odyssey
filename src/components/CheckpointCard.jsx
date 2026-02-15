"use client";
import React from 'react';
import { triggerConfetti } from '../utils/confetti';
import { playFanfare } from '../utils/audio';

export default function CheckpointCard({ title, description, onComplete, onNext, isCompleted }) {
    const handleComplete = () => {
        triggerConfetti();
        playFanfare();
        if (onComplete) onComplete();
    };

    return (
        <div className="animate-scale-pop" style={{
            background: 'var(--card-bg)',
            borderRadius: '24px',
            padding: '3rem',
            textAlign: 'center',
            border: '2px solid var(--border)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '600px',
            margin: '2rem auto'
        }}>
            <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {isCompleted ? '🎉' : '🏁'}
            </div>

            <h2 style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '1rem'
            }}>
                {title}
            </h2>

            <p style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                marginBottom: '2.5rem',
                lineHeight: '1.6'
            }}>
                {description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={handleComplete}
                    disabled={isCompleted}
                    style={{
                        background: isCompleted ? '#10B981' : 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '1.2rem 3rem',
                        borderRadius: '50px',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: isCompleted ? 'default' : 'pointer',
                        boxShadow: isCompleted ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                        transition: 'transform 0.2s',
                        transform: isCompleted ? 'none' : 'scale(1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.8rem'
                    }}
                >
                    {isCompleted ? (
                        <>
                            <span>✓</span> Completed
                        </>
                    ) : (
                        <>
                            <span>⚡️</span> Mark Section Complete
                        </>
                    )}
                </button>

                {/* Always show Continue button so the user can advance */}
                {onNext && (
                    <button
                        onClick={onNext}
                        style={{
                            background: 'linear-gradient(135deg, #F97316, #EF4444)',
                            color: 'white',
                            border: 'none',
                            padding: '1.2rem 3rem',
                            borderRadius: '50px',
                            fontSize: '1.3rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px -5px rgba(249, 115, 22, 0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginTop: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 14px 28px -5px rgba(249, 115, 22, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(249, 115, 22, 0.4)';
                        }}
                    >
                        Continue to Next Section <span>→</span>
                    </button>
                )}
            </div>
        </div>
    );
}
