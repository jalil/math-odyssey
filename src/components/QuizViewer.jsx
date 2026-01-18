"use client";
import React, { useState } from 'react';
import QuizCard from './QuizCard';
import StepContainer from './StepContainer';

export default function QuizViewer({ questions, onResult, progress, onNextStep, onPrevStep, sectionTitle, isAdmin, ...props }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Track locally solved questions to enable "Next" immediately without waiting for parent/context update
    const [solvedIndices, setSolvedIndices] = useState({});

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    // Use passed sectionTitle as main title if available
    // Otherwise use "Question X" or just the question title
    const displayTitle = sectionTitle || currentQuestion.title;
    const displaySubtitle = sectionTitle ? `Question ${currentIndex + 1} of ${totalQuestions}` : null;
    const displayQuestionNumber = currentIndex + 1;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
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

    // Check if current question is solved either historically (prop) or just now (local state)
    const isSolved = (currentQuestion.initialStatus === 'correct') || !!solvedIndices[currentIndex];

    return (
        <StepContainer
            title={displayTitle}
            subtitle={displaySubtitle}
            onNext={handleNext}
            onBack={handleBack}
            disableNext={!isSolved && !isAdmin}
            disableBack={isFirst && !props.onPrevStep}
            nextLabel={isLast ? (props.finishLabel || (onNextStep ? "Continue" : "Finish")) : "Next Question"}
            segments={totalQuestions}
            currentSegment={currentIndex + 1}
        >
            <QuizCard
                {...currentQuestion}
                key={currentQuestion.questionId} // Important for animation/reset
                questionNumber={displayQuestionNumber}
                totalQuestions={totalQuestions}
                onResult={(questionId, isCorrect) => {
                    // Update local state for immediate feedback
                    if (isCorrect) {
                        setSolvedIndices(prev => ({ ...prev, [currentIndex]: true }));
                    }
                    // Pass result up
                    if (onResult) onResult(questionId, isCorrect);
                }}
                onReview={props.onReview}
            />
        </StepContainer>
    );
}
