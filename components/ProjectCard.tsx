import React from 'react';
import type { ProjectIdea } from '../types';
import { Icons } from './icons';
import ImagePlaceholder from './ImagePlaceholder';

interface ProjectCardProps {
  project: ProjectIdea;
  onSelect: (project: ProjectIdea) => void;
  onSave: (project: ProjectIdea) => void;
  isSaved: boolean;
  onGenerateImage: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onSave, isSaved, onGenerateImage }) => {
  const difficultyColor = {
    beginner: 'bg-green-900/50 text-green-300',
    intermediate: 'bg-yellow-900/50 text-yellow-300',
    advanced: 'bg-red-900/50 text-red-300',
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onSelect from firing
    if (project.id) {
        onGenerateImage(project.id);
    }
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col border border-zinc-700">
      {project.imageUrl ? (
        <img src={project.imageUrl} alt={project.project_name} className="w-full h-48 object-cover" />
      ) : (
        <ImagePlaceholder 
          isLoading={project.isGeneratingImage} 
          error={project.imageError}
          onGenerateClick={handleGenerateClick}
        />
      )}
      <div className="p-6 flex-grow cursor-pointer" onClick={() => onSelect(project)}>
        <h3 className="text-xl font-bold text-gray-100 mb-2">{project.project_name}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{project.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColor[project.difficulty] || 'bg-gray-700 text-gray-300'}`}>
            {project.difficulty}
          </span>
          <span>{project.time_required}</span>
        </div>
      </div>
      <div className="bg-zinc-950/80 p-4 border-t border-zinc-800">
        <button
          onClick={() => onSave(project)}
          disabled={isSaved}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 ${
            isSaved 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500'
          }`}
        >
          {isSaved ? (
            <>
              <Icons.checkCircle className="w-5 h-5 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Icons.save className="w-5 h-5 mr-2" />
              Save Project
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;