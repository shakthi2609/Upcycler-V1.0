

import React from 'react';
import type { ProjectIdea } from '../types';
import { Icons } from './icons';
import ImagePlaceholder from './ImagePlaceholder';

interface SavedProjectsProps {
  projects: ProjectIdea[];
  onSelect: (project: ProjectIdea) => void;
  onDelete: (projectId: string) => void;
}

const SavedProjects: React.FC<SavedProjectsProps> = ({ projects, onSelect, onDelete }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-300">No saved projects</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by analyzing a photo of your waste items!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <div key={project.id} className="bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300 ease-in-out border border-zinc-700">
          {project.imageUrl ? (
            <img src={project.imageUrl} alt={project.project_name} className="w-full h-48 object-cover" />
          ) : (
            <ImagePlaceholder isLoading={false} />
          )}
          <div className="p-6 flex-grow cursor-pointer" onClick={() => onSelect(project)}>
            <h3 className="text-xl font-bold text-gray-100 mb-2">{project.project_name}</h3>
            <p className="text-gray-400 text-sm">{project.description}</p>
          </div>
          <div className="bg-zinc-950/80 p-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id!);
              }}
              className="flex items-center text-red-500 hover:text-red-400 transition-colors"
            >
              <Icons.trash className="w-5 h-5 mr-1" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedProjects;