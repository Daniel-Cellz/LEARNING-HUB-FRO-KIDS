import { IslandData } from './types';
import { generateLessonsForGrade } from './data/lessons';

export const ISLANDS: IslandData[] = [
  {
    id: 'grade1',
    name: 'Grade 1 Jungle',
    color: 'bg-green-500',
    energyRequired: 0,
    icon: '🌴',
    lessons: generateLessonsForGrade(1)
  },
  {
    id: 'grade2',
    name: 'Grade 2 Galaxy',
    color: 'bg-purple-600',
    energyRequired: 0,
    icon: '🚀',
    lessons: generateLessonsForGrade(2)
  },
  {
    id: 'grade3',
    name: 'Grade 3 Sweetland',
    color: 'bg-pink-400',
    energyRequired: 0,
    icon: '🍭',
    lessons: generateLessonsForGrade(3)
  },
  {
    id: 'grade4',
    name: 'Grade 4 Forest',
    color: 'bg-emerald-600',
    energyRequired: 0,
    icon: '🌲',
    lessons: generateLessonsForGrade(4)
  },
  {
    id: 'grade5',
    name: 'Grade 5 Peaks',
    color: 'bg-slate-500',
    energyRequired: 0,
    icon: '🏔️',
    lessons: generateLessonsForGrade(5)
  },
  {
    id: 'grade6',
    name: 'Grade 6 Abyss',
    color: 'bg-blue-800',
    energyRequired: 0,
    icon: '🌊',
    lessons: generateLessonsForGrade(6)
  }
];
