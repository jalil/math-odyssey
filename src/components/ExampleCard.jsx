import React from 'react';
import BarModelDiagram from './BarModelDiagram';

export default function ExampleCard({
    title,
    description,
    detailedDescription, // New Prop
    steps,
    detailedSteps, // New Prop
    image,
    barModel,
    barModelData,
    contentStyle = {},
    textColor = 'var(--text-secondary)',
    titleColor = 'var(--text-primary)',
    showTitle = true
}) {
    // Always defaults to detailed content if available (Quick tab removed)
    const currentDescription = detailedDescription || description;
    const currentSteps = detailedSteps || steps;

    return (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '5px solid var(--primary)', ...contentStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                {showTitle && <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: titleColor }}>{title}</h4>}

                {(detailedDescription || detailedSteps) && (
                    <div style={{
                        background: '#f97316',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        Explain
                    </div>
                )}
            </div>

            <p style={{ marginBottom: '1.5rem', fontSize: '1.25rem', lineHeight: '1.6', color: '#f97316', fontWeight: 500, whiteSpace: 'pre-line' }}>{currentDescription}</p>

            {/* Visuals */}
            {(image || barModelData) && (
                <div style={{ background: image ? '#FFFFFF' : '#2A2A2A', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                    {image && <img src={image} alt="Example Diagram" style={{ maxWidth: '50%', maxHeight: '180px', objectFit: 'contain', borderRadius: '4px' }} />}
                    {barModelData && <BarModelDiagram type={barModelData.type} data={barModelData} />}
                </div>
            )}

            <div>
                {currentSteps && currentSteps.map((step, i) => (
                    <div key={i} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                        <div style={{
                            background: 'var(--primary)',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            flexShrink: 0,
                            fontWeight: 'bold'
                        }}>
                            {i + 1}
                        </div>
                        <span style={{ color: titleColor, lineHeight: '1.6', whiteSpace: 'pre-line' }}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
