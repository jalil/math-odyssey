"use client";
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import topics from '../data/topics.json';
import BarModelDiagram from '../components/BarModelDiagram';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import HomePage from '../components/HomePage';
import QuizMode from '../components/QuizMode';
import CheckpointCard from '../components/CheckpointCard';
import TableOfContents from '../components/TableOfContents';
import ExampleViewer from '../components/ExampleViewer';
import ExampleCard from '../components/ExampleCard';
import QuizViewer from '../components/QuizViewer';
import QuizCard from '../components/QuizCard';
import SpeedRunQuiz from '../components/SpeedRunQuiz';

// Inline components moved to separate files.
import SectionHeader from '../components/SectionHeader';
import ExplanationCard from '../components/ExplanationCard';
import StepContainer from '../components/StepContainer';

// QuizCard component has been moved to ../components/QuizCard.jsx

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topicId = searchParams.get('topic');

    const { user, progress, saveProgress, isLoading } = useUser();

    // State for Focus Mode
    const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
    const [showTOC, setShowTOC] = React.useState(false);



    // Default to first topic to safely run hooks if topicId is missing
    const currentTopic = topics.find(t => t.id === topicId) || topics[0];

    // Check parameters
    const sectionParam = searchParams.get('section');

    // Determine if we are in Review Test Mode
    // Matches if param is 'review-test' OR if the specific section ID exists and has "Review Test" in title
    const targetSection = React.useMemo(() =>
        currentTopic.sections.find(s => s.id === sectionParam),
        [currentTopic, sectionParam]);

    const isInReviewTestMode = sectionParam === 'review-test' ||
        (targetSection && targetSection.type === 'section-header' && targetSection.title && targetSection.title.includes('Review Test'));

    // -------------------------------------------------------------------------
    // HOOKS: Run unconditionally to adhere to Rules of Hooks
    // -------------------------------------------------------------------------

    // Pre-process sections
    const processedSections = React.useMemo(() => {
        let sections = [];

        let currentExampleGroup = [];
        let currentQuizGroup = [];
        let pendingHeader = null;

        const flushGroups = () => {
            if (currentExampleGroup.length > 0) {
                sections.push({
                    type: 'example-group',
                    examples: [...currentExampleGroup],
                    originalIndex: currentExampleGroup[0].originalIndex,
                    headerInfo: pendingHeader
                });
                currentExampleGroup = [];
                pendingHeader = null;
            }
            if (currentQuizGroup.length > 0) {
                sections.push({
                    type: 'quiz-group',
                    questions: [...currentQuizGroup],
                    originalIndex: currentQuizGroup[0].originalIndex,
                    title: "Practice Questions",
                    headerInfo: pendingHeader
                });
                currentQuizGroup = [];
                pendingHeader = null;
            }
        };

        currentTopic.sections.forEach((s, idx) => {
            if (s.type === 'section-header') {
                flushGroups();
                if (pendingHeader) {
                    sections.push({
                        type: 'section-header',
                        ...pendingHeader,
                        originalIndex: pendingHeader.originalIndex
                    });
                }
                pendingHeader = { ...s, originalIndex: idx };
            }
            else if (s.type === 'example') {
                if (currentQuizGroup.length > 0) {
                    sections.push({
                        type: 'quiz-group',
                        questions: [...currentQuizGroup],
                        originalIndex: currentQuizGroup[0].originalIndex,
                        headerInfo: pendingHeader
                    });
                    currentQuizGroup = [];
                    pendingHeader = null;
                }
                currentExampleGroup.push({ ...s, originalIndex: idx });
            }
            else if (s.type === 'quiz') {
                if (currentExampleGroup.length > 0) {
                    sections.push({
                        type: 'example-group',
                        examples: [...currentExampleGroup],
                        originalIndex: currentExampleGroup[0].originalIndex,
                        headerInfo: pendingHeader
                    });
                    currentExampleGroup = [];
                    pendingHeader = null;
                }
                currentQuizGroup.push({ ...s, originalIndex: idx });
            }
            else {
                flushGroups();
                sections.push({
                    ...s,
                    originalIndex: idx,
                    headerInfo: pendingHeader
                });
                pendingHeader = null;
            }
        });

        flushGroups();

        if (pendingHeader) {
            sections.push({
                type: 'section-header',
                ...pendingHeader,
                originalIndex: pendingHeader.originalIndex
            });
        }

        // Add Next Topic
        const cTopicIdx = topics.findIndex(t => t.id === currentTopic.id);
        const nTopic = (cTopicIdx !== -1 && cTopicIdx < topics.length - 1) ? topics[cTopicIdx + 1] : null;

        if (nTopic) {
            sections.push({
                type: 'next-topic-card',
                title: 'Up Next',
                nextTopic: nTopic
            });
        }

        return sections;
    }, [currentTopic]); // Only re-calculate when topic changes

    // Re-calculate locks
    const sectionLocks = React.useMemo(() => {
        let locks = {};
        let currentQuizQuestions = [];

        currentTopic.sections.forEach((s, idx) => {
            if (s.type === 'quiz') {
                currentQuizQuestions.push({ idx, title: s.title });
            } else if (s.type === 'section-header' && idx > 0) {
                if (currentQuizQuestions.length >= 5) {
                    const batchResults = currentQuizQuestions.map(q => {
                        const key = `${currentTopic.id}-${q.idx}`;
                        return progress[key]?.passed;
                    });
                    const score = batchResults.filter(Boolean).length;
                    const total = currentQuizQuestions.length;
                    if (score < 8) {
                        locks[idx] = { locked: true, score, total };
                    } else {
                        locks[idx] = { locked: false, score, total };
                    }
                }
                currentQuizQuestions = [];
            }
        });
        return locks;
    }, [currentTopic, progress]);


    // Effects

    // Reset section index when topic changes
    React.useEffect(() => {
        setCurrentSectionIndex(0);
    }, [topicId]);

    // Protect content
    React.useEffect(() => {
        if (topicId && !user) {
            router.push('/login');
        }
    }, [topicId, user, router]);

    // Deep Link Logic
    React.useEffect(() => {
        if (processedSections.length > 0) {
            if (sectionParam && sectionParam !== 'review-test') {
                const targetIndex = processedSections.findIndex(s => {
                    if (s.id === sectionParam) return true;
                    // Debug Log
                    if (sectionParam.includes('intro') || sectionParam.includes('complete')) {
                        console.log('Checking section:', s.id, 'against param:', sectionParam, 'Match:', s.id === sectionParam);
                    }
                    // Header match
                    if (s.headerInfo && s.headerInfo.id === sectionParam) return true;
                    // Group match
                    if (s.type === 'example-group' && s.examples.some(e => e.id === sectionParam)) return true;
                    if (s.type === 'quiz-group' && s.questions.some(q => q.id === sectionParam)) return true;
                    return false;
                });

                if (targetIndex !== -1) {
                    setCurrentSectionIndex(targetIndex);
                }
            } else if (!sectionParam) {
                // If sectionParam is cleared, reset to start
                setCurrentSectionIndex(0);
            }
        }
    }, [sectionParam, processedSections, topicId]);

    // -------------------------------------------------------------------------
    // RENDER LOGIC: Conditional Returns
    // -------------------------------------------------------------------------

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{ fontSize: '2rem' }}>⏳</div>
                <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
            </div>
        );
    }

    // Case 0: Speed Run Mode
    if (topicId === 'speed-run') {
        return (
            <div style={{ padding: '2rem' }}>
                <SpeedRunQuiz />
            </div>
        );
    }

    // Case 1: No Topic Selected (Home)
    if (!topicId) {
        return <HomePage />;
    }

    // Case 2: Review Test Mode
    if (isInReviewTestMode) {
        let inReviewTest = false;
        const reviewTestQuestions = [];

        currentTopic.sections.forEach((section, idx) => {
            const isStartHeader = sectionParam === 'review-test'
                ? (section.type === 'section-header' && section.title && section.title.includes('Review Test'))
                : (section.id === sectionParam);

            if (isStartHeader) {
                inReviewTest = true;
            } else if (section.type === 'section-header' && inReviewTest) {
                inReviewTest = false;
            } else if (inReviewTest && section.type === 'quiz') {
                reviewTestQuestions.push({
                    ...section,
                    originalIndex: idx
                });
            }
        });

        if (reviewTestQuestions.length > 0) {
            return (
                <QuizMode
                    questions={reviewTestQuestions}
                    topicId={currentTopic.id}
                    isAdmin={user && user.name.toLowerCase() === 'admin'}
                    onComplete={(results) => {
                        results.forEach((result) => {
                            const question = reviewTestQuestions[result.questionIndex];
                            const quizKey = `${currentTopic.id}-${question.originalIndex}`;
                            saveProgress(quizKey, result.correct ? 1 : 0, 1);
                        });
                        router.push(`/?topic=${topicId}`);
                    }}
                />
            );
        }
    }

    // Case 3: Standard Content Mode
    const renderSection = () => {
        const currentSection = processedSections[currentSectionIndex];
        if (!currentSection) return <div>Finished!</div>;

        if (currentSection.type === 'checkpoint') {
            const isCompleted = progress && progress[`${currentSection.id}-complete`];
            return (
                <div style={{ padding: '2rem 0' }}>
                    <CheckpointCard
                        title={currentSection.title}
                        description={currentSection.content || "Great job completing this section!"}
                        isCompleted={!!isCompleted}
                        onComplete={() => {
                            if (currentSection.id) saveProgress(`${currentSection.id}-complete`, 1, 1);
                        }}
                    />
                </div>
            );
        }

        const idx = currentSection.originalIndex;
        const headerIdx = currentSection.headerInfo ? currentSection.headerInfo.originalIndex : null;

        const checkLock = (index) => {
            if (index !== null && sectionLocks[index] && sectionLocks[index].locked && (!user || user.name.toLowerCase() !== 'admin')) {
                return sectionLocks[index];
            }
            return null;
        };

        const activeLock = checkLock(headerIdx) || checkLock(idx);

        if (activeLock) {
            const lockTitle = currentSection.headerInfo ? currentSection.headerInfo.title : currentSection.title;
            return (
                <StepContainer
                    title={`🔒 ${lockTitle || 'Locked'}`}
                    showNext={false}
                    onBack={goBack}
                    disableBack={currentSectionIndex === 0}
                >
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            Complete previous Practice Test (8/{activeLock.total}) to unlock.
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.5rem' }}>
                            Current Score: {activeLock.score}/{activeLock.total}
                        </p>
                    </div>
                </StepContainer>
            );
        }

        if (currentSection.type === 'section-header') {
            return (
                <StepContainer
                    title={currentSection.title}
                    onNext={goNext}
                    onBack={goBack}
                    disableBack={currentSectionIndex === 0}
                >
                    <SectionHeader
                        title={currentSection.title}
                        description={currentSection.description}
                        id={currentSection.id}
                        videoUrl={currentSection.videoUrl}
                        topicId={currentTopic.id}
                    />
                </StepContainer>
            );
        }

        if (currentSection.type === 'explanation') {
            const pageTitle = currentSection.headerInfo ? currentSection.headerInfo.title : currentSection.title;
            const subtitle = currentSection.headerInfo ? currentSection.headerInfo.description : null;

            return (
                <StepContainer
                    title={pageTitle}
                    subtitle={subtitle}
                    onNext={goNext}
                    onBack={goBack}
                    disableBack={currentSectionIndex === 0}
                >
                    <ExplanationCard
                        title={currentSection.title}
                        sections={currentSection.sections}
                        topicId={currentTopic.id}
                    >
                        {currentSection.content}
                    </ExplanationCard>
                </StepContainer>
            );
        }

        if (currentSection.type === 'example-group') {
            const sectionTitle = currentSection.headerInfo ? currentSection.headerInfo.title : null;
            return (
                <ExampleViewer
                    examples={currentSection.examples}
                    sectionTitle={sectionTitle}
                    onNextStep={goNext}
                    onPrevStep={goBack}
                />
            );
        }

        if (currentSection.type === 'quiz-group') {
            const sectionTitle = currentSection.headerInfo ? currentSection.headerInfo.title : null;

            const groupQuestions = currentSection.questions.map(q => {
                const quizKey = `${currentTopic.id}-${q.originalIndex}`;
                const itemProgress = progress[quizKey];
                const status = itemProgress && itemProgress.passed ? 'correct' : null;
                return {
                    ...q,
                    questionId: quizKey,
                    initialStatus: status,
                };
            });

            const jumpToSection = (targetId) => {
                if (!targetId) return;
                const targetIndex = processedSections.findIndex(s => {
                    if (s.id === targetId) return true;
                    if (s.headerInfo && s.headerInfo.id === targetId) return true;
                    return false;
                });

                if (targetIndex !== -1) {
                    setCurrentSectionIndex(targetIndex);
                    window.scrollTo(0, 0);
                } else {
                    console.warn(`Section with ID ${targetId} not found.`);
                }
            };

            // Check if this is the last content section (followed by next-topic-card)
            const isLastContent = (currentSectionIndex < processedSections.length - 1) &&
                (processedSections[currentSectionIndex + 1].type === 'next-topic-card');

            return (
                <QuizViewer
                    questions={groupQuestions}
                    sectionTitle={sectionTitle}
                    isAdmin={user && user.name.toLowerCase() === 'admin'}
                    onNextStep={goNext}

                    onPrevStep={goBack}
                    onResult={(qid, isCorrect) => {
                        saveProgress(qid, isCorrect ? 1 : 0, 1);
                    }}
                    onReview={jumpToSection}
                    finishLabel={isLastContent ? "Complete Topic" : undefined}
                />
            );
        }

        if (currentSection.type === 'next-topic-card') {
            return (
                <StepContainer
                    title="Up Next"
                    onNext={() => router.push(`/?topic=${currentSection.nextTopic.id}`)}
                    onBack={goBack}
                    nextLabel="Start Next Topic →"
                >
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>{currentSection.nextTopic.title}</h2>
                        <p style={{ color: '#a1a1aa' }}>Ready to continue your learning journey?</p>
                    </div>
                </StepContainer>
            );
        }

        return (
            <StepContainer title="Unknown Section" onNext={goNext} onBack={goBack}>
                <p>Content not found.</p>
            </StepContainer>
        );
    };

    const goNext = () => {
        if (currentSectionIndex < processedSections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const goBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Header / Nav */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '1rem',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 50,
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        ← Home
                    </button>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Topic</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{currentTopic.title}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => setShowTOC(true)}
                        style={{
                            background: '#3f3f46',
                            color: 'white',
                            border: '1px solid #52525b',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>🗺️</span> Menu
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#222', padding: '0.5rem 1rem', borderRadius: '50px' }}>
                        <span style={{ fontSize: '1.2rem' }}>👤</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'Guest'}</span>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '6rem', paddingBottom: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                {renderSection()}
            </div>

            {/* Bottom Navigation */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
                background: 'linear-gradient(to top, black, transparent)',
                zIndex: 40,
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '900px',
                margin: '0 auto',
                pointerEvents: 'none' // Let clicks pass through gradient area
            }}>
                <button
                    onClick={goBack}
                    disabled={currentSectionIndex === 0}
                    style={{
                        pointerEvents: 'auto',
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        cursor: currentSectionIndex === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        opacity: currentSectionIndex === 0 ? 0 : 1, // Hide if first
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Back
                </button>

                {(processedSections[currentSectionIndex] && processedSections[currentSectionIndex].type === 'checkpoint') && (
                    <button
                        onClick={goNext}
                        style={{
                            pointerEvents: 'auto',
                            background: '#333',
                            color: 'white',
                            border: '1px solid #555',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Next Topic →
                    </button>
                )}

                {(!processedSections[currentSectionIndex] || (processedSections[currentSectionIndex].type !== 'quiz' && !processedSections[currentSectionIndex].type.includes('quiz') && processedSections[currentSectionIndex].type !== 'checkpoint')) && (
                    <button
                        onClick={goNext}
                        disabled={currentSectionIndex >= processedSections.length - 1} // No global checkLock here, rely on checkLock function
                        style={{
                            pointerEvents: 'auto',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Next →
                    </button>
                )}
            </div>

            {showTOC && (
                <TableOfContents
                    sections={processedSections}
                    onClose={() => setShowTOC(false)}
                    progress={progress || {}}
                    onNavigate={(index) => {
                        setCurrentSectionIndex(index);
                        setShowTOC(false);
                        window.scrollTo(0, 0);
                    }}
                />
            )}
        </main>
    );
}


export default function Home() {
    return (
        <Suspense fallback={<div>Loading content...</div>}>
            <Content />
        </Suspense>
    );
}

