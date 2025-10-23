import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ProjectIdea, JournalEntry } from '../types';
import { Icons } from './icons';
import ProjectChat from './ProjectChat';
import ImagePlaceholder from './ImagePlaceholder';

interface ProjectDetailViewProps {
  project: ProjectIdea;
  onBack: () => void;
  onDelete: (projectId: string) => void;
  onAddJournalEntry: (projectId: string, entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onGenerateImage: () => void;
}

const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-zinc-950/70 p-4 rounded-lg border border-zinc-700 flex items-center space-x-4">
        <div className="flex-shrink-0 text-green-400">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-gray-400">{title}</h4>
            <div className="text-base font-medium text-gray-200">{children}</div>
        </div>
    </div>
);

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack, onDelete, onAddJournalEntry, onGenerateImage }) => {
  const [newNote, setNewNote] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEntry = () => {
    if (!newNote.trim() && !newPhoto) return;
    onAddJournalEntry(project.id!, { note: newNote, photoUrl: newPhoto || undefined });
    setNewNote('');
    setNewPhoto(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-xl max-w-5xl w-full mx-auto p-6 sm:p-8 lg:p-12 border border-zinc-700"
    >
        <div className="flex justify-between items-start mb-8">
            <button
                onClick={onBack}
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors font-semibold text-lg"
            >
                <Icons.backArrow className="w-6 h-6 mr-2" />
                Back to Workshop
            </button>
            <button
                onClick={() => onDelete(project.id!)}
                className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors font-semibold text-sm"
            >
                <Icons.trash className="w-5 h-5 mr-1" />
                Delete Project
            </button>
        </div>
        
        <div className="mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-50 leading-tight">{project.project_name}</h2>
            <p className="text-gray-400 mt-3 text-lg">{project.description}</p>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-10">
            {/* Left Column */}
            <div className="md:w-6/12 lg:w-5/12">
                <div className="mb-6 w-full aspect-w-4 aspect-h-3 rounded-lg shadow-lg overflow-hidden border border-zinc-700">
                    {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.project_name} className="w-full h-full object-cover" />
                    ) : (
                        <ImagePlaceholder 
                            isLoading={project.isGeneratingImage}
                            error={project.imageError}
                            onGenerateClick={onGenerateImage}
                        />
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Fix: Added children to the InfoCard component to display the project difficulty, resolving the missing 'children' prop error. */}
                    <InfoCard icon={<Icons.wrench className="w-6 h-6" />} title="Difficulty">
                        <span className="capitalize">{project.difficulty}</span>
                    </InfoCard>
                    {/* Fix: Added children to the InfoCard component to display the required time, resolving the missing 'children' prop error. */}
                    <InfoCard icon={<Icons.clock className="w-6 h-6" />} title="Time Required">
                        {project.time_required}
                    </InfoCard>
                </div>
                <div className="mb-6">
                    {/* Fix: Added children to the InfoCard component to display the list of materials, resolving the missing 'children' prop error. */}
                    <InfoCard icon={<Icons.list className="w-6 h-6" />} title="Materials Needed">
                        <ul className="list-disc list-inside text-sm">
                          {project.materials_used.map((material, index) => (
                            <li key={index}>{material}</li>
                          ))}
                        </ul>
                    </InfoCard>
                </div>
            </div>

            {/* Right Column */}
            <div className="md:w-6/12 lg:w-7/12">
                <div className="border-t-2 border-green-500/50 pt-6 mb-8">
                    <h3 className="text-3xl font-semibold text-gray-100 mb-6">Step-by-Step Guide</h3>
                    <ol className="space-y-6">
                      {project.step_by_step_guide.map((step, index) => (
                        <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-zinc-800 border border-zinc-700 text-green-400 font-bold rounded-full mr-4">
                                {index + 1}
                            </div>
                            <p className="text-gray-300 text-base md:text-lg leading-relaxed pt-0.5">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                
                {project.variations_and_alternatives && project.variations_and_alternatives.length > 0 && (
                     <div className="mb-8 mt-10">
                        <h3 className="text-2xl font-semibold text-gray-100 mb-4">Variations & Alternatives</h3>
                        <div className="bg-zinc-950/70 p-4 rounded-lg border border-zinc-700">
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                              {project.variations_and_alternatives.map((variation, index) => (
                                <li key={index}>{variation}</li>
                              ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                {project.youtube_search_query && (
                  <div className="mt-10">
                     <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(project.youtube_search_query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-200 ease-in-out"
                      >
                        <Icons.youTube className="w-6 h-6 mr-3" />
                        Find a Video Tutorial on YouTube
                      </a>
                  </div>
                )}
            </div>
        </div>

       <div className="border-t border-zinc-700 pt-8 mt-10">
          <h3 className="text-3xl font-semibold text-gray-100 mb-6">My Project Journal</h3>
          <div className="bg-zinc-950/70 p-6 rounded-lg border border-zinc-700">
            <div className="space-y-4 mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about your progress..."
                className="w-full p-3 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-800 text-gray-200"
                rows={3}
              />
              <div className="flex items-center space-x-4">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-700 text-green-300 border border-zinc-600 rounded-md hover:bg-zinc-600">
                    <Icons.image className="w-5 h-5 mr-2" />
                    {newPhoto ? 'Change Photo' : 'Add Photo'}
                </label>
                {newPhoto && <img src={newPhoto} alt="Preview" className="w-16 h-16 object-cover rounded-md" />}
              </div>
            </div>
            <button
                onClick={handleAddEntry}
                disabled={!newNote.trim() && !newPhoto}
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
            >
                Add Journal Entry
            </button>
          </div>
          <div className="mt-6 space-y-6">
            {project.journal && project.journal.length > 0 ? (
                project.journal.slice().reverse().map(entry => (
                    <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-zinc-950/50 border-zinc-700">
                        {entry.photoUrl && <img src={entry.photoUrl} alt="Journal entry" className="w-24 h-24 object-cover rounded-md" />}
                        <div className="flex-1">
                            <p className="text-gray-300 whitespace-pre-wrap">{entry.note}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(entry.date).toLocaleString()}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 py-4">No journal entries yet.</p>
            )}
          </div>
      </div>
      
      <div className="mt-12">
        <ProjectChat project={project} />
      </div>
    </motion.div>
  );
};

export default ProjectDetailView;