"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BarModelDiagram from './BarModelDiagram';
import { triggerConfetti, triggerPop, triggerShake } from '../utils/confetti';
import { playCorrectSound, playIncorrectSound, playBossHit, playFanfare } from '../utils/audio';

export default function QuizMode({ questions, topicId, onComplete, isAdmin }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isWrong, setIsWrong] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [hintCount, setHintCount] = useState(0); // Track number of hints shown
    const [timeRemaining, setTimeRemaining] = useState(120); // 120 seconds (2 minutes) per question
    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const [quizFinished, setQuizFinished] = useState(false);

    // Boss Battle State
    const [isBossBattle, setIsBossBattle] = useState(true); // Default to on for excitement!
    const [bossHealth, setBossHealth] = useState(100);
    const [damageAnim, setDamageAnim] = useState(null); // { value, key }

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const maxHints = 3; // Maximum hints before showing answer

    // Countdown timer
    useEffect(() => {
        if (!isCorrect && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Time's up - mark as incorrect and move to next
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isCorrect, timeRemaining, currentQuestionIndex]);

    const handleTimeUp = () => {
        setIsWrong(true);
        playIncorrectSound();
        setAnsweredQuestions(prev => [...prev, {
            questionIndex: currentQuestionIndex,
            correct: false,
            timeUp: true
        }]);
    };

    // Normalize answer for comparison
    const normalizeAnswer = (ans) => {
        return ans.toString().toLowerCase().replace(/\s+/g, '').trim();
    };

    const checkAnswer = () => {
        // Check if answer is empty
        if (!userAnswer || userAnswer.trim() === '') {
            alert('Please enter an answer before checking!');
            return;
        }

        const normalizedUserAnswer = normalizeAnswer(userAnswer);

        const correctAnswer = currentQuestion.answer;
        let isAnswerCorrect = false;

        if (Array.isArray(correctAnswer)) {
            isAnswerCorrect = correctAnswer.some(ans => normalizeAnswer(ans) === normalizedUserAnswer);
        } else {
            isAnswerCorrect = normalizeAnswer(correctAnswer) === normalizedUserAnswer;
        }

        if (isAnswerCorrect) {
            // Correct!
            setIsCorrect(true);
            setIsWrong(false);
            playCorrectSound();

            // Trigger Pop Animation on Next Button
            setTimeout(() => triggerPop('next-btn'), 100);

            // Boss Battle Damage Logic
            if (isBossBattle) {
                const damage = Math.ceil(100 / totalQuestions);
                setBossHealth(prev => Math.max(0, prev - damage));
                triggerShake('boss-avatar');
                playBossHit();
                setDamageAnim({ value: -damage, key: Date.now() });
                setTimeout(() => setDamageAnim(null), 1000);
            }

            // Only add to answered questions if not already added (from time up)
            setAnsweredQuestions(prev => {
                // Check if this question was already marked as time up
                const alreadyAnswered = prev.some(q => q.questionIndex === currentQuestionIndex);
                if (alreadyAnswered) {
                    // Update the existing entry to mark as correct
                    return prev.map(q =>
                        q.questionIndex === currentQuestionIndex
                            ? { ...q, correct: true, attempts: attempts + 1, timeUsed: 60 - timeRemaining }
                            : q
                    );
                } else {
                    return [...prev, {
                        questionIndex: currentQuestionIndex,
                        correct: true,
                        attempts: attempts + 1,
                        timeUsed: 60 - timeRemaining
                    }];
                }
            });
        } else {
            // Wrong
            setIsWrong(true);
            setIsWrong(true);
            setAttempts(prev => prev + 1);
            triggerShake('answer-input');
            playIncorrectSound();
        }
    };

    const showNextHint = () => {
        if (hintCount < maxHints) {
            setHintCount(prev => prev + 1);
        }
    };

    const goToNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            resetQuestion();
        } else {
            // Quiz complete - show summary
            setQuizFinished(true);
        }
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            resetQuestion();
        }
    };

    const handleSkip = () => {
        // Mark as incorrect and skipped
        setAnsweredQuestions(prev => {
            // Check if already answered (unlikely if button is only shown when !isCorrect, but good safety)
            if (prev.some(q => q.questionIndex === currentQuestionIndex)) return prev;

            return [...prev, {
                questionIndex: currentQuestionIndex,
                correct: false,
                skipped: true,
                timeUsed: 120 - timeRemaining
            }];
        });

        // Move to next question immediately
        goToNext();
    };

    const resetQuestion = () => {
        setUserAnswer('');
        setAttempts(0);
        setIsWrong(false);
        setIsCorrect(false);
        setHintCount(0);
        setTimeRemaining(120);
    };

    // Effect for Quiz Finished Confetti
    useEffect(() => {
        if (quizFinished) {
            triggerConfetti();
            playFanfare();
        }
    }, [quizFinished]);

    if (quizFinished) {
        const correctCount = answeredQuestions.filter(q => q.correct).length;
        // Include the current question result if it was the last one and correct
        // (The logic in checkAnswer updates answeredQuestions, so it should be there)

        const score = Math.round((correctCount / totalQuestions) * 100);

        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--background)',
                padding: '4rem 2rem',
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                }}>
                    🎉
                </div>
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                }}>
                    Review Test Completed!
                </h2>
                {isBossBattle && (
                    <div style={{ marginBottom: '2rem' }}>
                        <img
                            src="/images/math_monster_boss.png"
                            alt="Defeated Monster"
                            style={{
                                width: '120px',
                                height: '120px',
                                objectFit: 'contain',
                                filter: 'grayscale(100%) opacity(0.8)', // Greyed out because defeated
                                transform: 'rotate(180deg)' // Upside down logic for "defeated"? Or just grey. Let's start with grey.
                            }}
                        />
                        <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.5rem', marginTop: '1rem' }}>
                            MONSTER DEFEATED! ⚔️
                        </div>
                    </div>
                )
                }
                <div style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '3rem'
                }}>
                    You answered <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{correctCount}</span> out of <span style={{ fontWeight: 700 }}>{totalQuestions}</span> questions correctly.
                </div>

                <div style={{
                    padding: '2rem',
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    marginBottom: '3rem',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Final Score</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: score >= 80 ? 'var(--success)' : score >= 50 ? '#F59E0B' : 'var(--error)' }}>
                        {score}%
                    </div>
                </div>

                <button
                    onClick={() => onComplete && onComplete(answeredQuestions)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '1.2rem 3rem',
                        borderRadius: '12px',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        transition: 'transform 0.2s'
                    }}
                >
                    Complete & Save Progress
                </button>
            </div >
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            {/* Header with Progress and Timer */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: timeRemaining < 10 ? 'var(--error)' : 'var(--text-secondary)'
                    }}>
                        <span>⏱</span>
                        <span>{timeRemaining}s</span>
                    </div>
                </div>

            </div>

            {/* Boss Battle UI vs Standard Progress */}
            {isBossBattle ? (
                <div style={{
                    background: '#2A2A2A',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            id="boss-avatar"
                            src="/images/math_monster_boss.png"
                            alt="Math Monster"
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                            }}
                        />
                        {damageAnim && (
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: '#EF4444',
                                fontWeight: '900',
                                fontSize: '1.5rem',
                                animation: 'pop 0.5s ease-out forwards',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}>
                                {damageAnim.value}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>MATH MONSTER</span>
                            <span style={{ fontWeight: 700, color: bossHealth < 30 ? 'var(--error)' : 'var(--success)' }}>
                                {bossHealth}% HP
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '20px',
                            background: '#111',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #333',
                            position: 'relative' // For hit flash
                        }}>
                            <div style={{
                                width: `${bossHealth}%`,
                                height: '100%',
                                background: bossHealth < 30 ? 'var(--error)' : 'var(--success)',
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                </div>
            ) : (
                /* Standard Progress Bar */
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#2A2A2A',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                            height: '100%',
                            background: 'var(--primary)',
                            transition: 'width 0.3s'
                        }} />
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}></div>

            {/* Question Card */}
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid var(--border)'
            }}>
                {/* Question Text */}
                <p style={{
                    fontSize: '1.3rem',
                    lineHeight: '1.6',
                    color: '#f97316',
                    fontWeight: 500,
                    marginBottom: '2rem'
                }}>
                    {currentQuestion.description}
                </p>

                {/* Table if available */}
                {currentQuestion.tableData && (
                    <div style={{
                        marginBottom: '2rem',
                        overflowX: 'auto'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: 'var(--card-background)',
                            border: '1px solid var(--border)'
                        }}>
                            <thead>
                                <tr>
                                    {currentQuestion.tableData.headers.map((header, idx) => (
                                        <th key={idx} style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            borderBottom: '2px solid var(--border)',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            background: '#2A2A2A'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentQuestion.tableData.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx} style={{
                                                padding: '1rem',
                                                borderBottom: '1px solid var(--border)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bar Model Diagram if available */}
                {currentQuestion.barModelData && (
                    <div style={{
                        background: '#2A2A2A',
                        padding: '2rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        border: '1px solid var(--border)'
                    }}>
                        <BarModelDiagram
                            type={currentQuestion.barModelData.type}
                            data={currentQuestion.barModelData}
                        />
                    </div>
                )}

                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <input
                        id="answer-input"
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Your answer..."
                        disabled={isCorrect}
                        style={{
                            width: '100%',
                            padding: '1.2rem 3rem 1.2rem 1.2rem',
                            fontSize: '1.2rem',
                            borderRadius: '12px',
                            border: `2px solid ${isWrong ? 'var(--error)' : isCorrect ? 'var(--success)' : 'var(--border)'}`,
                            background: isCorrect ? '#1A3A2A' : 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isCorrect) {
                                checkAnswer();
                            }
                        }}
                    />
                    {/* Validation Icon */}
                    {isWrong && (
                        <div style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--error)',
                            fontSize: '1.8rem',
                            fontWeight: 'bold'
                        }}>
                            ✗
                        </div>
                    )}
                    {isCorrect && (
                        <div style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--success)',
                            fontSize: '1.8rem',
                            fontWeight: 'bold'
                        }}>
                            ✓
                        </div>
                    )}
                </div>

                {/* Attempts Counter */}
                {attempts > 0 && !isCorrect && (
                    <div style={{
                        display: 'inline-block',
                        background: 'var(--error)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem'
                    }}>
                        Attempts: {attempts}
                    </div>
                )}


                {/* Hint Section */}
                {hintCount > 0 && (
                    <div style={{
                        background: '#2A2A2A',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--border)'
                    }}>
                        {/* Show hints progressively */}
                        {currentQuestion.steps && hintCount <= maxHints && (
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Hint {hintCount} of {maxHints}:
                                </p>
                                {currentQuestion.steps.slice(0, hintCount).map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            flexShrink: 0,
                                            fontWeight: 'bold'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <span style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{step}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Show answer only after all hints are exhausted */}
                        {hintCount > maxHints && (
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                                    Answer: <span style={{ color: 'var(--success)' }}>
                                        {Array.isArray(currentQuestion.answer) ? currentQuestion.answer[0] : currentQuestion.answer}
                                    </span>
                                </p>
                                {currentQuestion.steps && (
                                    <div>
                                        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Complete Solution:</p>
                                        {currentQuestion.steps.map((step, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                                marginBottom: '0.5rem',
                                                alignItems: 'flex-start'
                                            }}>
                                                <div style={{
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    flexShrink: 0,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <span style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {!isCorrect && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={showNextHint}
                            disabled={hintCount > maxHints}
                            style={{
                                background: hintCount > maxHints ? '#1A1A1A' : '#2A2A2A',
                                color: hintCount > maxHints ? 'var(--text-secondary)' : 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '1rem 1.5rem',
                                borderRadius: '12px',
                                cursor: hintCount > maxHints ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: hintCount > maxHints ? 0.5 : 1
                            }}
                        >
                            💡 {hintCount > maxHints ? 'No More Hints' : `Hint (${hintCount}/${maxHints})`}
                        </button>
                        <button
                            onClick={handleSkip}
                            style={{
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                padding: '1rem 1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem'
                            }}
                        >
                            Skip ⏩
                        </button>
                        <button
                            onClick={checkAnswer}
                            style={{
                                background: 'white',
                                color: '#000',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '1rem',
                                flex: 1
                            }}
                        >
                            Check Answer
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    style={{
                        background: '#2A2A2A',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                        opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Back
                </button>

                {/* Progress Indicator - REMOVED */}
                <div style={{ flex: 1 }} />

                <button
                    id="next-btn"
                    onClick={goToNext}
                    disabled={!isCorrect && !isAdmin}
                    style={{
                        background: (isCorrect || isAdmin) ? 'var(--primary)' : '#2A2A2A',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        cursor: (isCorrect || isAdmin) ? 'pointer' : 'not-allowed',
                        fontWeight: 700,
                        fontSize: '1rem',
                        opacity: (isCorrect || isAdmin) ? 1 : 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
