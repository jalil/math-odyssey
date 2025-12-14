"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import topics from '../data/topics.json';
import { useRouter } from 'next/navigation';

export default function SidebarSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const results = useMemo(() => {
        if (!query || query.length < 2) return [];

        const searchResults = [];
        const lowerQuery = query.toLowerCase();

        topics.forEach(topic => {
            // Check Topic Title
            if (topic.title.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'Topic',
                    title: topic.title,
                    link: `/?topic=${topic.id}`,
                    match: 'Title'
                });
            }

            // Check Sections
            topic.sections.forEach((section, idx) => {
                // We fallback to ID or index for anchor if ID is missing (though most have it or we use index in page logic)
                // In page.jsx we use section.id for 'section-header' and 'explanation'.
                // 'example' and 'quiz' generate IDs dynamically or don't have permanent anchors yet.
                // We'll aim for section headers primarily or just link to the topic.

                const sectionAnchor = section.id ? `#${section.id}` : '';
                const link = `/?topic=${topic.id}${sectionAnchor}`;

                if (section.title && section.title.toLowerCase().includes(lowerQuery)) {
                    searchResults.push({
                        type: section.type === 'section-header' ? 'Section' : 'Example',
                        title: section.title,
                        subtitle: topic.title,
                        link: link,
                        match: 'Content'
                    });
                } else if (section.description && section.description.toLowerCase().includes(lowerQuery)) {
                    searchResults.push({
                        type: 'Content',
                        title: section.title || `Item in ${topic.title}`,
                        subtitle: 'Matches description',
                        link: link,
                        match: 'Description'
                    });
                }
            });
        });

        return searchResults.slice(0, 10); // Limit results
    }, [query]);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search topics..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{
                        width: '100%',
                        padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                        borderRadius: '8px',
                        border: '2px solid #BFDBFE',
                        background: '#EFF6FF',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                    {results.map((res, i) => (
                        <Link
                            key={i}
                            href={res.link}
                            onClick={handleSelect}
                            style={{
                                display: 'block',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                marginBottom: '2px',
                                transition: 'background 0.2s',
                            }}
                            className="search-result-item" // We'll add a hover effect in global css if needed, or inline style logic via class
                        >
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{res.title}</div>
                            {res.subtitle && <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{res.subtitle}</div>}
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '2px', textTransform: 'uppercase' }}>{res.type}</div>
                        </Link>
                    ))}
                </div>
            )}

            {isOpen && query.length > 2 && results.length === 0 && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    marginTop: '0.5rem',
                    padding: '1rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    No matches found
                </div>
            )}

            {/* Overlay to close when clicking outside could be added, but relying on Link click or blur for simple MVP */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 90,
                        cursor: 'default'
                    }}
                />
            )}
        </div>
    );
}
