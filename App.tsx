
import React, { useState, useCallback } from 'react';
import type { AnalysisResult, ProjectIdea } from './types';
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

const App: React.FC = () => {
    const [apiKey, setApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
    const [currentView, setCurrentView] = useState<'home' | 'saved' | 'chat'>('home');
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

        try {
            const result = await analyzeImage(imageFiles, apiKey);
            
            const projectsWithIds = result.project_ideas.map(p => ({
                ...p,
                id: window.uuid.v4(),
                isGeneratingImage: false,
                imageUrl: undefined,
            }));
            
            setAnalysisResult({ ...result, project_ideas: projectsWithIds });

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

    const handleGenerateSingleImage = useCallback(async (projectId: string) => {
        if (!apiKey) {
            setError("Please set your API key before generating images.");
            setIsApiKeyModalOpen(true);
            return;
        }
        
        setAnalysisResult(prev => {
            if (!prev) return null;
            return {
                ...prev,
                project_ideas: prev.project_ideas.map(p =>
                    p.id === projectId ? { ...p, isGeneratingImage: true, imageError: undefined } : p
                ),
            };
        });

        const project = analysisResult?.project_ideas.find(p => p.id === projectId);
        if (!project) return;

        try {
            const imageUrl = await generateProjectImage(project.ai_image_prompt, apiKey);
            setAnalysisResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    project_ideas: prev.project_ideas.map(p =>
                        p.id === projectId ? { ...p, imageUrl, isGeneratingImage: false } : p
                    ),
                };
            });
        } catch (imgErr) {
            console.error(`Failed to generate image for "${project.project_name}":`, imgErr);
            const errorMessage = imgErr instanceof Error ? imgErr.message : "Failed to generate.";
            if (errorMessage.toLowerCase().includes("api key not valid")) {
                setIsApiKeyModalOpen(true);
            }
            setAnalysisResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    project_ideas: prev.project_ideas.map(p =>
                        p.id === projectId ? { ...p, isGeneratingImage: false, imageError: errorMessage } : p
                    ),
                };
            });
        }
    }, [analysisResult, apiKey]);
    
    const handleSaveProject = (projectToSave: ProjectIdea) => {
        const isAlreadySaved = savedProjects.some(p => p.project_name === projectToSave.project_name);
        if (!isAlreadySaved) {
            const newProject = { ...projectToSave, id: projectToSave.id || window.uuid.v4() };
            setSavedProjects(prev => [...prev, newProject]);
        }
    };

    const handleDeleteProject = (projectId: string) => {
        setSavedProjects(prev => prev.filter(p => p.id !== projectId));
    };
    
    const isProjectSaved = (projectName: string) => {
        return savedProjects.some(p => p.project_name === projectName);
    };

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        setIsApiKeyModalOpen(false);
        setError(null); // Clear any previous API key errors
    };

    if (!apiKey) {
        return <ApiKeyModal onSave={setApiKey} />;
    }

    const renderHomeView = () => (
        <div className="space-y-8">
            <ImageUploader
                onImagesSelect={setImageFiles}
                onAnalyze={handleAnalyzeClick}
                isLoading={isLoading}
            />

            {isLoading && <LoadingSpinner />}
            <ErrorAlert message={error || ''} />

            {analysisResult && (
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Upcycling Ideas</h2>
                    <p className="text-center text-gray-600 mb-4">Based on: <span className="font-semibold">{analysisResult.identified_items.join(', ')}</span></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {analysisResult.project_ideas.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onSelect={setSelectedProject}
                                onSave={handleSaveProject}
                                isSaved={isProjectSaved(project.project_name)}
                                onGenerateImage={handleGenerateSingleImage}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderSavedView = () => (
        <div className="mt-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">My Saved Projects</h2>
            <SavedProjects
                projects={savedProjects}
                onSelect={setSelectedProject}
                onDelete={handleDeleteProject}
            />
        </div>
    );
    
    const renderChatView = () => (
        <div className="mt-8">
            <ChatView />
        </div>
    );
    
    const renderCurrentView = () => {
        switch (currentView) {
            case 'home':
                return renderHomeView();
            case 'saved':
                return renderSavedView();
            case 'chat':
                return renderChatView();
            default:
                return renderHomeView();
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {isApiKeyModalOpen && (
                <ApiKeyModal
                    onSave={handleSaveApiKey}
                    onClose={() => setIsApiKeyModalOpen(false)}
                />
            )}
            
            <Header
                currentView={currentView}
                setCurrentView={setCurrentView}
                savedProjectsCount={savedProjects.length}
                onEditApiKey={() => setIsApiKeyModalOpen(true)}
            />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {selectedProject ? (
                    <ProjectDetailView
                        project={selectedProject}
                        onBack={() => setSelectedProject(null)}
                    />
                ) : (
                    renderCurrentView()
                )}
            </main>

        </div>
    );
};

export default App;
