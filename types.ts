export interface ProjectIdea {
  id?: string; // Add optional ID for saved projects
  project_name: string;
  description: string;
  materials_used: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_required: string;
  step_by_step_guide: string[];
  variations_and_alternatives: string[];
  ai_image_prompt: string;
  youtube_search_query: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
}

export interface AnalysisResult {
  identified_items: string[];
  project_ideas: ProjectIdea[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// Add a declaration for the uuid library loaded from CDN
declare global {
    interface Window {
        uuid: {
            v4: () => string;
        };
    }
}