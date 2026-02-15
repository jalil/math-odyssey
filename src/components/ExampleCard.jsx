import GeometryVisual from './GeometryVisual';
import ProblemVisualizer from './ProblemVisualizer';

export default function ExampleCard({
    title,
    description,
    detailedDescription,
    steps,
    detailedSteps,
    image,
    barModel,
    barModelData,
    contentStyle = {},
    textColor = 'text-slate-600',
    titleColor = 'text-slate-800',
    showTitle = true,
    visual
}) {

    const currentSteps = detailedSteps || steps;

    // Step colors cycle for visual variety
    const STEP_COLORS = [
        { bg: '#EEF0FF', border: '#667eea', text: '#4338ca', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
        { bg: '#FFF0F5', border: '#f5576c', text: '#e11d48', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
        { bg: '#F0F9FF', border: '#4facfe', text: '#0284c7', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
        { bg: '#F0FFF4', border: '#43e97b', text: '#059669', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
        { bg: '#FFF8F0', border: '#fccb90', text: '#d97706', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
        { bg: '#F8F0FF', border: '#a18cd1', text: '#7c3aed', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
    ];

    return (
        <div className="animate-slide-in-up" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '0',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            maxWidth: '800px',
            margin: '0 auto 2rem auto',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102,126,234,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}>
            {/* Top gradient accent bar — animated shimmer */}
            <div className="gradient-shimmer" style={{
                height: '6px',
                background: 'linear-gradient(90deg, #667eea, #764ba2, #f5576c, #4facfe, #43e97b, #667eea)',
                backgroundSize: '200% 200%',
                width: '100%',
            }} />

            <div style={{ padding: '2rem 2rem 2.5rem' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    {showTitle && (
                        <h4 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: '#1e293b',
                            margin: 0,
                            lineHeight: 1.3,
                        }}>
                            {title}
                        </h4>
                    )}

                    {(detailedDescription || detailedSteps) && (
                        <span className="badge-glow" style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '5px 14px',
                            borderRadius: '20px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            marginLeft: '1rem',
                        }}>
                            ✨ Deep Dive
                        </span>
                    )}
                </div>

                {/* Test Question Style Callout */}
                <div className="test-question-card" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '2px solid #e2e8f0', // Neutral border
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Subtle shadow
                    position: 'relative',
                }}>
                    {/* Question label */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '0.75rem',
                    }}>
                        <div style={{
                            fontSize: '1.2rem',
                        }}>
                            ❓
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Test Question
                        </div>
                    </div>

                    <p style={{
                        fontSize: '1.25rem', // Slightly larger for readability
                        lineHeight: 1.6,
                        color: '#1e293b', // Darker text for contrast
                        fontWeight: 500, // Medium weight
                        margin: 0,
                        whiteSpace: 'pre-line',
                        fontFamily: '"Inter", sans-serif', // Ensure clean font
                    }}>
                        {(() => {
                            // Helper to box the '?' if it stands alone (variable)
                            const parts = description.split(/(\s\?\s|\s\?$|^\?\s)/g);
                            return parts.map((part, i) => {
                                if (part.trim() === '?') {
                                    return (
                                        <span key={i} style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            border: '2px solid #667eea',
                                            borderRadius: '6px',
                                            color: '#667eea',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem',
                                            margin: '0 4px',
                                            verticalAlign: 'middle',
                                            background: '#F0F4FF'
                                        }}>
                                            ?
                                        </span>
                                    );
                                }
                                return part;
                            });
                        })()}
                    </p>
                </div>

                {/* Breakdown Section (New) */}
                {detailedDescription && (
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: '1px dashed #cbd5e1',
                        borderLeft: '5px solid #10B981', // Emerald for breakdown
                    }}>
                        <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: '#10B981',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '0.5rem',
                            display: 'inline-block',
                        }}>
                            🔍 Breakdown
                        </div>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            color: '#475569',
                            margin: 0,
                            whiteSpace: 'pre-line',
                        }}>
                            {detailedDescription}
                        </p>
                    </div>
                )}

                {/* New Dynamic Visualizer */}
                {visual && <ProblemVisualizer visual={visual} />}

                {/* Auto-generated Geometry Diagram */}
                <GeometryVisual description={description} title={title} />

                {/* Visuals */}
                {(image || barModelData) && (
                    <div style={{
                        background: '#FAFBFF',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        marginBottom: '2rem',
                        textAlign: 'center',
                    }}>
                        {image && (
                            <img
                                src={image}
                                alt="Example Diagram"
                                style={{
                                    maxWidth: '80%',
                                    maxHeight: '240px',
                                    margin: '0 auto',
                                    objectFit: 'contain',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                            />
                        )}
                        {barModelData && <BarModelDiagram type={barModelData.type} data={barModelData} />}
                    </div>
                )}

                {/* Solution Steps */}
                {currentSteps && currentSteps.length > 0 && (
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '1rem',
                        }}>
                            🧩 Solution Steps
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {currentSteps.map((step, i) => {
                                const color = STEP_COLORS[i % STEP_COLORS.length];
                                return (
                                    <div
                                        key={i}
                                        className="step-reveal"
                                        style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            alignItems: 'flex-start',
                                            padding: '1rem 1.2rem',
                                            background: color.bg,
                                            borderRadius: '14px',
                                            border: `1.5px solid ${color.border}22`,
                                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'default',
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateX(6px) scale(1.01)';
                                            e.currentTarget.style.borderColor = color.border;
                                            e.currentTarget.style.boxShadow = `0 6px 20px ${color.border}33`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateX(0) scale(1)';
                                            e.currentTarget.style.borderColor = `${color.border}22`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Step Number Circle — bounces in */}
                                        <div className="circle-bounce" style={{
                                            flexShrink: 0,
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: color.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            boxShadow: `0 3px 10px ${color.border}44`,
                                            animationDelay: `${i * 0.1 + 0.15}s`,
                                        }}>
                                            {i + 1}
                                        </div>

                                        {/* Step Text */}
                                        <span style={{
                                            color: '#334155',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            lineHeight: 1.6,
                                            paddingTop: '3px',
                                        }}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

