import React from 'react';
import BarModelDiagram from './BarModelDiagram';

export default function ExampleCard({ title, description, steps, image, barModel, barModelData, contentStyle = {}, textColor = 'var(--text-secondary)', titleColor = 'var(--text-primary)', showTitle = true }) {
    return (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '5px solid var(--primary)', ...contentStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                {showTitle && <h4 style={{ marginTop: 0, fontSize: '1.3rem', fontWeight: 700, color: titleColor }}>{title}</h4>}
                {barModel && (
                    <span style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        textTransform: 'uppercase'
                    }}>
                        Bar Model
                    </span>
                )}
            </div>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.25rem', lineHeight: '1.6', color: '#f97316', fontWeight: 500 }}>{description}</p>

            {/* Visuals */}
            {(image || barModelData) && (
                <div style={{ background: image ? '#FFFFFF' : '#2A2A2A', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                    {image && <img src={image} alt="Example Diagram" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px' }} />}
                    {barModelData && <BarModelDiagram type={barModelData.type} data={barModelData} />}
                </div>
            )}

            <div>
                {steps.map((step, i) => (
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
                        <span style={{ color: titleColor, lineHeight: '1.6' }}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
