import React, { useState, useEffect } from 'react';
import { Plus, Minus, CheckCircle, RotateCcw, GripVertical } from 'lucide-react';

const BarBuilder = ({
    targetValue = 5,
    label = "Quantity",
    unitName = "blocks",
    onComplete
}) => {
    const [currentValue, setCurrentValue] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [feedback, setFeedback] = useState("Start building!");
    const [shake, setShake] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        if (currentValue === targetValue) {
            setIsComplete(true);
            setFeedback("Perfect! You built it!");
            if (onComplete) onComplete();
        } else if (currentValue > targetValue) {
            setIsComplete(false);
            setFeedback("Oops! Too many. Take some away.");
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } else {
            setIsComplete(false);
            if (currentValue === 0) setFeedback("Start building!");
            else setFeedback("Drag blocks here!");
        }
    }, [currentValue, targetValue, onComplete]);

    const handleAdd = () => {
        if (currentValue < 20) {
            setCurrentValue(prev => prev + 1);
        }
    };

    const handleRemove = () => {
        if (currentValue > 0) {
            setCurrentValue(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setCurrentValue(0);
        setIsComplete(false);
        setFeedback("Start building!");
    };

    // Drag and Drop Handlers
    const handleDragStart = (e) => {
        e.dataTransfer.setData("type", "block");
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "copy";
        if (!isDraggingOver) setIsDraggingOver(true);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleAdd();
    };

    return (
        <div style={{
            background: 'linear-gradient(145deg, #1e1e24, #25252b)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid #3f3f46',
            color: 'white',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            userSelect: 'none' // Prevent text selection during drag
        }}>
            <h3 style={{
                margin: '0 0 1.5rem 0',
                color: '#fff',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
            }}>
                <span role="img" aria-label="hammer">🔨</span> Build a Bar
            </h3>

            <div style={{
                marginBottom: '1.5rem',
                fontSize: '1.1rem',
                color: '#a1a1aa'
            }}>
                Task: Build a bar for <strong style={{ color: '#60a5fa' }}>{label}</strong> with <strong style={{ color: '#f97316', fontSize: '1.3rem' }}>{targetValue}</strong> {unitName}.
            </div>

            {/* Drop Zone / Scale Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    marginBottom: '1rem',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    border: `2px dashed ${isDraggingOver ? '#f97316' : '#3f3f46'}`,
                    borderRadius: '12px',
                    background: isDraggingOver ? 'rgba(249, 115, 22, 0.1)' : 'rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    padding: '1rem'
                }}
            >
                {currentValue === 0 && !isDraggingOver && (
                    <div style={{ position: 'absolute', color: '#52525b', pointerEvents: 'none' }}>
                        Drop blocks here!
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    height: '60px',
                    transition: 'all 0.3s ease',
                    transform: shake ? 'translateX(5px)' : 'none'
                }}>
                    {Array.from({ length: currentValue }).map((_, i) => (
                        <div key={i} style={{
                            width: '40px',
                            height: '40px',
                            background: i >= targetValue ? '#ef4444' : '#3b82f6',
                            borderRadius: '4px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.1)'
                        }}>
                            {i + 1}
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '1rem',
                    color: isComplete ? '#4ade80' : currentValue > targetValue ? '#f87171' : isDraggingOver ? '#f97316' : '#94a3b8',
                    fontWeight: 'bold',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {isComplete ? <CheckCircle size={20} /> : null}
                    {isDraggingOver ? "Release to drop!" : feedback}
                </div>
            </div>

            {/* Manual Controls (Horizontal Layout) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={handleReset}
                    title="Reset"
                    style={{
                        background: 'transparent',
                        border: '1px solid #52525b',
                        borderRadius: '8px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#a1a1aa',
                    }}
                >
                    <RotateCcw size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#27272a', padding: '5px 15px', borderRadius: '30px' }}>
                    <button onClick={handleRemove} disabled={currentValue === 0} style={{ background: 'none', border: 'none', color: 'white', cursor: currentValue === 0 ? 'default' : 'pointer', opacity: currentValue === 0 ? 0.3 : 1 }}><Minus size={20} /></button>
                    <span style={{ fontWeight: 'bold', minWidth: '20px' }}>{currentValue}</span>
                    <button onClick={handleAdd} disabled={isComplete} style={{ background: 'none', border: 'none', color: 'white', cursor: isComplete ? 'default' : 'pointer', opacity: isComplete ? 0.3 : 1 }}><Plus size={20} /></button>
                </div>
            </div>

            {/* Supply Bin */}
            <div style={{
                borderTop: '1px solid #3f3f46',
                paddingTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{ color: '#a1a1aa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Supply Bin
                </div>

                {/* Draggable Source Block */}
                <div
                    draggable={!isComplete}
                    onDragStart={handleDragStart}
                    style={{
                        width: '60px',
                        height: '60px',
                        background: isComplete ? '#52525b' : '#3b82f6',
                        borderRadius: '8px',
                        cursor: isComplete ? 'not-allowed' : 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                        opacity: isComplete ? 0.5 : 1,
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <GripVertical color="rgba(255,255,255,0.5)" />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#52525b' }}>
                    Drag me up!
                </div>
            </div>

            <style jsx>{`
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default BarBuilder;
