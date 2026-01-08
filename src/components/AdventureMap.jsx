import React from 'react';
import Link from 'next/link';

const nodes = [
    { id: 'singapore-p3', label: 'Beginner Village (P3)', icon: '🏠', x: 15, y: 90, color: '#4ADE80' },
    { id: 'singapore-p4', label: 'Factor Forest (P4)', icon: '🌲', x: 45, y: 80, color: '#22C55E' },
    { id: 'bar-model-level-1', label: 'Logic Bridge (Foundation)', icon: '🌉', x: 75, y: 70, color: '#F59E0B' },
    { id: 'bar-model-level-2', label: 'Ratio Ridge (Intermediate)', icon: '⚖️', x: 80, y: 50, color: '#F97316' },
    { id: 'bar-model-level-3', label: 'Complexity Canyon (Advanced)', icon: '🏜️', x: 55, y: 40, color: '#EF4444' },
    { id: 'singapore-p5', label: 'Fraction Fortress (P5)', icon: '🏰', x: 30, y: 30, color: '#6366F1' },
    { id: 'singapore-p6', label: 'Mt. Mastery (P6)', icon: '🏔️', x: 20, y: 15, color: '#EC4899' },
    { id: 'hiroo', label: "Dragon's Peak (Exam Prep)", icon: '🐉', x: 60, y: 10, color: '#EF4444', isBoss: true },
];

export default function AdventureMap({ locks = {} }) {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '600px', // Fixed height for scrolling map feeling
            background: 'url(/images/fantasy_map_bg.png) no-repeat center center / cover',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
            border: '4px solid #334155'
        }}>
            {/* Background elements - Removed as we have a rich map image now */}

            {/* SVG Paths */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <path
                    d={nodes.map((n, i) => {
                        if (i === 0) return `M ${n.x}% ${n.y}%`;
                        return `L ${n.x}% ${n.y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="10,10"
                    strokeOpacity="0.3"
                />
            </svg>

            {/* Nodes */}
            {nodes.map((node, index) => {
                const isLocked = locks && locks[node.id];
                // Locked style overrides
                const displayIcon = isLocked ? '🔒' : node.icon;
                const displayColor = isLocked ? '#475569' : node.color; // Grey if locked

                const content = (
                    <div className="map-node" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.3s',
                        opacity: isLocked ? 0.8 : 1
                    }}>
                        <div style={{
                            width: node.isBoss ? '80px' : '64px',
                            height: node.isBoss ? '80px' : '64px',
                            borderRadius: '50%',
                            background: displayColor,
                            border: '4px solid white', // Keep white border for contrast
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: node.isBoss ? '3rem' : '2rem',
                            boxShadow: isLocked ? 'none' : `0 0 20px ${displayColor}80`,
                            position: 'relative',
                            filter: isLocked ? 'grayscale(100%)' : 'none'
                        }}>
                            {displayIcon}
                            {/* Pulse effect only if NOT locked */}
                            {!isLocked && (
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    border: `2px solid ${displayColor}`,
                                    animation: 'pulse 2s infinite',
                                    opacity: 0.5
                                }} />
                            )}
                        </div>
                        <div style={{
                            marginTop: '0.75rem',
                            background: 'rgba(0,0,0,0.8)',
                            color: isLocked ? '#94a3b8' : 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem',
                            border: `1px solid ${displayColor}`,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}>
                            {node.label}
                        </div>
                    </div>
                );

                if (isLocked) {
                    return (
                        <div
                            key={node.id}
                            style={{
                                position: 'absolute',
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10
                            }}
                        >
                            {content}
                        </div>
                    );
                }

                return (
                    <Link
                        key={node.id}
                        href={`/?topic=${node.id}`}
                        style={{
                            position: 'absolute',
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10
                        }}
                    >
                        {content}
                    </Link>
                );
            })}

            <style jsx>{`
                .map-node:hover {
                    transform: scale(1.1) translateY(-5px);
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
