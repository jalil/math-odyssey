import React from 'react';

export default function IslandCard({
    title,
    emoji = "🏝️",
    description,
    onClick,
    color = "bg-white",
    buttonText = "Start Quest"
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                island-card flex flex-col items-center justify-between
                p-8 text-center h-full min-h-[280px] w-full
                group relative overflow-hidden
                ${color}
            `}
        >
            {/* Soft decorative blob */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-sky-50 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500 ease-out" />

            {/* Content z-index adjustment */}
            <div className="relative z-10 flex flex-col items-center flex-grow justify-center">
                <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    {emoji}
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {description && (
                    <p className="text-slate-500 font-medium leading-relaxed max-w-[80%] mb-6">
                        {description}
                    </p>
                )}
            </div>

            {/* Button Appearance (Fake button for visual affordance since the whole card is clickable) */}
            <div className={`
                mt-auto px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide
                bg-slate-100 text-slate-600 group-hover:bg-blue-500 group-hover:text-white
                transition-all duration-300 shadow-sm
            `}>
                {buttonText}
            </div>
        </button>
    );
}
