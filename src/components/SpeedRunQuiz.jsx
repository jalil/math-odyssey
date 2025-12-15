"use client";
import React, { useState, useEffect, useRef } from 'react';
import { triggerConfetti, triggerPop, triggerShake } from '../utils/confetti';
import { playCorrectSound, playIncorrectSound, playTick, playFanfare } from '../utils/audio';

export default function SpeedRunQuiz() {
    const [gameState, setGameState] = useState('LOBBY'); // LOBBY, PLAYING, GAME_OVER
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [highScore, setHighScore] = useState(0);
    const [question, setQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isWrong, setIsWrong] = useState(false);

    // Check for high score on mount
    useEffect(() => {
        const best = parseInt(localStorage.getItem('math_speed_highscore') || '0');
        setHighScore(best);
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (gameState === 'PLAYING') {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    if (prev <= 6 && prev > 1) { // Tick on 5, 4, 3, 2, 1 (logic checks prev so 6->5 tick)
                        playTick();
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const generateQuestion = () => {
        const types = ['+', '-', '*'];
        const type = types[Math.floor(Math.random() * types.length)];
        let num1, num2, answer;

        // Difficulty scaling could be added here based on score
        if (type === '+') {
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            answer = num1 + num2;
        } else if (type === '-') {
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * num1); // Ensure positive result
            answer = num1 - num2;
        } else {
            // Multiplication (keep it simpler tables)
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 * num2;
        }

        setQuestion({ text: `${num1} ${type} ${num2}`, answer });
        setUserAnswer('');
    };

    const startGame = () => {
        setScore(0);
        setTimeLeft(15);
        setGameState('PLAYING');
        generateQuestion();
    };

    const endGame = () => {
        setGameState('GAME_OVER');
        triggerConfetti();

        // Update High Score
        // We use a functional update or ref to get current score if called from timer?? 
        // No, in this component scope, we rely on the state when endGame is called.
        // Wait, endGame from timer relies on closure state which might be stale!
        // To fix this, we'll check the current score ref or pass it.
        // Actually, the timer effect dependency on gameState helps, but score might be stale inside the interval closure??
        // Let's rely on effect cleaning up and restarting if we needed score access, but we assume score state is correct at moment of render for Game Over UI.
        // The High Score saving should happen in an effect triggered by GAME_OVER state change to ensure fresh state access.
    };

    // Save High Score Effect
    useEffect(() => {
        if (gameState === 'GAME_OVER') {
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('math_speed_highscore', score.toString());
                playFanfare();
            }
        }
    }, [gameState, score, highScore]);


    const checkAnswer = (e) => {
        e.preventDefault();
        if (!question) return;

        const val = parseInt(userAnswer);
        if (!isNaN(val) && val === question.answer) {
            // Correct
            const newScore = score + 100;
            setScore(newScore);
            setTimeLeft(prev => Math.min(prev + 2, 15)); // +2 seconds bonus, cap at 15
            triggerPop('score-display');
            playCorrectSound();
            generateQuestion();
        } else {
            // Wrong
            setIsWrong(true);
            triggerShake('speed-input');
            playIncorrectSound();
            setTimeout(() => setIsWrong(false), 500);
            setUserAnswer(''); // Clear on wrong? Or let them retry? Let's clear for speed.
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            textAlign: 'center',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            {gameState === 'LOBBY' && (
                <div className="card" style={{ padding: '3rem', border: '2px solid var(--primary)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏎️</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>SPEED RUN</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.2rem' }}>
                        Answer as many questions as you can in 15 seconds!
                    </p>
                    <div style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#F59E0B', fontWeight: 700 }}>
                        High Score: {highScore}
                    </div>
                    <button
                        onClick={startGame}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '1.2rem 3rem',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        START ENGINE
                    </button>
                </div>
            )}

            {gameState === 'PLAYING' && (
                <div className="card" style={{ padding: '2rem' }}>
                    {/* HUD */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div id="score-display" style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>SCORE</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>{score}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>TIME</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: timeLeft < 10 ? 'var(--error)' : 'white' }}>{timeLeft}s</div>
                        </div>
                    </div>

                    {/* Question */}
                    <div style={{ margin: '3rem 0' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'white' }}>
                            {question?.text}
                        </div>
                    </div>

                    {/* Input */}
                    <form onSubmit={checkAnswer}>
                        <input
                            id="speed-input"
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="?"
                            autoFocus
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: `4px solid ${isWrong ? 'var(--error)' : 'var(--primary)'}`,
                                color: 'white',
                                fontSize: '3rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                width: '200px',
                                outline: 'none',
                                padding: '0.5rem'
                            }}
                        />
                    </form>
                    <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Press ENTER to submit
                    </div>
                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="card" style={{ padding: '3rem', border: '2px solid var(--primary)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏁</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>TIME'S UP!</h2>

                    <div style={{ margin: '2rem 0' }}>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>FINAL SCORE</div>
                        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#F59E0B', textShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>
                            {score}
                        </div>
                        {score >= highScore && score > 0 && (
                            <div style={{ color: 'var(--success)', fontWeight: 700, marginTop: '0.5rem' }}>
                                NEW HIGH SCORE! 🏆
                            </div>
                        )}
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            background: 'white',
                            color: 'black',
                            border: 'none',
                            padding: '1rem 2.5rem',
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            borderRadius: '30px',
                            cursor: 'pointer',
                            marginRight: '1rem'
                        }}
                    >
                        Play Again
                    </button>
                    <button
                        onClick={() => setGameState('LOBBY')}
                        style={{
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            padding: '1rem 2.5rem',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            borderRadius: '30px',
                            cursor: 'pointer'
                        }}
                    >
                        Exit
                    </button>
                </div>
            )}
        </div>
    );
}
