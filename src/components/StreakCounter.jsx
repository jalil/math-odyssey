"use client";
import React, { useState, useEffect } from 'react';
import { triggerConfetti } from '../utils/confetti';

export default function StreakCounter() {
    const [streak, setStreak] = useState(0);
    const [coins, setCoins] = useState(0);
    const [showRewardModal, setShowRewardModal] = useState(false);

    useEffect(() => {
        // Load data from localStorage
        const storedStreak = parseInt(localStorage.getItem('math_streak') || '0');
        const storedCoins = parseInt(localStorage.getItem('math_coins') || '0');
        const lastVisit = localStorage.getItem('math_last_visit');

        setStreak(storedStreak);
        setCoins(storedCoins);

        const today = new Date().toDateString();

        if (lastVisit !== today) {
            // New day! Check streak logic
            let newStreak = storedStreak;

            if (lastVisit) {
                const lastDate = new Date(lastVisit);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastDate.toDateString() === yesterday.toDateString()) {
                    // Visited yesterday, increment streak
                    newStreak += 1;
                } else {
                    // Broken streak, reset to 1
                    newStreak = 1;
                }
            } else {
                // First visit ever
                newStreak = 1;
            }

            // Save new state
            localStorage.setItem('math_streak', newStreak.toString());
            localStorage.setItem('math_last_visit', today);

            // Give Daily Reward
            const rewardAmount = 50;
            const newCoins = storedCoins + rewardAmount;
            localStorage.setItem('math_coins', newCoins.toString());

            // Update State
            setStreak(newStreak);
            setCoins(newCoins);
            setShowRewardModal(true);

            // Trigger Confetti for the reward
            setTimeout(() => triggerConfetti(), 500);
        }

        // Also listen for coin updates from other components (custom event)
        const handleCoinUpdate = () => {
            const updatedCoins = parseInt(localStorage.getItem('math_coins') || '0');
            setCoins(updatedCoins);
        };

        window.addEventListener('math_coins_updated', handleCoinUpdate);
        return () => window.removeEventListener('math_coins_updated', handleCoinUpdate);

    }, []);

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: '#1A1A1A',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)'
            }}>
                {/* Streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔥</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STREAK</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{streak} Days</div>
                    </div>
                </div>

                <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

                {/* Coins */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🪙</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>COINS</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F59E0B' }}>{coins}</div>
                    </div>
                </div>
            </div>

            {/* Daily Reward Modal */}
            {showRewardModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 9999, // High z-index to sit on top of everything
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: '#1A1A1A',
                        border: '2px solid var(--primary)',
                        padding: '2rem',
                        borderRadius: '24px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        animation: 'pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
                        <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Daily Reward!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            Welcome back! You kept your streak alive.
                        </p>

                        <div style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid #F59E0B',
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🪙</span>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>+50</span>
                        </div>

                        <button
                            onClick={() => setShowRewardModal(false)}
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 3rem',
                                borderRadius: '30px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                            }}
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
