"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext'; // Assuming context is available

export default function ExplanationCard({ title, children, sections, topicId }) { // Added topicId prop
    const { user } = useUser();
    const router = useRouter();

    const handleLinkClick = (text, targetId) => {
        if (targetId) {
            // If we have topicId passed, use it, otherwise we might rely on the context URL, 
            // but ExplanationCard doesn't always know the topic.
            // We can assume it's the current topic? 
            // Best to pass topicId.
            if (topicId) {
                router.push(`/?topic=${topicId}&section=${targetId}`);
            } else {
                console.warn("Topic ID missing for quick navigation");
            }
        }
    };

    return (
        <div style={{ padding: '0.5rem 0' }}>
            {/* Title is handled by StepContainer usually */}

            {/* If there is content (children) */}
            {children && (
                <div style={{
                    lineHeight: '1.7',
                    whiteSpace: 'pre-line',
                    color: '#64748b', // Updated to slate-500 from zinc-200 for light theme
                    fontSize: '1.1rem', // Slightly larger
                    marginBottom: sections ? '2rem' : 0,
                    textAlign: 'center', // CENTERED
                    maxWidth: '800px',
                    margin: '0 auto 2rem auto'
                }}>
                    {children}
                </div>
            )}

            {sections && (
                <div style={{
                    display: 'grid',
                    gap: '1.5rem',
                    marginTop: '1.5rem',
                    maxWidth: '800px', // Limit width
                    margin: '0 auto' // Center container
                }}>
                    {sections.map((section, idx) => (
                        <div key={idx} style={{
                            background: '#1e293b', // Slate-800 for contrast (Dark card)
                            padding: '2rem',
                            borderRadius: '24px', // Rounded-2xl
                            border: '1px solid #334155', // Slate-700
                            textAlign: 'left', // Keep internal text left-aligned for readability? Or User wants centered?
                            // Let's keep it left for list items but maybe center the title?
                            // User said "content should be centered". 
                            // If I center the container, that helps. 
                            // Let's try centering the title inside the card but keeping list left.
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                            {section.title && (
                                <h4 style={{
                                    margin: '0 0 1rem 0',
                                    color: '#f97316', // Orange-500
                                    fontSize: '1.2rem',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    {section.icon && <span style={{ fontSize: '1.5rem' }}>{section.icon}</span>}
                                    {section.title}
                                </h4>
                            )}
                            {section.items ? (
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1' }}>
                                    {section.items.map((item, i) => {
                                        const isObject = typeof item === 'object';
                                        const text = isObject ? (item.text || item) : item;
                                        const image = isObject ? item.image : null;
                                        const targetId = isObject ? item.targetId : null;
                                        const isClickable = targetId;

                                        return (
                                            <li key={i} style={{ marginBottom: '0.8rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                                {isClickable ? (
                                                    <span
                                                        onClick={() => handleLinkClick(text, targetId)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: '#60A5FA', // Blue link color
                                                            textDecoration: 'underline',
                                                            textUnderlineOffset: '4px'
                                                        }}
                                                        title={`Go to ${targetId}`}
                                                    >
                                                        {text}
                                                    </span>
                                                ) : (
                                                    <span>{text}</span>
                                                )}

                                                {image && (
                                                    <img
                                                        src={image}
                                                        alt={text}
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '400px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #334155',
                                                            marginTop: '1rem',
                                                            display: 'block'
                                                        }}
                                                    />
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p style={{ margin: 0, lineHeight: '1.6', color: '#cbd5e1' }}>{section.text}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
