import React, { useState, useEffect } from 'react';
import BarModelDiagram from '../BarModelDiagram';

const MagicSlider = ({
    scenario = { items: [{ label: 'Tom', ratio: 3 }, { label: 'Jerry', ratio: 4 }] },
    initialTotal = 35,
    min = 7,
    max = 70,
    step = 7,
    description, // New prop
    onComplete
}) => {
    const [currentTotal, setCurrentTotal] = useState(initialTotal);

    // Calculate derived values
    const totalRatioUnits = scenario.items.reduce((acc, item) => acc + item.ratio, 0);
    const unitValue = currentTotal / totalRatioUnits;

    const barModelData = {
        type: 'ratio',
        items: scenario.items.map(item => ({
            label: item.label,
            value: item.ratio, // The visual blocks remain constant (ratio)
            valueText: Math.round(item.ratio * unitValue) // The textual value updates
        })),
        totalLabel: currentTotal.toString()
    };

    // Auto-complete if they interact (simple version)
    const handleChange = (e) => {
        setCurrentTotal(parseInt(e.target.value));
        if (onComplete) onComplete();
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
            margin: '0 auto'
        }}>
            <h3 style={{
                margin: '0 0 1rem 0',
                color: '#fff',
                fontSize: '1.4rem',
                textAlign: 'center'
            }}>
                <span role="img" aria-label="magic">✨</span> Magic Slider: Change the Total
            </h3>

            {/* Problem Context */}
            {description && (
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    color: '#e4e4e7',
                    fontSize: '1.1rem',
                    lineHeight: '1.5'
                }}>
                    {description}
                </div>
            )}

            {/* Slider Control */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={currentTotal}
                    onChange={handleChange}
                    style={{
                        width: '80%',
                        accentColor: '#f97316',
                        cursor: 'pointer',
                        height: '8px',
                        borderRadius: '4px'
                    }}
                />
                <div style={{
                    marginTop: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#f97316'
                }}>
                    Total Marbles: {currentTotal}
                </div>
            </div>

            {/* Dynamic Explanation */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#a1a1aa' }}>
                    Total Ratio Units: <strong>{totalRatioUnits}</strong> (Constant)
                </p>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>
                    1 Unit Value = <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{unitValue.toFixed(0)}</span> marbles
                </p>
            </div>

            {/* Visualizer */}
            <div style={{ padding: '1rem', background: '#27272a', borderRadius: '8px' }}>
                <BarModelDiagram type="ratio" data={barModelData} />

                {/* Custom Legend for values since BarModel 'ratio' type draws blocks but doesn't always show custom text well without mod. 
                    Let's add a clear value breakdown below. */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: '1.5rem',
                    borderTop: '1px solid #3f3f46',
                    paddingTop: '1rem'
                }}>
                    {scenario.items.map((item, idx) => (
                        <div key={idx} style={{ textAlign: 'center' }}>
                            <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{item.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                {Math.round(item.ratio * unitValue)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#52525b' }}>
                                ({item.ratio} units × {unitValue})
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MagicSlider;
