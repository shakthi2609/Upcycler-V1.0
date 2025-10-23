import React from 'react';
import { motion } from 'framer-motion';
import type { ProjectIdea } from '../types';
import { Icons } from './icons';
import ImagePlaceholder from './ImagePlaceholder';

interface ProjectCardProps {
  project: ProjectIdea;
  onSelect: (project: ProjectIdea) => void;
  onSave: (project: ProjectIdea) => void;
  isSaved: boolean;
  onGenerateImage: (projectId: string) => void;
  onFeedback: (projectId: string, feedback: 'up' | 'down') => void;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onSave, isSaved, onGenerateImage, onFeedback }) => {
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

  const handleFeedbackClick = (e: React.MouseEvent, feedback: 'up' | 'down') => {
      e.stopPropagation();
      if(project.id) {
          onFeedback(project.id, feedback);
      }
  }

  const isUpvoted = project.feedback === 'up';
  const isDownvoted = project.feedback === 'down';

  return (
    <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden flex flex-col border border-zinc-700 cursor-pointer"
        onClick={() => onSelect(project)}
    >
      <div className="w-full h-48 overflow-hidden">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.project_name} className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder 
            isLoading={project.isGeneratingImage} 
            error={project.imageError}
            onGenerateClick={handleGenerateClick}
          />
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-100 mb-2">{project.project_name}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{project.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-auto">
           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColor[project.difficulty] || 'bg-gray-700 text-gray-300'}`}>
            {project.difficulty}
          </span>
          <span>{project.time_required}</span>
        </div>
      </div>
      <div className="bg-zinc-950/80 p-4 border-t border-zinc-800 flex items-center justify-between">
         <div className="flex items-center space-x-1">
            <button
                onClick={(e) => handleFeedbackClick(e, 'up')}
                aria-label="Like this idea"
                className={`p-2 rounded-full transition-colors ${isUpvoted ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                <Icons.thumbUp className="w-5 h-5" />
            </button>
            <button
                onClick={(e) => handleFeedbackClick(e, 'down')}
                aria-label="Dislike this idea"
                className={`p-2 rounded-full transition-colors ${isDownvoted ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                <Icons.thumbDown className="w-5 h-5" />
            </button>
        </div>
        <button
          onClick={(e) => {
              e.stopPropagation();
              onSave(project);
          }}
          disabled={isSaved}
          className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 ${
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
    </motion.div>
  );
};

export default ProjectCard;
