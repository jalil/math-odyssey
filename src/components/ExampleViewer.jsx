"use client";
import React, { useState } from 'react';
import ExampleCard from './ExampleCard';
import StepContainer from './StepContainer';

export default function ExampleViewer({ examples, onNextStep, onPrevStep, sectionTitle }) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    // Assuming useUser is defined elsewhere or will be added.
    // For now, commenting it out to avoid compilation errors if not present.
    // const { user, progress, saveProgress } = useUser();

    // To prevent rapid clicks or hydration issues
    const [isNavigating, setIsNavigating] = React.useState(false);

    if (!examples || examples.length === 0) {
        return (
            <StepContainer title="Error" onNext={onNextStep} onBack={onPrevStep}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>No examples found.</p>
                </div>
            </StepContainer>
        );
    }

    const currentExample = examples[currentIndex];

    if (!currentExample) {
        return null;
    }

    // Calculate total progress step based on segments
    const totalSteps = examples.length;

    const handleNext = () => {
        if (currentIndex < examples.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (onNextStep) {
            onNextStep();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else if (onPrevStep) {
            onPrevStep();
        }
    };

    // Use passed sectionTitle as main title if available, otherwise Example Title
    // If sectionTitle exists (e.g. "Model Method"), use Example Title as subtitle
    const displayTitle = sectionTitle || currentExample.title;
    const displaySubtitle = sectionTitle ? currentExample.title : currentExample.type;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === examples.length - 1;

    // If we are at the last example, the next button should label "Continue" or something if onNextStep is present?
    // Or just keep it "Next".
    // If onNextStep is NOT present (e.g. standalone), then disable if isLast.

    return (
        <StepContainer
            title={displayTitle}
            subtitle={displaySubtitle}
            onNext={handleNext}
            onBack={handleBack}
            disableNext={isLast && !onNextStep}
            disableBack={isFirst && !onPrevStep}
            segments={totalSteps}
            currentSegment={currentIndex + 1}
            nextLabel={isLast && onNextStep ? "Continue →" : "Next →"}
            backLabel={isFirst && onPrevStep ? "← Back" : "← Back"}
        >
            <div style={{ transition: 'all 0.3s ease', minHeight: '300px' }}>
                <ExampleCard
                    key={currentIndex}
                    {...currentExample}
                    contentStyle={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
                    textColor="#e4e4e7"
                    titleColor="#fff"
                    showTitle={false}
                />
            </div>
        </StepContainer>
    );
}
