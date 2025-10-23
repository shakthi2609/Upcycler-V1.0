import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult, ProjectIdea, JournalEntry } from './types';
import { analyzeImage, generateProjectImage } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingIndicator from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import ProjectCard from './components/ProjectCard';
import ProjectDetailView from './components/ProjectDetailModal';
import SavedProjects from './components/SavedProjects';
import ChatView from './components/ChatView';
import ApiKeyModal from './components/ApiKeyModal';
import { BackgroundPaths } from './components/ui/background-paths';
import { PulseBeams } from './components/ui/pulse-beams';
import { beams, gradientColors } from './components/ui/beams-config';
import Footer from './components/Footer';
import { Icons } from './components/icons';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
    const [activeTab, setActiveTab] = useState<'new' | 'saved' | 'chat'>('new');
    const [savedProjects, setSavedProjects] = useLocalStorage<ProjectIdea[]>('savedProjects', []);
    const [dislikedProjects, setDislikedProjects] = useLocalStorage<ProjectIdea[]>('dislikedProjects', []);

    const LOADING_STEPS = [
        "Analyzing your items...",
        "Searching for creative inspiration...",
        "Generating project blueprints...",
        "Finalizing the details..."
    ];

    const handleAnalyzeClick = useCallback(async () => {
        if (!apiKey) {
            setError("Please set your API key first.");
            setIsApiKeyModalOpen(true);
            return;
        }

        if (imageFiles.length === 0) {
            setError('Please select at least one image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setActiveTab('new');
        setLoadingStep(0);

        const stepInterval = setInterval(() => {
            setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
        }, 1500);

        try {
            const result = await analyzeImage(imageFiles, apiKey, dislikedProjects);
            
            clearInterval(stepInterval);
            setLoadingStep(LOADING_STEPS.length);

            const projectsWithIds = result.project_ideas.map(p => ({
                ...p,
                id: window.uuid.v4(),
                isGeneratingImage: false,
                imageUrl: undefined,
                journal: [],
            }));
            
            setAnalysisResult({ ...result, project_ideas: projectsWithIds });
            
            if (projectsWithIds.length > 0) {
                handleGenerateSingleImage(projectsWithIds[0].id!, projectsWithIds[0].ai_image_prompt);
            }

        } catch (err) {
            clearInterval(stepInterval);
            if (err instanceof Error) {
                if (err.message.includes("API key is not valid")) {
                    setIsApiKeyModalOpen(true);
                }
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [imageFiles, apiKey, dislikedProjects, LOADING_STEPS.length]);

    const handleGenerateSingleImage = useCallback(async (projectId: string, prompt: string) => {
        const updateProjectState = (updater: (p: ProjectIdea) => ProjectIdea) => {
            setAnalysisResult(prev => {
                if (!prev) return null;
                const newIdeas = prev.project_ideas.map(p => (p.id === projectId ? updater(p) : p));
                return { ...prev, project_ideas: newIdeas };
            });
            setSavedProjects(prev => prev.map(p => (p.id === projectId ? updater(p) : p)));
            setSelectedProject(prev => (prev?.id === projectId ? updater(prev) : prev));
        };
    
        updateProjectState(p => ({ ...p, isGeneratingImage: true, imageError: undefined }));
    
        try {
            const imageUrl = await generateProjectImage(prompt);
            updateProjectState(p => ({ ...p, imageUrl, isGeneratingImage: false }));
        } catch (imgErr) {
            console.error(`Failed to generate image for project ${projectId}:`, imgErr);
            const errorMessage = imgErr instanceof Error ? imgErr.message : "Failed to generate.";
            updateProjectState(p => ({ ...p, isGeneratingImage: false, imageError: errorMessage }));
        }
    }, [setSavedProjects]);
    
    const handleSaveProject = (projectToSave: ProjectIdea) => {
        const isAlreadySaved = savedProjects.some(p => p.project_name === projectToSave.project_name);
        if (!isAlreadySaved) {
            const newProject = { ...projectToSave, id: projectToSave.id || window.uuid.v4(), journal: [] };
            setSavedProjects(prev => [...prev, newProject]);
        }
    };

    const handleDeleteProject = (projectId: string) => {
        setSavedProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
            setSelectedProject(null);
        }
    };

    const handleProjectFeedback = useCallback((projectId: string, feedback: 'up' | 'down') => {
        setAnalysisResult(prev => {
            if (!prev) return null;
            
            const projectToUpdate = prev.project_ideas.find(p => p.id === projectId);
            if (!projectToUpdate) return prev;

            const newFeedback = projectToUpdate.feedback === feedback ? undefined : feedback;

            if (newFeedback === 'down') {
                setDislikedProjects(dPrev => dPrev.find(p => p.id === projectId) ? dPrev : [...dPrev, { ...projectToUpdate, feedback: 'down' }]);
            } else {
                setDislikedProjects(dPrev => dPrev.filter(p => p.id !== projectId));
            }
            
            const newIdeas = prev.project_ideas.map(p =>
                p.id === projectId ? { ...p, feedback: newFeedback } : p
            );
            return { ...prev, project_ideas: newIdeas };
        });
    }, [setDislikedProjects]);

    const handleAddJournalEntry = (projectId: string, entry: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = { ...entry, id: window.uuid.v4(), date: new Date().toISOString() };
        const updatedProjects = savedProjects.map(p => (p.id === projectId ? { ...p, journal: [...(p.journal || []), newEntry] } : p));
        setSavedProjects(updatedProjects);
        setSelectedProject(prev => prev && prev.id === projectId ? updatedProjects.find(p => p.id === projectId)! : prev);
    };
    
    const isProjectSaved = (projectName: string) => savedProjects.some(p => p.project_name === projectName);

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        setIsApiKeyModalOpen(false);
        setError(null);
    };
    
    const TabButton: React.FC<{tabName: 'new' | 'saved' | 'chat', label: string, count?: number}> = ({tabName, label, count}) => {
        const isActive = activeTab === tabName;
        return (
            <button
              onClick={() => setActiveTab(tabName)}
              className={`relative py-2 px-4 text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isActive && <motion.div layoutId="active-tab" className="absolute inset-0 bg-green-600 rounded-full" />}
              <span className="relative z-10 flex items-center">
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className={`ml-2 text-xs font-bold rounded-full px-2 py-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-200'}`}>
                        {count}
                    </span>
                  )}
              </span>
            </button>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
    };

    const renderDashboard = () => (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-8"
        >
             <div className="text-center pt-4">
                <h2 className="text-3xl font-bold text-gray-50">Your Upcycling Workshop</h2>
                <p className="text-gray-400 mt-1">Turn today's trash into tomorrow's treasure.</p>
            </div>
            
            { !isLoading && <ImageUploader onImagesSelect={setImageFiles} onAnalyze={handleAnalyzeClick} isLoading={isLoading} /> }
            
            {isLoading && <LoadingIndicator steps={LOADING_STEPS} currentStep={loadingStep} />}
            <ErrorAlert message={error || ''} />
            
            <div className="mt-12">
                <div className="flex justify-center mb-8">
                    <div className="p-1.5 flex space-x-1 bg-zinc-800/80 rounded-full border border-zinc-700">
                        <TabButton tabName="new" label="New Ideas" count={analysisResult?.project_ideas.length} />
                        <TabButton tabName="saved" label="My Projects" count={savedProjects.length} />
                        <TabButton tabName="chat" label="AI Assistant" />
                    </div>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'new' && analysisResult && (
                             <>
                                {analysisResult.groundingSources && analysisResult.groundingSources.length > 0 && (
                                   <div className="mb-8 p-6 bg-zinc-950/70 rounded-lg border border-zinc-700 animate-appear-zoom">
                                       <h4 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zm3 0a1 1 0 00-1 1v1a1 1 0 001 1h5a1 1 0 001-1V5a1 1 0 00-1-1H9zm-3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H6zm3 0a1 1 0 00-1 1v1a1 1 0 001 1h5a1 1 0 001-1v-1a1 1 0 00-1-1H9zm-3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H6zm3 0a1 1 0 00-1 1v1a1 1 0 001 1h5a1 1 0 001-1v-1a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                           Inspired by these sources
                                       </h4>
                                       <ul className="list-disc list-inside space-y-2 text-sm">
                                           {analysisResult.groundingSources.map((source, index) => ( <li key={index} className="text-gray-400"><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline transition-colors">{source.title || new URL(source.uri).hostname}</a></li>))}
                                       </ul>
                                   </div>
                                )}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                >
                                    {analysisResult.project_ideas.map((project) => (
                                        <ProjectCard key={project.id} project={project} onSelect={setSelectedProject} onSave={handleSaveProject} isSaved={isProjectSaved(project.project_name)} onGenerateImage={() => handleGenerateSingleImage(project.id!, project.ai_image_prompt)} onFeedback={handleProjectFeedback} />
                                    ))}
                                </motion.div>
                            </>
                        )}
                        {activeTab === 'new' && !isLoading && !analysisResult && (
                            <div className="text-center py-16 text-gray-500 bg-zinc-950/50 rounded-lg border-2 border-dashed border-zinc-700">
                                <Icons.lightbulb className="w-16 h-16 mx-auto text-gray-600 mb-4"/>
                                <h3 className="text-lg font-semibold text-gray-300">Awaiting Inspiration</h3>
                                <p>Upload a photo of your items to spark some bright ideas!</p>
                            </div>
                        )}
                        {activeTab === 'saved' && (<SavedProjects projects={savedProjects} onSelect={setSelectedProject} onDelete={handleDeleteProject} />)}
                        {activeTab === 'chat' && <ChatView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
    
    if (!apiKey) {
        return (
            <>
                <BackgroundPaths title="Upcycle AI" buttonText="Enter Your API Key" onButtonClick={() => setIsApiKeyModalOpen(true)} />
                <AnimatePresence>
                    {isApiKeyModalOpen && (<ApiKeyModal onSave={handleSaveApiKey} onClose={() => setIsApiKeyModalOpen(false)} />)}
                </AnimatePresence>
            </>
        );
    }

    return (
        <PulseBeams
            beams={beams}
            gradientColors={gradientColors}
            className="w-full min-h-screen bg-zinc-900 font-sans"
        >
            <AnimatePresence>
                {isApiKeyModalOpen && (<ApiKeyModal onSave={handleSaveApiKey} onClose={() => setIsApiKeyModalOpen(false)} />)}
            </AnimatePresence>
            
            <Header onEditApiKey={() => setIsApiKeyModalOpen(true)} />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {selectedProject ? (
                        <ProjectDetailView key="detail" project={selectedProject} onBack={() => setSelectedProject(null)} onDelete={handleDeleteProject} onAddJournalEntry={handleAddJournalEntry} onGenerateImage={() => { if (selectedProject?.id) { handleGenerateSingleImage(selectedProject.id, selectedProject.ai_image_prompt) } }} />
                    ) : (
                        renderDashboard()
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </PulseBeams>
    );
};

export default App;