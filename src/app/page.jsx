"use client";
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import topics from '../data/topics.json';
import BarModelDiagram from '../components/BarModelDiagram';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import HomePage from '../components/HomePage';
import QuizMode from '../components/QuizMode';
import ExampleViewer from '../components/ExampleViewer';
import ExampleCard from '../components/ExampleCard';
import QuizViewer from '../components/QuizViewer';
import QuizCard from '../components/QuizCard';

// Inline components moved to separate files.
import SectionHeader from '../components/SectionHeader';
import ExplanationCard from '../components/ExplanationCard';
import StepContainer from '../components/StepContainer';

// QuizCard component has been moved to ../components/QuizCard.jsx

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topicId = searchParams.get('topic');
    const { user, progress, saveProgress } = useUser();

    // State for Focus Mode
    const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);

    // Default to first topic to safely run hooks if topicId is missing
    const currentTopic = topics.find(t => t.id === topicId) || topics[0];

    // Check parameters
    const sectionParam = searchParams.get('section');
    const isInReviewTestMode = sectionParam === 'review-test';

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
                    // Direct match
                    if (s.id === sectionParam) return true;
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

    // Case 1: No Topic Selected (Home)
    if (!topicId) {
        return <HomePage />;
    }

    // Case 2: Review Test Mode
    if (isInReviewTestMode) {
        let inReviewTest = false;
        const reviewTestQuestions = [];

        currentTopic.sections.forEach((section, idx) => {
            if (section.type === 'section-header' && section.title && section.title.includes('Review Test')) {
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
                const status = itemProgress ? (itemProgress.passed ? 'correct' : 'incorrect') : null;
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

            return (
                <QuizViewer
                    questions={groupQuestions}
                    sectionTitle={sectionTitle}
                    onNextStep={goNext}
                    onPrevStep={goBack}
                    onResult={(qid, isCorrect) => {
                        saveProgress(qid, isCorrect ? 1 : 0, 1);
                    }}
                    onReview={jumpToSection}
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
        <div style={{ padding: '3rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 700
                    }}>
                        Current Topic
                    </span>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                        {currentTopic.title}
                    </h1>
                </div>

                {!user ? (
                    <div style={{ padding: '0.5rem 1rem', background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: '8px', color: '#854D0E', fontSize: '0.9rem' }}>
                        Guest Mode
                    </div>
                ) : (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        👤 {user.name}
                    </div>
                )}
            </header>

            {/* Global Progress Bar for Topic Sections */}
            <div style={{ marginBottom: '2rem', width: '100%', height: '6px', background: '#e4e4e7', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                    width: `${((currentSectionIndex + 1) / processedSections.length) * 100}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Dynamic Content with Key to Force Remount */}
            <div key={currentSectionIndex} style={{ minHeight: '500px' }}>
                {renderSection()}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Step {currentSectionIndex + 1} of {processedSections.length}
            </div>
        </div>
    );
}


export default function Home() {
    return (
        <Suspense fallback={<div>Loading content...</div>}>
            <Content />
        </Suspense>
    );
}

