"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function SectionHeader({ title, description, id, videoUrl, topicId }) {
    const router = useRouter();
    const isReviewTest = title && title.includes('Review Test');

    return (
        <div id={id} style={{ padding: '1rem 0' }}>
            {/* Note: Removed borders and margins to fit inside StepContainer seamlessly if needed, 
                 but we will use StepContainer's title prop for the main title. 
                 Wait, SectionHeader IS the step. So StepContainer's title should be this title.
                 So this component might just render the description and buttons?
             */}

            {/* If we use StepContainer, the title goes in the header. 
                So here we just render the description and extra controls. */}

            {/* However, for backward compatibility or direct usage, we might want to keep it.
                But since we are refactoring for Focus Mode, let's make this component focused on the *Body* content.
            */}

            {/* Actually, if we use StepContainer, we pass `title` to it. 
                So here we should render:
                - Description
                - Video Link
                - "Start Test" button (if review test)
            */}

            {isReviewTest && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => router.push(`/?topic=${topicId}&section=review-test`)}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Start Test →
                    </button>
                </div>
            )}

            {videoUrl && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#FF0000',
                            color: 'white',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                        }}
                    >
                        <span>▶</span> Watch Video
                    </a>
                </div>
            )}

            {description && (
                <p style={{
                    color: '#a1a1aa', // Zinc-400 for dark mode compatibility 
                    fontSize: '1.1rem',
                    marginTop: '0.5rem',
                    lineHeight: '1.6'
                }}>
                    {description}
                </p>
            )}
        </div>
    );
}
