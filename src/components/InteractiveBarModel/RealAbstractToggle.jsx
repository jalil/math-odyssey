import React, { useState } from 'react';
import BarModelDiagram from '../BarModelDiagram';
import { Eye, Box } from 'lucide-react';

const RealAbstractToggle = ({
    itemLabel = "Apples",
    value = 5,
    icon = "🍎",
    onComplete
}) => {
    const [viewMode, setViewMode] = useState('real'); // 'real' or 'abstract'

    const handleToggle = (mode) => {
        setViewMode(mode);
        if (mode === 'abstract' && onComplete) {
            onComplete();
        }
    };

    const barModelData = {
        type: 'part-whole',
        items: [{ label: itemLabel, value: value, valueText: value.toString() }],
        totalLabel: value.toString()
    };

    return (
        <div style={{
            background: 'linear-gradient(145deg, #1e1e24, #25252b)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid #3f3f46',
            color: 'white',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
        }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>
                <span role="img" aria-label="magic">🔮</span> Magic Lens: Real vs Abstract
            </h3>

            {/* Viewport */}
            <div style={{
                background: '#27272a',
                borderRadius: '12px',
                padding: '2rem',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.5s ease'
            }}>
                {viewMode === 'real' ? (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        {Array.from({ length: value }).map((_, i) => (
                            <span key={i} style={{
                                fontSize: '3rem',
                                animation: `popIn 0.3s ease ${i * 0.1}s backwards`
                            }}>
                                {icon}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div style={{ width: '100%', animation: 'fadeIn 0.5s ease' }}>
                        <BarModelDiagram type="part-whole" data={barModelData} />
                    </div>
                )}
            </div>

            {/* Toggle Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                background: '#3f3f46',
                padding: '0.5rem',
                borderRadius: 'full',
                width: 'fit-content',
                margin: '0 auto'
            }}>
                <button
                    onClick={() => handleToggle('real')}
                    style={{
                        background: viewMode === 'real' ? '#f97316' : 'transparent',
                        color: viewMode === 'real' ? 'white' : '#a1a1aa',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Eye size={18} /> Real Objects
                </button>
                <button
                    onClick={() => handleToggle('abstract')}
                    style={{
                        background: viewMode === 'abstract' ? '#3b82f6' : 'transparent',
                        color: viewMode === 'abstract' ? 'white' : '#a1a1aa',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Box size={18} /> Bar Model
                </button>
            </div>

            <p style={{ marginTop: '1.5rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                {viewMode === 'real'
                    ? "This is what we see in the real world."
                    : "The bar represents the entire group of objects."}
            </p>

            <style jsx>{`
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default RealAbstractToggle;
