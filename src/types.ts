export type BuddyType = 'robot' | 'puppy' | 'dragon';
export type LessonType = 'reading' | 'writing' | 'spelling' | 'quiz' | 'competition';
export type VoiceType = 'male' | 'female';

export interface UserProfile {
  id: string;
  name: string;
  buddyType: BuddyType;
  voiceType: VoiceType;
  gradeLevel: number;
  starCoins: number;
  cloudEnergy: number;
  unlockedIslands: string[];
  focusArea?: string;
  reportCardAnalysis?: string;
  currentOutfit?: string;
  location?: string;
  createdAt: string;
  totalPoints?: number;
}

export interface Match {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  players: {
    [uid: string]: {
      name: string;
      buddyType: BuddyType;
      score: number;
      lastAnsweredAt?: number;
    };
  };
  questions: string[];
  currentQuestionIndex: number;
  winnerId?: string | null;
  config: {
    questionCount: number;
    gradeLevel: number;
  };
  createdAt: number;
}

export interface ProgressLog {
  id: string;
  userId: string;
  lessonId: string;
  type: LessonType;
  score: number;
  feedback: string;
  word?: string;
  timestamp: string;
}

export interface IslandData {
  id: string;
  name: string;
  color: string;
  energyRequired: number;
  lessons: LessonConfig[];
  icon: string;
}

export interface LessonConfig {
  id: string;
  title: string;
  type: LessonType;
  content: string; // The word, sentence, or task
}
