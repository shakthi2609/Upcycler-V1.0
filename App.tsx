import React, { useState, useCallback } from 'react';
import type { AnalysisResult, ProjectIdea, JournalEntry } from './types';
import { analyzeImage, generateProjectImage } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import ProjectCard from './components/ProjectCard';
import ProjectDetailView from './components/ProjectDetailModal';
import SavedProjects from './components/SavedProjects';
import ChatView from './components/ChatView';
import ApiKeyModal from './components/ApiKeyModal';
import { BackgroundPaths } from './components/ui/background-paths';
import { Glow } from './components/ui/glow';
import { Icons } from './components/icons';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
    const [activeTab, setActiveTab] = useState<'new' | 'saved' | 'chat'>('new');
    const [savedProjects, setSavedProjects] = useLocalStorage<ProjectIdea[]>('savedProjects', []);

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

        try {
            const result = await analyzeImage(imageFiles, apiKey);
            
            const projectsWithIds = result.project_ideas.map(p => ({
                ...p,
                id: window.uuid.v4(),
                isGeneratingImage: false,
                imageUrl: undefined,
                journal: [],
            }));
            
            setAnalysisResult({ ...result, project_ideas: projectsWithIds });
            
            // V2 Feature: Auto-generate the first image for immediate "wow" factor
            if (projectsWithIds.length > 0) {
                handleGenerateSingleImage(projectsWithIds[0].id!, projectsWithIds[0].ai_image_prompt);
            }

        } catch (err) {
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
    }, [imageFiles, apiKey]);

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

    const handleAddJournalEntry = (projectId: string, entry: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = {
            ...entry,
            id: window.uuid.v4(),
            date: new Date().toISOString(),
        };
        const updatedProjects = savedProjects.map(p => {
            if (p.id === projectId) {
                return { ...p, journal: [...(p.journal || []), newEntry] };
            }
            return p;
        });
        setSavedProjects(updatedProjects);
        // Also update the selected project view in real-time
        setSelectedProject(prev => prev && prev.id === projectId ? updatedProjects.find(p => p.id === projectId)! : prev);
    };
    
    const isProjectSaved = (projectName: string) => {
        return savedProjects.some(p => p.project_name === projectName);
    };

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
              className={`py-3 px-5 text-center font-semibold rounded-t-lg border-b-4 transition-colors focus:outline-none ${
                isActive 
                ? 'border-green-500 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className={`ml-2 text-xs font-bold rounded-full px-2 py-0.5 ${isActive ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {count}
                </span>
              )}
            </button>
        )
    }

    const renderDashboard = () => (
        <div className="space-y-8">
             <div className="text-center pt-4">
                <h2 className="text-3xl font-bold text-gray-50">Your Upcycling Workshop</h2>
                <p className="text-gray-400 mt-1">Turn today's trash into tomorrow's treasure.</p>
            </div>
            <ImageUploader
                onImagesSelect={setImageFiles}
                onAnalyze={handleAnalyzeClick}
                isLoading={isLoading}
            />

            {isLoading && <LoadingSpinner />}
            <ErrorAlert message={error || ''} />
            
            <div className="mt-12">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex justify-center space-x-6" aria-label="Tabs">
                        <TabButton tabName="new" label="New Ideas" count={analysisResult?.project_ideas.length} />
                        <TabButton tabName="saved" label="My Projects" count={savedProjects.length} />
                        <TabButton tabName="chat" label="AI Assistant" />
                    </nav>
                </div>
                
                <div className="pt-8">
                    {activeTab === 'new' && analysisResult && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {analysisResult.project_ideas.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onSelect={setSelectedProject}
                                    onSave={handleSaveProject}
                                    isSaved={isProjectSaved(project.project_name)}
                                    onGenerateImage={() => handleGenerateSingleImage(project.id!, project.ai_image_prompt)}
                                />
                            ))}
                        </div>
                    )}
                    {activeTab === 'new' && !isLoading && !analysisResult && (
                        <div className="text-center py-12 text-gray-500">
                            <Icons.checkCircle className="w-16 h-16 mx-auto text-gray-600 mb-2"/>
                            <p>Analyzed ideas will appear here.</p>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <SavedProjects
                            projects={savedProjects}
                            onSelect={setSelectedProject}
                            onDelete={handleDeleteProject}
                        />
                    )}
                    
                    {activeTab === 'chat' && <ChatView />}
                </div>
            </div>
        </div>
    );
    
    if (!apiKey) {
        return (
            <>
                <BackgroundPaths
                    title="Upcycle AI v2"
                    buttonText="Enter Your API Key"
                    onButtonClick={() => setIsApiKeyModalOpen(true)}
                />
                {isApiKeyModalOpen && (
                    <ApiKeyModal
                        onSave={handleSaveApiKey}
                        onClose={() => setIsApiKeyModalOpen(false)}
                    />
                )}
            </>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-zinc-900 overflow-hidden font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Glow className="opacity-50 scale-125 blur-3xl" />
            </div>
            {isApiKeyModalOpen && (
                <ApiKeyModal
                    onSave={handleSaveApiKey}
                    onClose={() => setIsApiKeyModalOpen(false)}
                />
            )}
            
            <div className="relative z-10 w-full h-full overflow-y-auto">
                <Header onEditApiKey={() => setIsApiKeyModalOpen(true)} />

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {selectedProject ? (
                        <ProjectDetailView
                            project={selectedProject}
                            onBack={() => setSelectedProject(null)}
                            onDelete={handleDeleteProject}
                            onAddJournalEntry={handleAddJournalEntry}
                            onGenerateImage={() => {
                                if (selectedProject?.id) {
                                    handleGenerateSingleImage(selectedProject.id, selectedProject.ai_image_prompt)
                                }
                            }}
                        />
                    ) : (
                        renderDashboard()
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;