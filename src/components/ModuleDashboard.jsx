"use client";
import React from 'react';

// Vibrant color palettes for each card
const CARD_THEMES = [
    { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glow: 'rgba(102, 126, 234, 0.4)', lightBg: '#EEF0FF' },
    { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', glow: 'rgba(245, 87, 108, 0.4)', lightBg: '#FFF0F5' },
    { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', glow: 'rgba(79, 172, 254, 0.4)', lightBg: '#F0F9FF' },
    { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', glow: 'rgba(67, 233, 123, 0.4)', lightBg: '#F0FFF4' },
    { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', glow: 'rgba(250, 112, 154, 0.4)', lightBg: '#FFF5F7' },
    { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', glow: 'rgba(161, 140, 209, 0.4)', lightBg: '#F8F0FF' },
    { gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', glow: 'rgba(252, 203, 144, 0.4)', lightBg: '#FFF8F0' },
    { gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', glow: 'rgba(132, 250, 176, 0.4)', lightBg: '#F0FFF8' },
];

// Smart icon matching based on title keywords
function getSmartIcon(title, type) {
    const t = title.toLowerCase();
    if (type === 'quiz' || t.includes('practice') || t.includes('quiz') || t.includes('test')) return '🎯';
    if (t.includes('review') || t.includes('challenge')) return '⭐';
    if (t.includes('ratio')) return '⚖️';
    if (t.includes('fraction')) return '🍕';
    if (t.includes('decimal')) return '🔢';
    if (t.includes('percent')) return '💯';
    if (t.includes('speed') || t.includes('rate')) return '🏎️';
    if (t.includes('volume')) return '📦';
    if (t.includes('area')) return '📐';
    if (t.includes('perimiter') || t.includes('perimeter')) return '📏';
    if (t.includes('angle') || t.includes('geometry') || t.includes('triangle')) return '📐';
    if (t.includes('graph') || t.includes('data') || t.includes('chart')) return '📊';
    if (t.includes('money') || t.includes('interest') || t.includes('profit') || t.includes('cost')) return '💰';
    if (t.includes('time') || t.includes('clock')) return '⏰';
    if (t.includes('pattern') || t.includes('sequence')) return '🧩';
    if (t.includes('number') || t.includes('whole')) return '🔢';
    if (t.includes('algebra') || t.includes('equation')) return '🧮';
    if (t.includes('logic') || t.includes('problem')) return '🧠';
    return '🚀';
}

export default function ModuleDashboard({ currentSection, subSections, onNavigate }) {
    if (!subSections || subSections.length === 0) return null;

    return (
        <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 animate-fade-in" style={{ maxWidth: '720px', margin: '2.5rem auto 0' }}>
            {subSections.map((sub, index) => {
                const isCompleted = sub.isCompleted;
                const theme = CARD_THEMES[index % CARD_THEMES.length];
                const icon = getSmartIcon(sub.title, sub.type);

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onNavigate(sub.originalSectionIndex || sub.originalIndex, sub.internalIndex, sub.targetId)}
                        style={{
                            background: 'white',
                            border: isCompleted ? '3px solid #10B981' : '2px solid #e2e8f0',
                            borderRadius: '20px',
                            padding: '0',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                            textAlign: 'center',
                            position: 'relative',
                            minHeight: '220px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 20px 40px ${theme.glow}`;
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = isCompleted ? '#10B981' : '#e2e8f0';
                        }}
                    >
                        {/* Gradient Header Strip */}
                        <div style={{
                            background: theme.gradient,
                            padding: '1.5rem 1rem 1.8rem',
                            position: 'relative',
                        }}>
                            {/* Large Icon */}
                            <div style={{
                                fontSize: '3.5rem',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                                lineHeight: 1,
                            }}>
                                {icon}
                            </div>

                            {/* Completed badge overlay */}
                            {isCompleted && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(255,255,255,0.95)',
                                    color: '#059669',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}>
                                    ✓ DONE
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div style={{
                            padding: '1.2rem 1.2rem 1.4rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            justifyContent: 'space-between',
                        }}>
                            {/* Title */}
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                color: '#1e293b',
                                marginBottom: '0.3rem',
                                lineHeight: 1.3,
                            }}>
                                {sub.title}
                            </h3>

                            {/* Description */}
                            {sub.description && (
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#64748b',
                                    fontWeight: 500,
                                    marginBottom: '0.8rem',
                                    lineHeight: 1.4,
                                }}>
                                    {sub.description}
                                </p>
                            )}

                            {/* CTA Pill */}
                            <div style={{
                                background: isCompleted ? '#ECFDF5' : theme.gradient,
                                color: isCompleted ? '#059669' : 'white',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                padding: '8px 20px',
                                borderRadius: '50px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: 'auto',
                                boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                            }}>
                                {isCompleted ? '✓ Review' : 'Start Quest'} <span>→</span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

