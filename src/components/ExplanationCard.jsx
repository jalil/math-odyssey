"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext'; // Assuming context is available

export default function ExplanationCard({ title, children, sections, topicId }) { // Added topicId prop
    const { user } = useUser();
    const router = useRouter();

    const handleLinkClick = (text, targetId) => {
        if (user && user.name === 'admin' && targetId) {
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
                    color: '#e4e4e7', // Zinc-200 for dark mode
                    fontSize: '1.05rem',
                    marginBottom: sections ? '2rem' : 0
                }}>
                    {children}
                </div>
            )}

            {sections && (
                <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {sections.map((section, idx) => (
                        <div key={idx} style={{
                            background: '#18181b', // Zinc-950/Black for contrast in dark card
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #3f3f46' // Zinc-700
                        }}>
                            {section.title && (
                                <h4 style={{
                                    margin: '0 0 0.8rem 0',
                                    color: '#f97316', // Orange-500
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    {section.icon && <span>{section.icon}</span>}
                                    {section.title}
                                </h4>
                            )}
                            {section.items ? (
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#d4d4d8' }}>
                                    {section.items.map((item, i) => {
                                        const isObject = typeof item === 'object';
                                        const text = isObject ? (item.text || item) : item;
                                        const image = isObject ? item.image : null;
                                        const targetId = isObject ? item.targetId : null;
                                        const isAdmin = user && user.name === 'admin';
                                        const isClickable = isAdmin && targetId;

                                        return (
                                            <li key={i} style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>
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
                                                            borderRadius: '8px',
                                                            border: '1px solid #3f3f46',
                                                            marginTop: '0.5rem',
                                                            display: 'block'
                                                        }}
                                                    />
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p style={{ margin: 0, lineHeight: '1.6', color: '#d4d4d8' }}>{section.text}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
