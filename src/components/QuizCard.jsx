import React from 'react';

export default function QuizCard({ title, description, answer, steps = [], onResult, onReview, questionId, relatedSectionId, initialStatus, tableData, questionNumber, totalQuestions, contentStyle = {}, showTitle = true, textColor = 'var(--text-primary)' }) {
    const [showAnswer, setShowAnswer] = React.useState(false);
    // Fix: Initialize with initialStatus so it persists, but allow local updates (like Retry) to override
    const [localStatus, setLocalStatus] = React.useState(initialStatus || 'unanswered');
    const [timer, setTimer] = React.useState(0);
    const [userAnswer, setUserAnswer] = React.useState('');
    const [attempts, setAttempts] = React.useState(0);
    const [isWrong, setIsWrong] = React.useState(false);

    // Hint Logic
    const [hintCount, setHintCount] = React.useState(0);
    const [showSolution, setShowSolution] = React.useState(false);

    // Use localStatus as the source of truth
    const status = localStatus;

    // Timer effect
    React.useEffect(() => {
        if (status === 'unanswered') {
            const interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    // Normalize answer for comparison (remove spaces, convert to lowercase)
    const normalizeAnswer = (ans) => {
        if (!ans) return '';
        return ans.toString().toLowerCase().replace(/\s+/g, '').trim();
    };

    const checkUserAnswer = () => {
        const normalizedUserAnswer = normalizeAnswer(userAnswer);
        const normalizedCorrectAnswer = normalizeAnswer(answer);

        if (normalizedUserAnswer === normalizedCorrectAnswer) {
            // Correct answer
            setIsWrong(false);
            handleResult(true);
        } else {
            // Wrong answer
            setIsWrong(true);
            setAttempts(prev => prev + 1);
            // Don't allow moving forward
        }
    };

    const handleResult = (isCorrect) => {
        const result = isCorrect ? 'correct' : 'incorrect';
        setLocalStatus(result);
        if (onResult) onResult(questionId, isCorrect);
    };

    const handleHint = () => {
        if (hintCount < steps.length) {
            setHintCount(prev => prev + 1);
        } else {
            setShowSolution(true);
        }
    };

    const handleRetry = () => {
        setLocalStatus('unanswered');
        setIsWrong(false);
        setUserAnswer('');
    };

    return (
        <div className="card" style={{
            padding: '2rem',
            marginBottom: '2rem',
            border: status === 'correct' ? '2px solid var(--success)' : status === 'incorrect' ? '2px solid var(--error)' : '1px solid var(--border)',
            background: status === 'correct' ? '#1A3A2A' : 'var(--card-bg)',
            ...contentStyle
        }}>
            {/* Question Progress and Timer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: textColor }}>
                    Question {questionNumber} of {totalQuestions}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '1rem' }}>⏱</span>
                    <span>{timer}s</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '4px',
                background: '#2A2A2A',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${(questionNumber / totalQuestions) * 100}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    transition: 'width 0.3s'
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                {showTitle && <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: textColor }}>{title}</h4>}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {status === 'correct' && <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Correct</span>}
                    {status === 'incorrect' && (
                        <button
                            onClick={handleRetry}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--error)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                padding: 0
                            }}
                        >
                            ✗ Try Again
                        </button>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: '#2A2A2A', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>PRACTICE</span>
                </div>
            </div>

            <p style={{ marginBottom: '2rem', fontSize: '1.25rem', lineHeight: '1.6', color: '#f97316', fontWeight: 500 }}>{description}</p>
            {tableData && (
                <div style={{ overflowX: 'auto', marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ background: '#2A2A2A', borderBottom: '1px solid var(--border)' }}>
                                {tableData.headers.map((h, i) => (
                                    <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: textColor }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.rows.map((row, i) => (
                                <tr key={i} style={{ borderBottom: i < tableData.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    {row.map((cell, j) => (
                                        <td key={j} style={{ padding: '0.75rem 1rem', color: textColor }}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Answer Input Section */}
            {status === 'unanswered' && (
                <div style={{ marginBottom: '2rem' }}>
                    {/* Input Field with Validation */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Enter your answer..."
                            style={{
                                width: '100%',
                                padding: '1rem 3rem 1rem 1rem',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                border: `2px solid ${isWrong ? 'var(--error)' : 'var(--border)'}`,
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    checkUserAnswer();
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
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}>
                                ✗
                            </div>
                        )}
                    </div>

                    {/* Attempts Counter */}
                    {attempts > 0 && (
                        <div style={{
                            display: 'inline-block',
                            background: 'var(--error)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            marginBottom: '1rem'
                        }}>
                            Attempts: {attempts}
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        {!showSolution && (
                            <button
                                onClick={handleHint}
                                disabled={hintCount >= steps.length && !showAnswer}
                                style={{
                                    background: '#2A2A2A',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border)',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'background 0.2s',
                                    opacity: (hintCount >= steps.length && !showSolution) ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#3A3A3A'}
                                onMouseLeave={(e) => e.target.style.background = '#2A2A2A'}
                            >
                                💡 {hintCount >= steps.length ? 'Show Answer' : `Hint (${steps.length - hintCount})`}
                            </button>
                        )}

                        <button
                            onClick={checkUserAnswer}
                            style={{
                                background: 'white',
                                color: '#000',
                                border: 'none',
                                padding: '0.8rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '1rem',
                                flex: 1,
                                transition: 'transform 0.1s, background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#F0F0F0'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                            Check Answer
                        </button>
                    </div>
                </div>
            )}

            {/* Display Hints */}
            {hintCount > 0 && status === 'unanswered' && !showSolution && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#2A2A2A', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Hints:</h5>
                    {steps.slice(0, hintCount).map((step, i) => (
                        <div key={i} style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#fbbf24' }}>
                            • {step}
                        </div>
                    ))}
                </div>
            )}

            {(showSolution || showAnswer) && status === 'unanswered' && (
                <div style={{ padding: '1.5rem', background: '#2A2A2A', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <p style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: 0, marginBottom: '1rem' }}>Answer: <span style={{ color: 'var(--success)' }}>{answer}</span></p>

                    <div style={{ marginBottom: '1.5rem' }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                • {step}
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Did you get it right?</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => handleResult(true)} style={{ background: 'var(--success)', color: '#fff', padding: '0.6rem 2rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Yes</button>
                            <button onClick={() => handleResult(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '0.6rem 2rem', borderRadius: '30px', cursor: 'pointer', fontWeight: 600 }}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {(status === 'correct' || status === 'incorrect') && (
                <div style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Answer: {answer}</div>
                    {status === 'incorrect' && relatedSectionId && onReview && (
                        <div style={{ marginTop: '1rem' }}>
                            <button
                                onClick={() => onReview(relatedSectionId)}
                                style={{
                                    display: 'inline-block',
                                    color: 'var(--primary)',
                                    background: 'transparent',
                                    border: '1px solid var(--primary)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                📖 Review Topic
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
