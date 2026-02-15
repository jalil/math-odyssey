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
import ModuleDashboard from '../components/ModuleDashboard';
import ModuleCompletionCard from '../components/ModuleCompletionCard';
import IslandCard from '../components/IslandCard';

// QuizCard component has been moved to ../components/QuizCard.jsx

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topicId = searchParams.get('topic');

    const { user, progress, saveProgress, isLoading, logout } = useUser();

    // State for Focus Mode
    const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
    const [initialItemIndex, setInitialItemIndex] = React.useState(0); // For deep linking into groups
    const [showTOC, setShowTOC] = React.useState(false);

    // Quest Map State
    const [viewMode, setViewMode] = React.useState('worlds'); // 'worlds' or 'levels'
    const [activeWorld, setActiveWorld] = React.useState(null);

    // Calculate Progress Stats (Quest Header)
    const passedQuizzes = React.useMemo(() => {
        if (!progress) return 0;
        return Object.values(progress).filter(p => p.passed).length;
    }, [progress]);

    const totalQuizzesTaken = React.useMemo(() => {
        if (!progress) return 0;
        return Object.keys(progress).length;
    }, [progress]);



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
                // kept pendingHeader active
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
                // kept pendingHeader active
            }
        };

        currentTopic.sections.forEach((s, idx) => {
            if (s.type === 'section-header') {
                flushGroups(); // Flush any previous groups

                // If there was a pending header (meaning we just finished a module), 
                // inject a completion card BEFORE the new header
                if (pendingHeader) {
                    sections.push({
                        type: 'module-completion',
                        completedModule: pendingHeader, // The module we just finished
                        nextModule: s, // The new module we are starting
                        originalIndex: idx - 0.5 // Artificially place it before
                    });
                }

                // Always push component-based headers immediately to the stream
                // This ensures they exist as a navigable "Dashboard" page
                const headerItem = { ...s, originalIndex: idx };
                sections.push({
                    type: 'section-header',
                    ...headerItem
                });

                // Keep as pending to attach to subsequent children (examples/quizzes)
                pendingHeader = headerItem;
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
                    // Do NOT clear pendingHeader - allow it to persist for mixed groups
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
                    // Do NOT clear pendingHeader
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
                // Clear pending header for non-grouped items to prevent leakage
                pendingHeader = null;
            }
        });

        flushGroups();

        // Check if we have a pending header after the loop (last module)
        if (pendingHeader) {
            sections.push({
                type: 'module-completion',
                completedModule: pendingHeader,
                nextModule: null, // No next module in this topic
                originalIndex: 9999
            });
        }
        // (Removed the "If pendingHeader push it" block because we push immediately now)

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
                        locks[idx] = { locked: false, score, total }; // FORCE UNLOCK
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

    // Debug: Log processed sections
    React.useEffect(() => {
        if (processedSections.length > 0) {
            console.log('Processed Sections IDs:', processedSections.map(s => s.id));
        }
    }, [processedSections]);

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
                <StepContainer
                    title={currentSection.title}
                    showNext={false}
                    onBack={goBack}
                    disableBack={currentSectionIndex === 0}
                >
                    <CheckpointCard
                        title={currentSection.title}
                        description={currentSection.content || "Great job completing this section!"}
                        isCompleted={!!isCompleted}
                        onComplete={() => {
                            if (currentSection.id) saveProgress(`${currentSection.id}-complete`, 1, 1);
                        }}
                        onNext={goNext}
                    />
                </StepContainer>
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

                    {/* Module Dashboard: Show sub-sections dynamically */}
                    <div className="mt-8">
                        <ModuleDashboard
                            currentSection={currentSection}
                            subSections={(() => {
                                // Priority 1: Explicit sub-sections (Menu Mode)
                                if (currentSection.subSections) {
                                    return currentSection.subSections.map((s, i) => ({
                                        ...s,
                                        type: 'menu-item', // distinct type
                                        originalIndex: -1, // Not a navigable index in the linear flow
                                        targetId: s.targetId
                                    }));
                                }

                                const rawSubSections = processedSections.slice(currentSectionIndex + 1).filter(s => s.headerInfo && s.headerInfo.id === currentSection.id);
                                const flattened = [];

                                rawSubSections.forEach(s => {
                                    if (s.type === 'example-group') {
                                        s.examples.forEach((ex, idx) => {
                                            flattened.push({
                                                ...ex,
                                                type: 'example',
                                                title: ex.title || `Example ${idx + 1}`,
                                                originalSectionIndex: s.originalIndex, // Index of the group in processedSections
                                                internalIndex: idx // Index within the group
                                            });
                                        });
                                    } else if (s.type === 'quiz-group') {
                                        s.questions.forEach((q, idx) => {
                                            flattened.push({
                                                ...q,
                                                type: 'quiz',
                                                title: q.title || `Practice ${idx + 1}`,
                                                originalSectionIndex: s.originalIndex,
                                                internalIndex: idx
                                            });
                                        });
                                    } else {
                                        flattened.push({
                                            ...s,
                                            originalSectionIndex: s.originalIndex
                                        });
                                    }
                                });
                                return flattened;
                            })()}
                            onNavigate={(originalIndex, internalIndex, targetId) => {
                                console.log('Navigation triggered:', { originalIndex, internalIndex, targetId });
                                if (targetId) console.log('Available IDs:', processedSections.map(s => s.id));

                                // Handle explicit targetId (for Menu items)
                                if (targetId) {
                                    // Find section with this ID
                                    const targetIdx = processedSections.findIndex(s => s.id === targetId);
                                    console.log('Found targetIdx:', targetIdx);

                                    if (targetIdx !== -1) {
                                        setCurrentSectionIndex(targetIdx);
                                        window.scrollTo(0, 0);
                                    } else {
                                        console.warn(`Target ID ${targetId} not found`);
                                    }
                                    return;
                                }

                                const targetIdx = processedSections.findIndex(s => s.originalIndex === originalIndex);
                                if (targetIdx !== -1) {
                                    setInitialItemIndex(internalIndex || 0);
                                    setCurrentSectionIndex(targetIdx);
                                    window.scrollTo(0, 0);
                                }
                            }}
                        />
                    </div>
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
                    initialIndex={initialItemIndex}
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
                    initialIndex={initialItemIndex}
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

        if (currentSection.type === 'module-completion') {
            return (
                <StepContainer
                    title="Great Job!"
                    showNext={false}
                    showBack={false}
                >
                    <ModuleCompletionCard
                        moduleTitle={currentSection.completedModule.title}
                        nextModuleName={currentSection.nextModule ? currentSection.nextModule.title : null}
                        onContinue={() => {
                            // Move to next section (which is the next header)
                            goNext();
                        }}
                        onBackToMenu={() => {
                            // Go back to the 'Section Header' of the completed module
                            // We need to find its index. 
                            // completedModule has originalIndex.
                            const headerIdx = processedSections.findIndex(s => s.originalIndex === currentSection.completedModule.originalIndex && s.type === 'section-header');
                            if (headerIdx !== -1) {
                                setCurrentSectionIndex(headerIdx);
                                window.scrollTo(0, 0);
                            } else {
                                // Fallback to home
                                router.push('/');
                            }
                        }}
                    />
                </StepContainer>
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

    // -------------------------------------------------------------------------
    // QUEST MAP LOGIC - moved to top
    // -------------------------------------------------------------------------

    // Group P5 sections into "Worlds"
    const getWorlds = (topic) => {
        if (topic.id !== 'singapore-p5') return [];

        // Define Worlds mapping
        return [
            { id: 'numbers', title: 'Number Kingdom', emoji: '🔢', filter: ['Whole Numbers', 'Decimals', 'Percentage'] },
            { id: 'measures', title: 'Measurement Valley', emoji: '⚖️', filter: ['Fractions', 'Rate', 'Speed', 'Ratio'] },
            { id: 'geometry', title: 'Geometry Lands', emoji: '📐', filter: ['Angles', 'Perimeter', 'Area', 'Volume', 'Properties'] },
            { id: 'data', title: 'Data Peaks', emoji: '📊', filter: ['Average', 'Data Analysis'] }
        ];
    };

    const worlds = currentTopic.id === 'singapore-p5' ? getWorlds(currentTopic) : [];

    // Filter sections based on active world
    const getLevelSections = () => {
        if (!activeWorld) return processedSections;
        return processedSections.filter(section => {
            // Simple flexible matching
            return activeWorld.filter.some(keyword => section.title.includes(keyword));
        });
    };

    const visibleSections = currentTopic.id === 'singapore-p5' && viewMode === 'levels'
        ? getLevelSections()
        : processedSections;


    const renderQuestMap = () => {
        // If not P5, fall back to standard grid for now (or apply same logic later)
        if (currentTopic.id !== 'singapore-p5') {
            // ... Standard grid logic ...
            return renderSectionGrid();
        }

        // 1. World Select View
        if (viewMode === 'worlds') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {worlds.map(world => (
                        <div key={world.id} className="h-64">
                            <IslandCard
                                title={world.title}
                                emoji={world.emoji}
                                description={`${world.filter.join(', ')}`}
                                onClick={() => {
                                    setActiveWorld(world);
                                    setViewMode('levels');
                                }}
                                buttonText="Enter World"
                                color="bg-white"
                            />
                        </div>
                    ))}
                </div>
            );
        }

        // 2. Level Select View (Islands)
        return (
            <div className="animate-fade-in">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('worlds')}
                        className="text-slate-500 hover:text-blue-500 font-bold flex items-center gap-2 transition-colors"
                    >
                        <span>←</span> Back to World Map
                    </button>
                    <h2 className="text-2xl font-black text-slate-800">{activeWorld.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {visibleSections.map((section, idx) => (
                        <div key={section.id || idx} className="h-72">
                            <IslandCard
                                title={section.title}
                                emoji={getEmojiForSection(section)}
                                description={section.description || "Start this quest!"}
                                onClick={() => {
                                    // Navigate to section
                                    const actualIndex = processedSections.findIndex(s => s.id === section.id);
                                    setCurrentSectionIndex(actualIndex >= 0 ? actualIndex : 0);
                                }}
                                buttonText="Start Quest"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getEmojiForSection = (section) => {
        const t = section.title.toLowerCase();
        if (t.includes('angle')) return '📐';
        if (t.includes('area')) return '🟥';
        if (t.includes('volume')) return '🧊';
        if (t.includes('perimeter')) return '📏';
        if (t.includes('fraction')) return '🍰';
        if (t.includes('rate')) return '⚡';
        if (t.includes('percentage')) return '💯';
        if (t.includes('data')) return '📈';
        return '⭐';
    };


    // -------------------------------------------------------------------------
    // RENDER HELPERS
    // -------------------------------------------------------------------------

    // (Progress stats moved to top)

    // ... (previous renderSection logic needs to be adapted) ...

    return (
        <main className="min-h-screen bg-sky-50 text-slate-800 selection:bg-blue-100 overflow-x-hidden flex flex-col w-full font-nunito">

            {/* Quest Header */}
            <div className="sticky top-0 z-50 p-4 bg-sky-50/90 backdrop-blur-md border-b border-sky-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Back to Map / Home */}
                    <button
                        onClick={() => {
                            if (currentSectionIndex > 0) {
                                // If inside a module, go back to grid
                                // But wait, currently renderSection handles viewing vs listing.
                                // We need to check if we are 'viewing' a section or 'listing' them.
                                // The original code uses currentSectionIndex to determine this?
                                // Actually, processedSections[currentSectionIndex] determines what is shown.
                                // If currentSectionIndex is the "menu" (usually 0 if using that pattern, but here it seems we moved away from that?) '
                                // Let's simplify: If we are viewing a specific non-root section, Back goes to list.
                                // For now, simple Home button.
                                router.push('/');
                            } else {
                                router.push('/');
                            }
                        }}
                        className="btn-quest-secondary py-2 px-4 text-sm"
                    >
                        🏠 Map
                    </button>

                    {/* Progress Bar */}
                    <div className="hidden sm:flex flex-col w-48">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                            <span>Level {user?.level || 1}</span>
                            <span>{passedQuizzes} / {totalQuizzesTaken} Stars</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 w-1/3" /> {/* Mock progress for now */}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">{user?.name}</span>
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-black shadow-md border-2 border-white">
                        {user?.name?.[0]}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 py-8 relative">
                {/*
                   Logic:
                   If currentSectionIndex points to a "Menu/Grid" placeholder or we are at root -> Show Quest Map.
                   BUT, the existing app logic is: processedSections is a flat list of ALL content.
                   Navigation usually jumps to an index.
                   We need to detect if we should show the "Menu".
                   Usually we check if `currentSectionIndex` is valid.

                   Let's assume we want to show the Quest Map (Grid) when the user is NOT inside a specific lesson step.
                   However, the existing app flattens everything.

                   QUICK FIX:
                   We will stick to the existing behavior: `renderSection()` decides what to show.
                   But we need `renderSection()` to support the "Quest Grid" as the default view.
                   Currently `renderSection()` likely renders the COMPONENT for the current index.

                   We need to verify if `processedSections` has a "Menu" item at index 0?
                   Looking at previous code, `ModuleDashboard` was used when `type === 'menu-item'`.

                   We will modify `renderSection` to use `renderQuestMap` instead of `ModuleDashboard` when appropriate.
                */}

                {renderSection()}
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

