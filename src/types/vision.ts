export interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export type InterviewPhase = 'personalization' | 'narrative' | 'clustering' | 'hardening' | 'complete';

export interface VisionTile {
  name: string;
  snapshot: string;
  actions: string[];
  routine: string;
}

export interface VisionOutput {
  narrative: string;
  tiles: VisionTile[];
  dallePrompt?: string;
  mermaidCode?: string;
}

export interface SavedVision {
  id: string;
  user_id: string;
  conversation_history: Message[];
  goals: string[];
  narrative: string;
  vision_output: VisionOutput | null;
  phase: InterviewPhase;
  user_name: string;
  user_gender: 'male' | 'female';
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}
