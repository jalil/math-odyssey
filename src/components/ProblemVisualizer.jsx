"use client";
import React, { useEffect, useState } from 'react';

/**
 * ProblemVisualizer
 * Renders dynamic SVG visualizations for specific word problem types.
 *
 * Types:
 * - 'work-rate': Tank with pipes (filling/draining)
 * - 'speed': Track with runners/cars along a distance line
 * - 'probability': Jar with colored marbles
 * - 'volume': Box filled with cubes
 */

const LABEL_STYLE = {
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'system-ui, sans-serif',
    fill: '#475569'
};

// ─── WORK RATE VISUAL (Tank) ───────────────────────────────

function WorkRateVisual({ data }) {
    // data: { pipes: [{ label: 'M', rate: '1/36', type: 'fill' }, ...], target: 'Full', time: '15.75' }
    const [level, setLevel] = useState(0);

    useEffect(() => {
        // Simple animation to fill the tank
        const timer = setTimeout(() => setLevel(80), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <svg viewBox="0 0 300 200" width="100%" style={{ maxHeight: '200px' }}>
            <defs>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
                </linearGradient>
            </defs>

            {/* Tank Outline */}
            <rect x="100" y="50" width="100" height="120" rx="4" fill="none" stroke="#334155" strokeWidth="3" />

            {/* Water Level (Animated) */}
            <rect
                x="103"
                y={167 - (level * 1.14)}
                width="94"
                height={level * 1.14}
                fill="url(#waterGrad)"
                style={{ transition: 'all 2s ease-in-out' }}
            />

            {/* Pipes */}
            {data.pipes?.map((pipe, i) => {
                const isLeft = i % 2 === 0;
                const xPos = isLeft ? 60 : 200;
                const yPos = 60 + (i * 30);

                return (
                    <g key={i}>
                        {/* Pipe Body */}
                        <path
                            d={isLeft ? `M ${xPos} ${yPos} L 100 ${yPos}` : `M ${xPos} ${yPos} L 200 ${yPos}`}
                            stroke="#94A3B8"
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* Faucet Head / Label */}
                        <circle cx={xPos} cy={yPos} r="12" fill="white" stroke="#64748B" strokeWidth="2" />
                        <text x={xPos} y={yPos + 4} textAnchor="middle" style={LABEL_STYLE}>{pipe.label}</text>
                        {/* Flow direction arrow */}
                        <text x={isLeft ? 85 : 215} y={yPos + 4} textAnchor="middle" style={{ ...LABEL_STYLE, fontSize: '10px' }}>
                            {pipe.type === 'drain' ? (isLeft ? '←' : '→') : (isLeft ? '→' : '←')}
                        </text>
                    </g>
                );
            })}

            {/* Combined Label */}
            <text x="150" y="190" textAnchor="middle" style={LABEL_STYLE}>
                Combined Rate: {data.combined || '?'}
            </text>
        </svg>
    );
}

// ─── SPEED VISUAL (Track) ──────────────────────────────────

function SpeedVisual({ data }) {
    // data: { runners: [{ label: 'Sis', pos: 30, speed: '1 m/s' }, { label: 'Bro', pos: 0, speed: '3 m/s' }], gap: '1800m' }

    return (
        <svg viewBox="0 0 350 120" width="100%" style={{ maxHeight: '120px' }}>
            {/* Track Line */}
            <line x1="20" y1="80" x2="330" y2="80" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />

            {/* Markers */}
            <line x1="20" y1="70" x2="20" y2="90" stroke="#94A3B8" strokeWidth="2" />
            <line x1="330" y1="70" x2="330" y2="90" stroke="#94A3B8" strokeWidth="2" />

            {/* Gap Bracket */}
            <path d="M 20 50 L 20 40 L 150 40 L 150 50" fill="none" stroke="#64748B" strokeWidth="1.5" />
            <text x="85" y="32" textAnchor="middle" style={{ ...LABEL_STYLE, fill: '#64748B', fontSize: '11px' }}>
                Gap: {data.gap}
            </text>

            {/* Runners */}
            {data.runners?.map((runner, i) => {
                // Determine X visual position based on 'pos' percentage (0-100)
                // If pos is not percent, assume Sis is ahead (e.g. at 40%) and Bro at start (5%)
                const x = 20 + (runner.pos || 0) * 3;
                const color = i === 0 ? '#EC4899' : '#3B82F6';

                return (
                    <g key={i}>
                        <circle cx={x} cy="80" r="8" fill={color} stroke="white" strokeWidth="2" />
                        <text x={x} y="105" textAnchor="middle" style={{ ...LABEL_STYLE, fill: color }}>
                            {runner.label}
                        </text>
                        <text x={x} y="118" textAnchor="middle" style={{ ...LABEL_STYLE, fontSize: '10px', fontWeight: '400' }}>
                            {runner.speed}
                        </text>
                        {/* Speed Vector */}
                        <line x1={x + 10} y1="80" x2={x + 25} y2="80" stroke={color} strokeWidth="2" markerEnd="url(#arrow)" />
                    </g>
                );
            })}
            <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#64748B" />
                </marker>
            </defs>
        </svg>
    );
}

// ─── PROBABILITY VISUAL (Marbles) ──────────────────────────

function ProbabilityVisual({ data }) {
    // data: { items: [{ color: '#EF4444', count: 5 }, { color: '#3B82F6', count: 3 }] }

    // Flatten marble list
    const marbles = [];
    data.items?.forEach(group => {
        for (let i = 0; i < group.count; i++) marbles.push(group.color);
    });

    // Randomize initial positions (pseudo-random based on index to be stable)
    // or just grid pack them in a "Jar"

    return (
        <svg viewBox="0 0 200 220" width="100%" style={{ maxHeight: '200px', maxWidth: '200px' }}>
            {/* Jar */}
            <path
                d="M 50 10 L 50 180 Q 50 210 100 210 Q 150 210 150 180 L 150 10"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="4"
            />
            {/* Lid rim */}
            <rect x="45" y="5" width="110" height="10" rx="2" fill="#CBD5E1" />

            {/* Marbles */}
            <g transform="translate(60, 180)">
                {marbles.map((color, i) => {
                    // Simple packing algorithm
                    const row = Math.floor(i / 3);
                    const col = i % 3;
                    const x = col * 30 + (row % 2 === 0 ? 0 : 15);
                    const y = - (row * 28);

                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="12"
                            fill={color}
                            stroke="white"
                            strokeWidth="1.5"
                            style={{ opacity: 0.9 }}
                        >
                            <animate
                                attributeName="cy"
                                from={y - 200}
                                to={y}
                                dur={`${0.5 + Math.random() * 0.5}s`}
                                fill="freeze"
                                calcMode="spline"
                                keySplines="0.4 0 0.2 1"
                            />
                        </circle>
                    );
                })}
            </g>
        </svg>
    );
}

// ─── VOLUME VISUAL (Cubes) ─────────────────────────────────

function VolumeVisual({ data }) {
    // data: { l: 5, w: 3, h: 2 } (Counts of cubes)
    const { l, w, h } = data;
    const size = 20; // Cube visual size

    // Isometric projection helpers
    const project = (x, y, z) => ({
        x: (x - y) * size * 0.866 + 150,
        y: (x + y) * size * 0.5 - z * size + 100
    });

    const cubes = [];
    for (let z = 0; z < h; z++) {
        for (let y = 0; y < w; y++) {
            for (let x = 0; x < l; x++) {
                cubes.push({ x, y, z });
            }
        }
    }

    // Sort painters algorithm (back to front)
    cubes.sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z));

    // Draw a single cube face
    const drawCube = (x, y, z) => {
        const center = project(x, y, z);
        const w1 = size * 0.866;
        const h1 = size * 0.5;

        // Points
        const top = { x: center.x, y: center.y - size };
        const bot = { x: center.x, y: center.y + size }; // Not really needed for top-down view
        // ... simplified SVG path for a cube

        // M center
        // L +w -h (Top Right)
        // L 0 -2h (Top Top)
        // L -w -h (Top Left)
        // Z

        return (
            <g key={`${x}-${y}-${z}`}>
                {/* Top Face */}
                <path
                    d={`M ${center.x} ${center.y - size} l ${w1} ${-h1} l ${-w1} ${-h1} l ${-w1} ${h1} z`}
                    fill="#A5B4FC" stroke="#6366F1" strokeWidth="1"
                />
                {/* Right Face */}
                <path
                    d={`M ${center.x} ${center.y - size} l ${w1} ${-h1} v ${size} l ${-w1} ${h1} z`}
                    fill="#818CF8" stroke="#6366F1" strokeWidth="1"
                />
                {/* Left Face */}
                <path
                    d={`M ${center.x} ${center.y - size} l ${-w1} ${-h1} v ${size} l ${w1} ${h1} z`}
                    fill="#6366F1" stroke="#4338CA" strokeWidth="1"
                />
            </g>
        );
    };

    return (
        <svg viewBox="0 0 300 250" width="100%" style={{ maxHeight: '250px' }}>
            {cubes.map(c => drawCube(c.x, c.y, c.z))}
            <text x="150" y="240" textAnchor="middle" style={LABEL_STYLE}>
                {l} x {w} x {h} = {l * w * h} Cubes
            </text>
        </svg>
    );
}

// ─── EXPORT ────────────────────────────────────────────────

export default function ProblemVisualizer({ visual }) {
    if (!visual || !visual.type) return null;

    let content = null;
    switch (visual.type) {
        case 'work-rate':
            content = <WorkRateVisual data={visual.data} />;
            break;
        case 'speed':
            content = <SpeedVisual data={visual.data} />;
            break;
        case 'probability':
            content = <ProbabilityVisual data={visual.data} />;
            break;
        case 'volume':
            content = <VolumeVisual data={visual.data} />;
            break;
        default:
            return null;
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '2px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <div style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '-0.5rem',
            }}>
                👁️ Visualizer
            </div>
            {content}
        </div>
    );
}
