"use client";
import React from 'react';

export default function StepContainer({
    children,
    title,
    subtitle,
    onNext,
    onBack,
    showNext = true,
    showBack = true,
    disableNext = false,
    disableBack = false,
    nextLabel = "Next →",
    backLabel = "← Back",
    segments = 1,
    currentSegment = 0
}) {
    return (
        <div style={{
            marginBottom: '3rem',
            background: '#09090b', // Deep dark background
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #27272a',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '500px', // Ensure consistent height
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header Area */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff'
                }}>
                    {title}
                </h3>
                {subtitle && (
                    <span style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#a1a1aa'
                    }}>
                        {subtitle}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {children}
            </div>

            {/* Bottom Navigation Control Bar */}
            <div style={{
                marginTop: 'auto', // Push to bottom
                paddingTop: '1.5rem',
                borderTop: '1px solid #27272a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Back Button */}
                {showBack ? (
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={disableBack}
                        style={{
                            background: 'transparent',
                            color: disableBack ? '#52525b' : '#a1a1aa',
                            border: '1px solid #27272a',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            cursor: disableBack ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            opacity: disableBack ? 0.5 : 1
                        }}
                    >
                        {backLabel}
                    </button>
                ) : <div />}

                {/* Segmented Progress Bar - REMOVED per user request */}
                {/* 
                {segments > 1 && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        ...
                    </div>
                )}
                */}
                <div style={{ flex: 1 }} /> {/* Spacer to keep buttons apart */}


                {/* Next Button */}
                {showNext ? (
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={disableNext}
                        style={{
                            background: disableNext ? '#27272a' : '#f97316', // Orange
                            color: disableNext ? '#71717a' : 'white',
                            border: 'none',
                            padding: '0.8rem 2rem',
                            borderRadius: '12px',
                            cursor: disableNext ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: disableNext ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.2)'
                        }}
                    >
                        {nextLabel}
                    </button>
                ) : <div />}
            </div>
        </div>
    );
}
