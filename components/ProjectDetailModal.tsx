import React from 'react';
import type { ProjectIdea } from '../types';
import { BackArrowIcon, YouTubeIcon } from './icons';
import ProjectChat from './ProjectChat';

interface ProjectDetailViewProps {
  project: ProjectIdea;
  onBack: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack }) => {
  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-auto p-6 sm:p-8 lg:p-12">
        <div className="mb-8">
            <button
                onClick={onBack}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-semibold text-lg"
            >
                <BackArrowIcon className="w-6 h-6 mr-2" />
                Back to projects
            </button>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-10">
            {/* Left Column */}
            <div className="md:w-5/12">
                {project.imageUrl && (
                    <div className="mb-6">
                        <img src={project.imageUrl} alt={project.project_name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
                    </div>
                )}
                 <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">Materials Needed</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {project.materials_used.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                </div>
                {project.variations_and_alternatives && project.variations_and_alternatives.length > 0 && (
                     <div className="mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Variations & Alternatives</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {project.variations_and_alternatives.map((variation, index) => (
                            <li key={index}>{variation}</li>
                          ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="md:w-7/12">
                <div className="mb-6">
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{project.project_name}</h2>
                  <p className="text-gray-600 mt-3 text-lg">{project.description}</p>
                </div>

                <div className="mb-8 flex items-center space-x-4 text-gray-700">
                   <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColor[project.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                        {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                      </span>
                      <span className="font-medium">Est. Time: {project.time_required}</span>
                </div>
                
                {project.youtube_search_query && (
                  <div className="mb-8">
                     <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(project.youtube_search_query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                      >
                        <YouTubeIcon className="w-6 h-6 mr-3" />
                        Find a Video Tutorial on YouTube
                      </a>
                  </div>
                )}
            </div>
        </div>

      <div className="border-t pt-8 mt-8">
        <h3 className="text-3xl font-semibold text-gray-800 mb-6">Step-by-Step Guide</h3>
        <ol className="list-decimal list-inside space-y-4 text-gray-700 text-base md:text-lg">
          {project.step_by_step_guide.map((step, index) => (
            <li key={index} className="pl-2 leading-relaxed">{step}</li>
          ))}
        </ol>
      </div>
      
      <div className="mt-12">
        <ProjectChat project={project} />
      </div>
    </div>
  );
};

export default ProjectDetailView;