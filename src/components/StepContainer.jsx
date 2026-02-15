"use client";
export default function StepContainer({
    children,
    title,
    subtitle,
    onNext,
    onBack,
    showNext = true,
    showBack = true,
    disableNext = false,
    disableBack = false,
    nextLabel = "Next",
    backLabel = "Back",
    segments = 1,
    currentSegment = 0
}) {
    return (
        <div className="flex flex-col min-h-[600px] w-full max-w-6xl mx-auto relative animate-fade-in-up items-center">

            {/* Header Area - PUNCHY */}
            <div className="mb-8 text-center">
                <h3 style={{
                    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #667eea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    {title}
                </h3>
                {/* Animated accent bar under title */}
                <div className="gradient-shimmer" style={{
                    width: '60px',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #f5576c, #667eea)',
                    backgroundSize: '200% 200%',
                    margin: '0 auto 0.75rem',
                }} />
                {subtitle && (
                    <span className="glow-ring inline-block text-lg text-slate-500 font-bold bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100">
                        {subtitle}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative z-10 w-full">
                {children}
            </div>

            {/* Navigation Control Bar - Floating Pill */}
            <div className="sticky bottom-6 mt-12 z-40 w-full flex justify-center">
                <div className="mx-auto max-w-2xl bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-float border border-slate-200 rounded-full">

                    {/* Back Button */}
                    <div className="w-1/3 flex justify-start">
                        {showBack ? (
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={disableBack}
                                className={`
                                    btn-quest-secondary text-sm flex items-center gap-2 border-none bg-transparent hover:bg-slate-100 text-slate-500
                                    ${disableBack ? 'opacity-30 cursor-not-allowed' : ''}
                                `}
                            >
                                <span>←</span> {backLabel}
                            </button>
                        ) : <div />}
                    </div>

                    {/* Progress Dots (Optional visualization) */}
                    <div className="w-1/3 flex justify-center gap-2">
                        {[...Array(Math.min(5, segments || 1))].map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i <= currentSegment ? 'bg-blue-500' : 'bg-slate-200'}`} />
                        ))}
                    </div>

                    {/* Next Button */}
                    <div className="w-1/3 flex justify-end">
                        {showNext ? (
                            <button
                                type="button"
                                onClick={onNext}
                                disabled={disableNext}
                                className={`
                                    btn-quest flex items-center gap-2 shadow-lg
                                    ${disableNext ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
                                `}
                            >
                                {nextLabel} <span className="text-xl">→</span>
                            </button>
                        ) : <div />}
                    </div>
                </div>
            </div>
        </div>
    );
}
