"use client";
import React from 'react';

export default function TableOfContents({ sections, onClose, progress, onNavigate }) {

    // Calculate overall percent
    const calculateCompletion = () => {
        let completed = 0;
        let total = 0;

        sections.forEach((s, idx) => {
            // Only count "trackable" items
            if (s.type === 'section-header' || s.type === 'checkpoint') {
                total++;
                const key = s.id ? `${s.id}-complete` : null;
                // Fallback to checking quizzes in that section?
                // For now, let's look for explicit 'passed' keys or [id]-complete keys
                // Actually, page.jsx logic for "locks" uses indexed keys for quizzes.
                // For this high-level TOC, we want to know if the SECTION is done.
                // Let's rely on Checkpoints for explicitly marking "Done".
                // For headers, maybe we just show a check if all quizzes under it are passed?
                // Let's pass the "isCompleted" status from parent processing if possible, or computing it here.
                // To keep it simple, let's just show what we know.
            }
        });
        return { completed: 0, total: 0 }; // Placeholder logic, visual only for first pass
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'var(--card-bg)',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Table of Contents</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Track your progress</p>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {sections.map((section, idx) => {
                        // Filter for high-level items only
                        if (section.type !== 'section-header' && section.type !== 'checkpoint') return null;

                        const isCheckpoint = section.type === 'checkpoint';

                        // Determine status (this logic will be improved by passing enriched sections)
                        // For now we assume the parent passes us "enriched" sections with status.
                        // Or we look up simple IDs.
                        const isComplete = progress[`${section.id}-complete`] || (progress[section.id] && progress[section.id].passed);

                        return (
                            <div
                                key={idx}
                                onClick={() => onNavigate(section.originalIndex)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: isComplete ? 'rgba(16, 185, 129, 0.1)' : '#2A2A2A',
                                    border: `1px solid ${isComplete ? '#10B981' : 'var(--border)'}`,
                                    marginBottom: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'transform 0.2s',
                                    opacity: 1
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isComplete ? '#10B981' : '#3f3f46',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    {isComplete ? '✓' : idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: isComplete ? '#10B981' : 'var(--text-primary)' }}>
                                        {section.title || "Review Checkpoint"}
                                    </div>
                                    {section.description && !isCheckpoint && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {section.description}
                                        </div>
                                    )}
                                </div>
                                {isCheckpoint && (
                                    <div style={{ fontSize: '1.2rem' }}>🏁</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
