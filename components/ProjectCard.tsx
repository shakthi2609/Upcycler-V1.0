import React from 'react';
import type { ProjectIdea } from '../types';
import { SaveIcon, CheckCircleIcon } from './icons';
import ImagePlaceholder from './ImagePlaceholder';

interface ProjectCardProps {
  project: ProjectIdea;
  onSelect: (project: ProjectIdea) => void;
  onSave: (project: ProjectIdea) => void;
  isSaved: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onSave, isSaved }) => {
  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col">
      {project.imageUrl ? (
        <img src={project.imageUrl} alt={project.project_name} className="w-full h-48 object-cover" />
      ) : (
        <ImagePlaceholder isLoading={project.isGeneratingImage} error={project.imageError} />
      )}
      <div className="p-6 flex-grow cursor-pointer" onClick={() => onSelect(project)}>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.project_name}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{project.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColor[project.difficulty] || 'bg-gray-100 text-gray-800'}`}>
            {project.difficulty}
          </span>
          <span>{project.time_required}</span>
        </div>
      </div>
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <button
          onClick={() => onSave(project)}
          disabled={isSaved}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 ${
            isSaved 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Saved
            </>
          ) : (
            <>
              <SaveIcon className="w-5 h-5 mr-2" />
              Save Project
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;