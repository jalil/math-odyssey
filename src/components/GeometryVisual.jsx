"use client";
import React from 'react';

/**
 * Auto-generates SVG diagrams for geometry-related problems.
 * Supports: cuboid, rectangle, square, triangle, circle,
 * isosceles triangle angles, vertically opposite angles,
 * angles on a line, and composite shapes.
 */

const LABEL = {
    fontSize: '13px',
    fontWeight: 700,
    fill: '#1e293b',
    fontFamily: 'system-ui, sans-serif',
};

const ANGLE_LABEL = {
    ...LABEL,
    fontSize: '14px',
    fill: '#dc2626',
    fontWeight: 800,
};

// ─── DETECTION ───────────────────────────────────────────────

function detectProblemType(text) {
    if (!text) return null;
    const lower = text.toLowerCase();

    // Isosceles triangle with angles
    if ((lower.includes('isosceles') || (lower.includes('ab') && lower.includes('ac'))) && lower.includes('angle')) {
        const angleMatch = lower.match(/angle\s*(?:a|[a-z])?\s*(?:is|=)\s*(\d+)/);
        if (angleMatch) {
            return { type: 'isosceles-angle', topAngle: parseFloat(angleMatch[1]) };
        }
    }

    // Vertically opposite angles
    if (lower.includes('vertically opposite') || (lower.includes('lines cross') && lower.includes('angle'))) {
        const angleMatch = lower.match(/(\d+)°/);
        if (angleMatch) {
            return { type: 'vertically-opposite', angle: parseFloat(angleMatch[1]) };
        }
    }

    // Angles on a straight line
    if (lower.includes('straight line') && lower.includes('angle')) {
        const angleMatch = lower.match(/(\d+)°/);
        if (angleMatch) {
            return { type: 'angles-on-line', knownAngle: parseFloat(angleMatch[1]) };
        }
    }

    // Composite shape: square + rectangle
    if (lower.includes('composite') || (lower.includes('square') && lower.includes('rectangle') && lower.includes('joined'))) {
        const squareMatch = lower.match(/(\d+)x(\d+)\s*square/);
        const rectMatch = lower.match(/(\d+)x(\d+)\s*rectangle/);
        if (squareMatch && rectMatch) {
            return {
                type: 'composite',
                square: { w: parseFloat(squareMatch[1]), h: parseFloat(squareMatch[2]) },
                rect: { w: parseFloat(rectMatch[1]), h: parseFloat(rectMatch[2]) },
            };
        }
    }

    // Cuboid: AxBxC
    const cuboidMatch = lower.match(/(\d+\.?\d*)\s*(?:cm|m|mm)?\s*x\s*(\d+\.?\d*)\s*(?:cm|m|mm)?\s*x\s*(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (cuboidMatch && (lower.includes('volume') || lower.includes('cuboid') || lower.includes('tank') || lower.includes('box') || lower.includes('container'))) {
        return { type: 'cuboid', l: parseFloat(cuboidMatch[1]), w: parseFloat(cuboidMatch[2]), h: parseFloat(cuboidMatch[3]) };
    }

    // Rectangle: AxB
    const rectMatch = lower.match(/(\d+\.?\d*)\s*(?:cm|m|mm)?\s*x\s*(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (rectMatch && !cuboidMatch) {
        return { type: 'rectangle', l: parseFloat(rectMatch[1]), w: parseFloat(rectMatch[2]) };
    }

    // "length Xcm and width Ycm"
    const lwMatch = lower.match(/length\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?.*?(?:width|breadth)\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (lwMatch) {
        return { type: 'rectangle', l: parseFloat(lwMatch[1]), w: parseFloat(lwMatch[2]) };
    }

    // Square: "side length Xcm"
    const squareMatch = lower.match(/(?:side\s*(?:length)?\s*(?:of\s*)?|sides\s*of\s*)(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (squareMatch && (lower.includes('square') || lower.includes('cube'))) {
        const s = parseFloat(squareMatch[1]);
        if (lower.includes('cube')) return { type: 'cuboid', l: s, w: s, h: s };
        return { type: 'square', s };
    }

    // Circle: "radius Xcm"
    const radiusMatch = lower.match(/radius\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (radiusMatch) return { type: 'circle', r: parseFloat(radiusMatch[1]) };

    // Circle: "diameter Xcm"
    const diaMatch = lower.match(/diameter\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (diaMatch) return { type: 'circle', r: parseFloat(diaMatch[1]) / 2 };

    // Triangle: "sides A, B, C"
    const triMatch = lower.match(/sides?\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?\s*,?\s*(\d+\.?\d*)\s*(?:cm|m|mm)?\s*,?\s*(?:and\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (triMatch && lower.includes('triangle')) {
        return { type: 'triangle', a: parseFloat(triMatch[1]), b: parseFloat(triMatch[2]), c: parseFloat(triMatch[3]) };
    }

    // Triangle: "base Xcm and height Ycm"
    const bhMatch = lower.match(/base\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?.*?height\s*(?:of\s*)?(\d+\.?\d*)\s*(?:cm|m|mm)?/);
    if (bhMatch) {
        return { type: 'triangle', base: parseFloat(bhMatch[1]), height: parseFloat(bhMatch[2]) };
    }

    // Perimeter keywords with dimensions
    if (lower.includes('perimeter') || lower.includes('area')) {
        if (rectMatch) return { type: 'rectangle', l: parseFloat(rectMatch[1]), w: parseFloat(rectMatch[2]) };
    }

    return null;
}

// ─── DIAGRAM COMPONENTS ──────────────────────────────────────

function CuboidDiagram({ l, w, h }) {
    const scale = Math.min(180 / Math.max(l, w, h), 25);
    const sl = l * scale, sw = w * scale * 0.5, sh = h * scale;
    const ox = 60, oy = 30 + sh;

    const frontTL = { x: ox, y: oy - sh };
    const frontTR = { x: ox + sl, y: oy - sh };
    const frontBR = { x: ox + sl, y: oy };
    const frontBL = { x: ox, y: oy };
    const topTL = { x: ox + sw * 0.7, y: oy - sh - sw * 0.7 };
    const topTR = { x: ox + sl + sw * 0.7, y: oy - sh - sw * 0.7 };
    const sideTR = { x: ox + sl + sw * 0.7, y: oy - sw * 0.7 };
    const viewW = ox + sl + sw * 0.7 + 80, viewH = oy + 50;

    return (
        <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" style={{ maxWidth: '400px', maxHeight: '250px' }}>
            {/* Back edges (dashed) */}
            <line x1={frontBL.x + sw * 0.7} y1={frontBL.y - sw * 0.7} x2={sideTR.x} y2={sideTR.y} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,3" />
            <line x1={frontBL.x + sw * 0.7} y1={frontBL.y - sw * 0.7} x2={topTL.x} y2={topTL.y} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,3" />
            <line x1={frontBL.x + sw * 0.7} y1={frontBL.y - sw * 0.7} x2={frontBL.x} y2={frontBL.y} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,3" />
            {/* Front face */}
            <polygon points={`${frontTL.x},${frontTL.y} ${frontTR.x},${frontTR.y} ${frontBR.x},${frontBR.y} ${frontBL.x},${frontBL.y}`} fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth="2.5" />
            {/* Top face */}
            <polygon points={`${frontTL.x},${frontTL.y} ${topTL.x},${topTL.y} ${topTR.x},${topTR.y} ${frontTR.x},${frontTR.y}`} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
            {/* Right side */}
            <polygon points={`${frontTR.x},${frontTR.y} ${topTR.x},${topTR.y} ${sideTR.x},${sideTR.y} ${frontBR.x},${frontBR.y}`} fill="rgba(99,102,241,0.05)" stroke="#6366f1" strokeWidth="2.5" />
            {/* Labels */}
            <text x={(frontBL.x + frontBR.x) / 2} y={frontBL.y + 22} textAnchor="middle" style={LABEL}>{l} cm</text>
            <line x1={frontBL.x} y1={frontBL.y + 6} x2={frontBR.x} y2={frontBR.y + 6} stroke="#6366f1" strokeWidth="1.5" />
            <text x={frontBL.x - 16} y={(frontBL.y + frontTL.y) / 2} textAnchor="middle" style={LABEL} transform={`rotate(-90, ${frontBL.x - 16}, ${(frontBL.y + frontTL.y) / 2})`}>{h} cm</text>
            <line x1={frontBL.x - 6} y1={frontBL.y} x2={frontTL.x - 6} y2={frontTL.y} stroke="#6366f1" strokeWidth="1.5" />
            <text x={(frontTR.x + topTR.x) / 2 + 12} y={(frontTR.y + topTR.y) / 2 - 6} textAnchor="middle" style={LABEL}>{w} cm</text>
        </svg>
    );
}

function RectangleDiagram({ l, w }) {
    const scale = Math.min(200 / Math.max(l, w), 30);
    const sl = l * scale, sw = w * scale;
    const ox = 60, oy = 30;

    return (
        <svg viewBox={`0 0 ${ox + sl + 80} ${oy + sw + 50}`} width="100%" style={{ maxWidth: '380px', maxHeight: '220px' }}>
            <rect x={ox} y={oy} width={sl} height={sw} rx="3" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="2.5" />
            <text x={ox + sl / 2} y={oy + sw + 25} textAnchor="middle" style={LABEL}>{l} cm</text>
            <line x1={ox} y1={oy + sw + 10} x2={ox + sl} y2={oy + sw + 10} stroke="#3b82f6" strokeWidth="1.5" />
            <text x={ox + sl + 20} y={oy + sw / 2 + 5} textAnchor="start" style={LABEL}>{w} cm</text>
            <line x1={ox + sl + 8} y1={oy} x2={ox + sl + 8} y2={oy + sw} stroke="#3b82f6" strokeWidth="1.5" />
            <polyline points={`${ox + 12},${oy} ${ox + 12},${oy + 12} ${ox},${oy + 12}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        </svg>
    );
}

function TriangleDiagram({ a, b, c, base, height }) {
    if (base && height) {
        const scale = Math.min(200 / Math.max(base, height), 25);
        const sb = base * scale, sh = height * scale;
        const ox = 80, oy = 30 + sh;

        return (
            <svg viewBox={`0 0 ${ox + sb + 60} ${oy + 40}`} width="100%" style={{ maxWidth: '350px', maxHeight: '220px' }}>
                <polygon points={`${ox},${oy} ${ox + sb},${oy} ${ox + sb / 2},${oy - sh}`} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2.5" />
                <line x1={ox + sb / 2} y1={oy} x2={ox + sb / 2} y2={oy - sh} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
                {/* Right angle marker at base of height */}
                <polyline points={`${ox + sb / 2 - 8},${oy} ${ox + sb / 2 - 8},${oy - 8} ${ox + sb / 2},${oy - 8}`} fill="none" stroke="#10b981" strokeWidth="1" />
                <text x={ox + sb / 2} y={oy + 22} textAnchor="middle" style={LABEL}>{base} cm</text>
                <text x={ox + sb / 2 - 18} y={oy - sh / 2} textAnchor="end" style={LABEL}>{height} cm</text>
                {/* Formula hint */}
                <text x={ox + sb / 2} y={oy - sh - 12} textAnchor="middle" style={{ ...LABEL, fontSize: '11px', fill: '#64748b' }}>Area = ½ × b × h</text>
            </svg>
        );
    }

    if (a && b && c) {
        const maxSide = Math.max(a, b, c);
        const scale = Math.min(200 / maxSide, 30);
        const sa = a * scale, sc = c * scale;
        const ox = 80, oy = 170;
        const cosA = (sa * sa + sc * sc - (b * scale) * (b * scale)) / (2 * sa * sc);
        const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
        const apex = { x: ox + sc * cosA, y: oy - sc * sinA };

        return (
            <svg viewBox={`0 0 ${ox + sa + 60} 220`} width="100%" style={{ maxWidth: '350px', maxHeight: '220px' }}>
                <polygon points={`${ox},${oy} ${ox + sa},${oy} ${apex.x},${apex.y}`} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2.5" />
                <text x={ox + sa / 2} y={oy + 22} textAnchor="middle" style={LABEL}>{a} cm</text>
                <text x={(ox + apex.x) / 2 - 16} y={(oy + apex.y) / 2} textAnchor="end" style={LABEL}>{c} cm</text>
                <text x={(ox + sa + apex.x) / 2 + 16} y={(oy + apex.y) / 2} textAnchor="start" style={LABEL}>{b} cm</text>
            </svg>
        );
    }
    return null;
}

function CircleDiagram({ r }) {
    const scale = Math.min(80, r * 15);
    const cx = 140, cy = 120;

    return (
        <svg viewBox="0 0 280 240" width="100%" style={{ maxWidth: '300px', maxHeight: '200px' }}>
            <circle cx={cx} cy={cy} r={scale} fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1={cx} y1={cy} x2={cx + scale} y2={cy} stroke="#f59e0b" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="3" fill="#f59e0b" />
            <text x={cx + scale / 2} y={cy - 8} textAnchor="middle" style={LABEL}>r = {r} cm</text>
        </svg>
    );
}

// ─── ANGLE DIAGRAMS ──────────────────────────────────────────

function IsoscelesAngleDiagram({ topAngle }) {
    const baseAngle = (180 - topAngle) / 2;
    const cx = 180, topY = 30, baseY = 190;
    const baseHalf = 100;

    // Triangle points
    const A = { x: cx, y: topY };         // apex
    const B = { x: cx - baseHalf, y: baseY }; // bottom-left
    const C = { x: cx + baseHalf, y: baseY }; // bottom-right

    // Arc path helper
    const arcPath = (center, r, startDeg, endDeg) => {
        const s = (startDeg * Math.PI) / 180;
        const e = (endDeg * Math.PI) / 180;
        const x1 = center.x + r * Math.cos(s);
        const y1 = center.y + r * Math.sin(s);
        const x2 = center.x + r * Math.cos(e);
        const y2 = center.y + r * Math.sin(e);
        const largeArc = endDeg - startDeg > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
    };

    // Angle at A: between lines going down-left and down-right
    const angleAStart = Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
    const angleAEnd = Math.atan2(C.y - A.y, C.x - A.x) * 180 / Math.PI;

    return (
        <svg viewBox="0 0 360 240" width="100%" style={{ maxWidth: '380px', maxHeight: '240px' }}>
            {/* Triangle */}
            <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(139,92,246,0.08)" stroke="#8b5cf6" strokeWidth="2.5" />

            {/* Equal side markers (tick marks) */}
            {/* AB side */}
            <line x1={(A.x + B.x) / 2 - 4} y1={(A.y + B.y) / 2 - 4} x2={(A.x + B.x) / 2 + 4} y2={(A.y + B.y) / 2 + 4} stroke="#8b5cf6" strokeWidth="2" />
            {/* AC side */}
            <line x1={(A.x + C.x) / 2 - 4} y1={(A.y + C.y) / 2 + 4} x2={(A.x + C.x) / 2 + 4} y2={(A.y + C.y) / 2 - 4} stroke="#8b5cf6" strokeWidth="2" />

            {/* Angle arc at A */}
            <path d={arcPath(A, 30, angleAStart, angleAEnd)} fill="none" stroke="#dc2626" strokeWidth="2" />
            <text x={A.x} y={A.y + 52} textAnchor="middle" style={ANGLE_LABEL}>{topAngle}°</text>

            {/* Angle arcs at B and C */}
            <path d={arcPath(B, 25, -90 + (90 - (180 - angleAStart)), 0)} fill="none" stroke="#2563eb" strokeWidth="2" />
            <text x={B.x + 32} y={B.y - 10} textAnchor="start" style={{ ...ANGLE_LABEL, fill: '#2563eb' }}>{baseAngle}°</text>

            <path d={arcPath(C, 25, 180, 180 + (90 - (angleAEnd - 90)))} fill="none" stroke="#2563eb" strokeWidth="2" />
            <text x={C.x - 32} y={C.y - 10} textAnchor="end" style={{ ...ANGLE_LABEL, fill: '#2563eb' }}>{baseAngle}°</text>

            {/* Vertex labels */}
            <text x={A.x} y={A.y - 8} textAnchor="middle" style={{ ...LABEL, fontSize: '15px', fontWeight: 800 }}>A</text>
            <text x={B.x - 14} y={B.y + 5} textAnchor="end" style={{ ...LABEL, fontSize: '15px', fontWeight: 800 }}>B</text>
            <text x={C.x + 14} y={C.y + 5} textAnchor="start" style={{ ...LABEL, fontSize: '15px', fontWeight: 800 }}>C</text>

            {/* AB=AC label */}
            <text x={cx} y={baseY + 28} textAnchor="middle" style={{ ...LABEL, fontSize: '12px', fill: '#8b5cf6' }}>AB = AC (isosceles)</text>
        </svg>
    );
}

function VerticallyOppositeAngleDiagram({ angle }) {
    const cx = 180, cy = 110;
    const len = 120;
    const opposite = angle;
    const adjacent = 180 - angle;

    // Two lines crossing at center
    // Line 1: angled
    const rad = (angle * Math.PI) / 180;
    const line1 = {
        x1: cx - len * Math.cos(rad / 2), y1: cy + len * Math.sin(rad / 2),
        x2: cx + len * Math.cos(rad / 2), y2: cy - len * Math.sin(rad / 2),
    };
    // Line 2: mirrored
    const line2 = {
        x1: cx - len * Math.cos(rad / 2), y1: cy - len * Math.sin(rad / 2),
        x2: cx + len * Math.cos(rad / 2), y2: cy + len * Math.sin(rad / 2),
    };

    const arcPath = (startDeg, endDeg, r = 35) => {
        const s = (startDeg * Math.PI) / 180;
        const e = (endDeg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(s), y1 = cy - r * Math.sin(s);
        const x2 = cx + r * Math.cos(e), y2 = cy - r * Math.sin(e);
        return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
    };

    const halfA = angle / 2;

    return (
        <svg viewBox="0 0 360 220" width="100%" style={{ maxWidth: '380px', maxHeight: '220px' }}>
            {/* Two crossing lines */}
            <line x1={line1.x1} y1={line1.y1} x2={line1.x2} y2={line1.y2} stroke="#334155" strokeWidth="2.5" />
            <line x1={line2.x1} y1={line2.y1} x2={line2.x2} y2={line2.y2} stroke="#334155" strokeWidth="2.5" />

            {/* Center dot */}
            <circle cx={cx} cy={cy} r="4" fill="#334155" />

            {/* Angle arcs - matching pairs highlighted */}
            {/* Top angle (known) */}
            <path d={arcPath(90 - halfA, 90 + halfA)} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2.5" />
            <text x={cx} y={cy - 45} textAnchor="middle" style={ANGLE_LABEL}>{angle}°</text>

            {/* Bottom angle (opposite = equal) */}
            <path d={arcPath(270 - halfA, 270 + halfA)} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2.5" />
            <text x={cx} y={cy + 55} textAnchor="middle" style={ANGLE_LABEL}>{opposite}°</text>

            {/* Side angles */}
            <path d={arcPath(halfA - 90, 90 - halfA, 28)} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="1.5" />
            <text x={cx + 55} y={cy + 5} textAnchor="start" style={{ ...ANGLE_LABEL, fill: '#3b82f6', fontSize: '12px' }}>{adjacent}°</text>

            <path d={arcPath(90 + halfA, 270 - halfA, 28)} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="1.5" />
            <text x={cx - 55} y={cy + 5} textAnchor="end" style={{ ...ANGLE_LABEL, fill: '#3b82f6', fontSize: '12px' }}>{adjacent}°</text>

            {/* Label */}
            <text x={cx} y={210} textAnchor="middle" style={{ ...LABEL, fontSize: '11px', fill: '#64748b' }}>Vertically opposite angles are equal</text>
        </svg>
    );
}

function AnglesOnLineDiagram({ knownAngle }) {
    const unknown = 180 - knownAngle;
    const cx = 200, cy = 130;
    const lineLen = 150;

    // Straight line (horizontal)
    const lineY = cy;

    // Dividing line going up at the angle
    const rad = (knownAngle * Math.PI) / 180;
    const divX = cx - 30; // point where dividing line meets the straight line
    const endX = divX + 100 * Math.cos(rad);
    const endY = lineY - 100 * Math.sin(rad);

    const arcPath = (centerX, r, startDeg, endDeg) => {
        const s = (startDeg * Math.PI) / 180;
        const e = (endDeg * Math.PI) / 180;
        const x1 = centerX + r * Math.cos(s), y1 = lineY - r * Math.sin(s);
        const x2 = centerX + r * Math.cos(e), y2 = lineY - r * Math.sin(e);
        const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
    };

    return (
        <svg viewBox="0 0 400 200" width="100%" style={{ maxWidth: '400px', maxHeight: '200px' }}>
            {/* Straight line */}
            <line x1={cx - lineLen} y1={lineY} x2={cx + lineLen} y2={lineY} stroke="#334155" strokeWidth="2.5" />
            {/* Arrows at ends */}
            <polygon points={`${cx + lineLen},${lineY} ${cx + lineLen - 8},${lineY - 5} ${cx + lineLen - 8},${lineY + 5}`} fill="#334155" />
            <polygon points={`${cx - lineLen},${lineY} ${cx - lineLen + 8},${lineY - 5} ${cx - lineLen + 8},${lineY + 5}`} fill="#334155" />

            {/* Dividing line */}
            <line x1={divX} y1={lineY} x2={endX} y2={endY} stroke="#334155" strokeWidth="2.5" />

            {/* Known angle arc (left side) */}
            <path d={arcPath(divX, 40, 0, knownAngle)} fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="2.5" />
            <text x={divX + 55} y={lineY - 20} textAnchor="middle" style={ANGLE_LABEL}>{knownAngle}°</text>

            {/* Unknown angle arc (right side / above the line on the other side) */}
            <path d={arcPath(divX, 30, knownAngle, 180)} fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth="2.5" />
            <text x={divX - 30} y={lineY - 35} textAnchor="middle" style={{ ...ANGLE_LABEL, fill: '#3b82f6' }}>x = {unknown}°</text>

            {/* Point dot */}
            <circle cx={divX} cy={lineY} r="4" fill="#334155" />

            {/* Rule */}
            <text x={cx} y={lineY + 35} textAnchor="middle" style={{ ...LABEL, fontSize: '11px', fill: '#64748b' }}>Angles on a straight line = 180°</text>
        </svg>
    );
}

function CompositeShapeDiagram({ square, rect }) {
    const scale = 20;
    const sw = square.w * scale, sh = square.h * scale;
    const rw = rect.w * scale, rh = rect.h * scale;
    const ox = 60, oy = 30;
    const totalW = sw + rw;

    return (
        <svg viewBox={`0 0 ${ox + totalW + 80} ${oy + Math.max(sh, rh) + 60}`} width="100%" style={{ maxWidth: '420px', maxHeight: '240px' }}>
            {/* Square */}
            <rect x={ox} y={oy} width={sw} height={sh} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5" />
            {/* Rectangle */}
            <rect x={ox + sw} y={oy + (sh - rh)} width={rw} height={rh} fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth="2.5" />

            {/* Shared edge - dashed to indicate it's internal */}
            <line x1={ox + sw} y1={oy + (sh - rh)} x2={ox + sw} y2={oy + sh} stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,3" />

            {/* Square labels */}
            <text x={ox + sw / 2} y={oy + sh + 22} textAnchor="middle" style={LABEL}>{square.w} cm</text>
            <text x={ox - 12} y={oy + sh / 2 + 5} textAnchor="end" style={LABEL}>{square.h} cm</text>

            {/* Rectangle labels */}
            <text x={ox + sw + rw / 2} y={oy + sh + 22} textAnchor="middle" style={{ ...LABEL, fill: '#d97706' }}>{rect.w} cm</text>
            <text x={ox + sw + rw + 12} y={oy + (sh - rh) + rh / 2 + 5} textAnchor="start" style={{ ...LABEL, fill: '#d97706' }}>{rect.h} cm</text>

            {/* Shape labels */}
            <text x={ox + sw / 2} y={oy + sh / 2 + 4} textAnchor="middle" style={{ ...LABEL, fontSize: '11px', fill: '#6366f1' }}>Square</text>
            <text x={ox + sw + rw / 2} y={oy + (sh - rh) + rh / 2 + 4} textAnchor="middle" style={{ ...LABEL, fontSize: '11px', fill: '#d97706' }}>Rect</text>

            {/* Perimeter note */}
            <text x={(ox + ox + totalW) / 2} y={oy + Math.max(sh, rh) + 50} textAnchor="middle" style={{ ...LABEL, fontSize: '11px', fill: '#64748b' }}>Perimeter = total outer sides only</text>
        </svg>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export default function GeometryVisual({ description, title }) {
    const text = `${title || ''} ${description || ''}`;
    const dims = detectProblemType(text);
    if (!dims) return null;

    let diagram = null;

    switch (dims.type) {
        case 'cuboid':
            diagram = <CuboidDiagram l={dims.l} w={dims.w} h={dims.h} />;
            break;
        case 'rectangle':
            diagram = <RectangleDiagram l={dims.l} w={dims.w} />;
            break;
        case 'square':
            diagram = <RectangleDiagram l={dims.s} w={dims.s} />;
            break;
        case 'triangle':
            diagram = <TriangleDiagram a={dims.a} b={dims.b} c={dims.c} base={dims.base} height={dims.height} />;
            break;
        case 'circle':
            diagram = <CircleDiagram r={dims.r} />;
            break;
        case 'isosceles-angle':
            diagram = <IsoscelesAngleDiagram topAngle={dims.topAngle} />;
            break;
        case 'vertically-opposite':
            diagram = <VerticallyOppositeAngleDiagram angle={dims.angle} />;
            break;
        case 'angles-on-line':
            diagram = <AnglesOnLineDiagram knownAngle={dims.knownAngle} />;
            break;
        case 'composite':
            diagram = <CompositeShapeDiagram square={dims.square} rect={dims.rect} />;
            break;
        default:
            return null;
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '2px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
        }}>
            <div style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            }}>
                📐 Diagram
            </div>
            {diagram}
        </div>
    );
}
