import React from 'react';
import type { ProjectIdea } from '../types';
import { Icons } from './icons';
import ImagePlaceholder from './ImagePlaceholder';
import { motion } from 'framer-motion';

interface SavedProjectsProps {
  projects: ProjectIdea[];
  onSelect: (project: ProjectIdea) => void;
  onDelete: (projectId: string) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};


const SavedProjects: React.FC<SavedProjectsProps> = ({ projects, onSelect, onDelete }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 bg-zinc-950/50 rounded-lg border-2 border-dashed border-zinc-700">
        <Icons.folder className="w-16 h-16 mx-auto text-gray-600 mb-4"/>
        <h3 className="text-lg font-semibold text-gray-300">Your Workshop is Empty</h3>
        <p>Save your favorite project ideas to find them here later.</p>
      </div>
    );
  }

  return (
    <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {projects.map((project) => (
        <motion.div
            key={project.id}
            variants={itemVariants}
            className="bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300 ease-in-out border border-zinc-700"
        >
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
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SavedProjects;