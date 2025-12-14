import React from 'react';

const BarModelDiagram = ({ type, data }) => {
    if (!data || !data.items) return null;

    // Common styles - Updated to brighter colors for better visibility on dark background
    const colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B']; // Brighter blue, pink, green, orange
    const barHeight = 40;
    const gap = 10;
    const startX = 100;
    const startY = 30;
    const scale = 15; // pixels per unit value (approx)

    if (type === 'comparison') {
        return (
            <svg width="100%" height="150" viewBox="0 0 500 150" style={{ background: '#1A1A1A', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                {data.items.map((item, index) => {
                    const width = item.value * scale;
                    // For the 'Hat' example, we might need manual widths if values are conceptual
                    // Let's assume input comes with 'width' or we estimate
                    const displayWidth = item.width || (item.value * 10) + 50;

                    return (
                        <g key={index}>
                            {/* Label */}
                            <text x={startX - 10} y={startY + (index * (barHeight + gap)) + (barHeight / 1.5)}
                                fill="#fff" textAnchor="end" fontSize="14">
                                {item.label}
                            </text>

                            {/* Bar */}
                            <rect x={startX} y={startY + index * (barHeight + gap)}
                                width={displayWidth} height={barHeight}
                                fill={colors[index % colors.length]}
                                stroke="#fff" strokeWidth="1" />

                            {/* Value Inside */}
                            <text x={startX + displayWidth / 2} y={startY + (index * (barHeight + gap)) + (barHeight / 1.5)}
                                fill="#fff" textAnchor="middle" fontSize="12" fontWeight="bold">
                                {item.valueText || item.value}
                            </text>

                            {/* Difference Bracket (Custom for Hat Example) */}
                            {item.diff && (
                                <g>
                                    <line x1={startX + (data.items[0].width || (data.items[0].value * 10) + 50)}
                                        y1={startY + index * (barHeight + gap) - 5}
                                        x2={startX + displayWidth}
                                        y2={startY + index * (barHeight + gap) - 5}
                                        stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
                                    <text x={startX + (data.items[0].width || (data.items[0].value * 10) + 50) + (item.diffWidth / 2 || 20)}
                                        y={startY + index * (barHeight + gap) - 8}
                                        fill="#cbd5e1" fontSize="10">{item.diff}</text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        );
    }

    if (type === 'part-whole') {
        let currentX = startX;

        // Robust Calc: parse total, sum knowns, deduce unknowns
        const numericValues = data.items.map(i => parseFloat(i.value));
        const sumKnown = numericValues.filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
        let safeTotal = parseFloat(data.totalLabel);

        // If totalLabel is not a number, fall back to sum of knowns (or 100 default)
        if (isNaN(safeTotal)) {
            safeTotal = sumKnown > 0 ? sumKnown : 100;
        }

        const unknownCount = numericValues.filter(v => isNaN(v)).length;
        const remainder = Math.max(0, safeTotal - sumKnown);

        return (
            <svg width="100%" height="100" viewBox="0 0 500 100" style={{ background: '#1A1A1A', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                {data.items.map((item, index) => {
                    // Determine effective value for width calc
                    let val = parseFloat(item.value);
                    if (isNaN(val)) {
                        val = unknownCount > 0 ? remainder / unknownCount : 0;
                    }

                    // Calculate width carefully
                    const ratio = safeTotal > 0 ? val / safeTotal : (1 / data.items.length);
                    const width = Math.max(ratio * 300, 40); // Ensure min width for text visibility

                    const myX = currentX;
                    currentX += width;

                    return (
                        <g key={index}>
                            {/* Segment */}
                            <rect x={myX} y={startY} width={width} height={barHeight}
                                fill={colors[index % colors.length]} stroke="#fff" strokeWidth="1" />

                            {/* Label Above */}
                            <text x={myX + width / 2} y={startY - 5} fill="#fff" textAnchor="middle" fontSize="12">
                                {item.label}
                            </text>

                            {/* Value Inside */}
                            <text x={myX + width / 2} y={startY + 25} fill="#fff" textAnchor="middle" fontWeight="bold">
                                {item.valueText || item.value}
                            </text>
                        </g>
                    );
                })}

                {/* Total Bracket Below */}
                <g>
                    <line x1={startX} y1={startY + barHeight + 10} x2={startX + 300} y2={startY + barHeight + 10}
                        stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={startX} y1={startY + barHeight + 5} x2={startX} y2={startY + barHeight + 10}
                        stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={startX + 300} y1={startY + barHeight + 5} x2={startX + 300} y2={startY + barHeight + 10}
                        stroke="#cbd5e1" strokeWidth="1" />
                    <text x={startX + 150} y={startY + barHeight + 25} fill="#fff" textAnchor="middle" fontSize="12">
                        Total {data.totalLabel || safeTotal}
                    </text>
                </g>
            </svg>
        );
    }

    if (type === 'ratio') {
        // Ratio View: Draw discrete blocks to emphasize "units"
        // e.g. 3:4 => 3 blocks vs 4 blocks
        const unitSize = 40; // Size of square block
        const startY_Ratio = 30;

        // Calculate max width needed
        const maxUnits = Math.max(...data.items.map(i => i.value));
        const totalWidth = startX + (maxUnits * unitSize) + 50;
        const totalHeight = startY_Ratio + (data.items.length * (unitSize + gap)) + 30;

        return (
            <svg width="100%" height={totalHeight} viewBox={`0 0 ${Math.max(500, totalWidth)} ${totalHeight}`} style={{ background: '#1A1A1A', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                {data.items.map((item, index) => {
                    const rowY = startY_Ratio + index * (unitSize + gap);

                    return (
                        <g key={index}>
                            {/* Label */}
                            <text x={startX - 15} y={rowY + (unitSize / 1.5)}
                                fill="#fff" textAnchor="end" fontSize="14" fontWeight="bold">
                                {item.label}
                            </text>

                            {/* Blocks */}
                            {Array.from({ length: item.value }).map((_, blockIdx) => (
                                <rect
                                    key={blockIdx}
                                    x={startX + (blockIdx * unitSize)}
                                    y={rowY}
                                    width={unitSize}
                                    height={unitSize}
                                    fill={colors[index % colors.length]}
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                            ))}

                            {/* Value Label at end (optional) */}
                            {/* <text x={startX + (item.value * unitSize) + 15} y={rowY + (unitSize/1.5)} fill="#aaa" fontSize="12">{item.value}</text> */}
                        </g>
                    );
                })}

                {/* Total Brace (Right side) if totalLabel exists */}
                {data.totalLabel && (
                    <g>
                        <line x1={startX + (maxUnits * unitSize) + 20} y1={startY_Ratio}
                            x2={startX + (maxUnits * unitSize) + 20} y2={startY_Ratio + (data.items.length * unitSize) + ((data.items.length - 1) * gap)}
                            stroke="#cbd5e1" strokeWidth="1" />
                        <line x1={startX + (maxUnits * unitSize) + 20} y1={startY_Ratio}
                            x2={startX + (maxUnits * unitSize) + 15} y2={startY_Ratio}
                            stroke="#cbd5e1" strokeWidth="1" />
                        <line x1={startX + (maxUnits * unitSize) + 20} y1={startY_Ratio + (data.items.length * unitSize) + ((data.items.length - 1) * gap)}
                            x2={startX + (maxUnits * unitSize) + 15} y2={startY_Ratio + (data.items.length * unitSize) + ((data.items.length - 1) * gap)}
                            stroke="#cbd5e1" strokeWidth="1" />

                        <text x={startX + (maxUnits * unitSize) + 30}
                            y={startY_Ratio + ((data.items.length * unitSize + ((data.items.length - 1) * gap)) / 2)}
                            fill="#fff" dominantBaseline="middle" fontSize="13">
                            Total {data.totalLabel}
                        </text>
                    </g>
                )}
            </svg>
        );
    }

    return null;
};

export default BarModelDiagram;
