
import { LessonConfig } from '../types';

// Helper to generate IDs
const gid = (grade: number, type: string, index: number) => `g${grade}-${type}-${index}`;

// Base Word Pools for Writing/Spelling
export const WORD_POOLS: Record<number, string[]> = {
  1: [
    'cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat', 'van', 'can',
    'big', 'dig', 'fig', 'pig', 'wig', 'bit', 'hit', 'sit', 'fit', 'kit',
    'dog', 'log', 'fog', 'hog', 'bog', 'top', 'pop', 'cop', 'hop', 'mop',
    'sun', 'run', 'fun', 'bun', 'gun', 'mud', 'bud', 'cup', 'cut', 'but',
    'bed', 'red', 'fed', 'led', 'met', 'set', 'net', 'pet', 'jet', 'wet'
  ],
  2: [
    'rain', 'tail', 'sail', 'pain', 'mail', 'wait', 'play', 'stay', 'clay', 'pray',
    'feet', 'seed', 'feel', 'week', 'tree', 'free', 'seen', 'keep', 'deep', 'sleep',
    'night', 'light', 'right', 'fight', 'might', 'tight', 'bright', 'flight', 'knight', 'slight',
    'boat', 'road', 'coat', 'toad', 'soap', 'foam', 'roam', 'groan', 'toast', 'coast',
    'blue', 'clue', 'glue', 'true', 'flew', 'blew', 'crew', 'brew', 'chew', 'stew'
  ],
  3: [
    'beautiful', 'different', 'every', 'family', 'favourite', 'friend', 'heard', 'important', 'interested', 'knowledge',
    'language', 'library', 'listen', 'material', 'minute', 'natural', 'necessary', 'neighbour', 'often', 'people',
    'picture', 'problem', 'question', 'really', 'remember', 'school', 'should', 'thought', 'together', 'usually',
    'because', 'believe', 'bought', 'brought', 'caught', 'daughter', 'enough', 'fought', 'though', 'through',
    'address', 'announce', 'appear', 'arrange', 'arrive', 'article', 'attend', 'attract', 'autumn', 'award'
  ],
  4: [
    'accommodate', 'acknowledge', 'acquire', 'aggressive', 'apparent', 'appreciate', 'appropriate', 'approximate', 'argument', 'assessment',
    'atmosphere', 'authority', 'available', 'beneficial', 'catastrophe', 'challenge', 'characteristic', 'collaborate', 'communication', 'community',
    'competition', 'consequence', 'contribute', 'controversy', 'convenience', 'co-operate', 'curiosity', 'curriculum', 'democracy', 'determine',
    'develop', 'dictionary', 'disappear', 'discipline', 'discussion', 'efficient', 'elaborate', 'eliminate', 'embarrass', 'emphasise',
    'environment', 'equipment', 'evaluate', 'evidence', 'exaggerate', 'excellent', 'experience', 'explanation', 'fascinating', 'frequently'
  ],
  5: [
    'abbreviate', 'absurd', 'abundance', 'accelerate', 'accumulate', 'acknowledge', 'acquaintance', 'acquisition', 'adversity', 'aesthetic',
    'alleviate', 'ambiguous', 'amplify', 'analogy', 'anecdote', 'anticipate', 'appendage', 'appreciate', 'archaeology', 'articulate',
    'assertion', 'assessment', 'assimilation', 'atmosphere', 'bureaucracy', 'camouflage', 'catastrophic', 'characteristic', 'chronological', 'circumstance',
    'civilisation', 'collaborate', 'commemorate', 'commentary', 'comprehension', 'conscientious', 'consequence', 'controversial', 'correspondence', 'deteriorate',
    'dilemma', 'diminish', 'discrepancy', 'emphasise', 'endorsement', 'enthusiastic', 'entrepreneur', 'environment', 'equilibrium', 'essentially'
  ],
  6: [
    'aberration', 'abnormality', 'abstraction', 'accommodate', 'accomplishment', 'accountability', 'acknowledgement', 'acquiescence', 'administration', 'adversarial',
    'allegiance', 'alleviation', 'ambivalence', 'amplification', 'annotation', 'anticipation', 'approximation', 'articulation', 'assimilation', 'authentication',
    'bureaucratise', 'camouflaged', 'categorisation', 'characterisation', 'chronological', 'circumstantial', 'collaboration', 'commemoration', 'comprehensive', 'conscientiously',
    'contradictory', 'controversial', 'correspondence', 'deterioration', 'differentiation', 'disproportionate', 'elaboration', 'embarrassment', 'entrepreneurship', 'equilibrium',
    'exaggeration', 'exemplification', 'facilitation', 'fundamental', 'generalisation', 'hypothetical', 'ideological', 'implication', 'inevitable', 'infrastructure'
  ]
};

// Quiz Pool Template
const QUIZ_TEMPLATES: Record<number, string[]> = {
  1: [
    "What is the main idea of 'Sam and the Cat'? | A) Sam is sad | B) Sam and his cat are pals | C) The cat is black | B",
    "Find TWO describing words (adjectives) in 'Sam and the Cat': | A) Fat and tan | B) Sam and Cat | C) Lap and Nap | A",
    "What is the main idea of 'The Big Red Bag'? | A) Jen is lost | B) Jen has a bag with items | C) The bag is blue | B",
    "What fits on Jen's head? | A) Map | B) Pen | C) Hat | C"
  ],
  2: [
    "What is the main idea of 'The Rainy Day'? | A) Lee stayed inside | B) Rain is bad | C) Rainbows are scary | A",
    "What did Lee see in the sky? | A) Plane | B) Rainbow | C) Bird | B",
    "What is the main idea of 'The Little Seed'? | A) A seed grows into a flower | B) Bees are loud | C) Dirt is brown | A",
    "What color flower bloomed? | A) Blue | B) Red | C) Yellow | B"
  ],
  3: [
    "What is the main idea of 'The School Library'? | A) Maria hates reading | B) Libraries are good for travel | C) Books are heavy | B",
    "When did Maria visit the library? | A) Monday | B) Tuesday | C) Friday | B",
    "What is the main idea of 'A Neighbourly Problem'? | A) Weeds are pretty | B) Helping others feels good | C) Tom is lazy | B",
    "How long did they work in the garden? | A) One day | B) One week | C) One month | B"
  ],
  4: [
    "What is the main idea of 'The Power of Communication'? | A) Speaking fast | B) Beneficial skills for everyone | C) Listening is boring | B",
    "What prepares students for world challenges? | A) Sports | B) Practising communication skills | C) Eating healthy | B",
    "What is the main idea of 'Protecting Our Environment'? | A) Heat is good | B) Balancing development and conservation | C) Waste is fine | B",
    "What determines the future world? | A) Money | B) The environment we protect today | C) Technology | B"
  ],
  5: [
    "What is the main idea of 'The Archaeology of Identity'? | A) Pots are old | B) Objects reveal human values and history | C) Digging is fun | B",
    "Why can interpretation be difficult? | A) It's dirty | B) Evidence can be ambiguous | C) Tools are heavy | B",
    "What is the main idea of 'Entrepreneurs Who Changed the World'? | A) Business is easy | B) Problem solving and innovation | C) Taking no risks | B",
    "What helps entrepreneurs overcome adversity? | A) Luck | B) Curiosity and collaborative spirit | C) Speed | B"
  ],
  6: [
    "What is the main idea of 'The Infrastructure of Language'? | A) Words are tools | B) Language is vital for civilization | C) Some languages are better | B",
    "What do linguists study? | A) Building cities | B) How languages change chronologically | C) Only English | B",
    "What is the main idea of 'Critical Thinking in the Age of Information'? | A) Information is free | B) Thinking critically is fundamental | C) Bias is good | B",
    "What is the ultimate goal of education? | A) Getting a job | B) Genuine intellectual autonomy | C) Passing tests | B"
  ]
};

// Reading Pool Template
const POEM_POOL: Record<number, string[]> = {
  1: [
    "Sam has a cat. The cat is fat and tan. Sam pats the cat. The cat sits on his lap. Sam and his cat nap. They are best pals.",
    "Jen has a big red bag. In the bag is a pen, a map, and a hat. Jen puts on the hat. It fits! She takes the map out. She is set to go."
  ],
  2: [
    "It was a rainy day. Lee did not want to stay inside. But Mom said it was too wet. Lee looked out the window. He saw a rainbow in the sky. It had seven colours. He felt happy. Rain is not so bad after all.",
    "A little seed fell in the dirt. The rain came down and the sun shone bright. Days went by. A green shoot poked up. Then leaves came. At last a red flower bloomed. The bee was glad to visit."
  ],
  3: [
    "Maria loved visiting the school library every Tuesday. The shelves were full of beautiful books. She often sat in the quiet corner to read. One day she found a book about natural wonders. It described the autumn colours of forests far away. She thought she would like to visit those places one day. The librarian said reading was the best way to travel without moving.",
    "Tom's neighbour had a problem. Her garden was full of weeds. Tom thought it was important to help. Together they worked every afternoon for a week. They arranged the flower beds and watered the plants. The neighbour was so happy she brought cookies to say thank you. Tom learned that helping others usually feels even better than being helped."
  ],
  4: [
    "Effective communication is one of the most beneficial skills a person can develop. It is not simply about speaking clearly; it involves listening, choosing appropriate words, and understanding the context. In a democratic community, people must collaborate and share ideas openly. When we acknowledge different perspectives without exaggeration or aggression, we create an atmosphere where every voice matters. Practising these skills in school prepares students for the challenges of the wider world.",
    "Scientists frequently evaluate evidence about climate change. The atmosphere around Earth traps heat, and human activities contribute to rising temperatures. Understanding the consequences requires critical thinking and accurate analysis. Communities must determine how to balance development with conservation. Every individual can contribute: reducing waste, saving energy, and appreciating natural resources are all beneficial actions. The environment we protect today determines the world available to future generations."
  ],
  5: [
    "Archaeology is the study of human history through objects left behind. Every civilisation accumulates artefacts that tell its story. A broken pot, a coin, or a written tablet can reveal the values, beliefs, and daily life of people who lived thousands of years ago. This accumulation of evidence allows historians to build chronological narratives. However, interpretation can be ambiguous: scholars sometimes disagree about what objects represent. The dilemma is that we must draw conclusions from incomplete evidence, which requires both scientific rigour and creative thinking.",
    "An entrepreneur is someone who identifies a problem and develops a creative solution, often at personal risk. History is full of enthusiastic individuals whose ideas transformed civilisation. They did not simply anticipate needs; they accelerated change. Many faced catastrophic setbacks but refused to deteriorate in their determination. Their stories are not merely anecdotes of success — they are evidence that conscientious effort, collaborative spirit, and an abundance of curiosity can overcome adversity. In essence, entrepreneurial thinking is a fundamental skill for anyone who wants to contribute meaningfully to society."
  ],
  6: [
    "Language is the fundamental infrastructure of human civilisation. Without it, the collaboration that built cities, science, and culture would be impossible. Linguists study how languages change chronologically, tracing the inevitable deterioration of some dialects and the emergence of new ones. This process is not aberrant; it is a natural consequence of human movement and interaction. The acknowledgement that no language is superior to another is a cornerstone of modern linguistic thought. Every language encodes a unique worldview, and its loss represents an irreplaceable reduction in human diversity.",
    "Critical thinking in an era saturated with information is more fundamental than ever. Accountability demands that we question sources, identify bias, and distinguish between evidence and opinion. Hypothetical scenarios are useful for testing ideas, but they must not be confused with empirical data. Generalisation based on limited examples leads to flawed conclusions. Conscientious readers annotate texts, identify the author's ideological position, and evaluate implications carefully. These skills form the basis of genuine intellectual autonomy."
  ]
};

export function generateLessonsForGrade(grade: number): LessonConfig[] {
  const lessons: LessonConfig[] = [];
  const words = WORD_POOLS[grade] || WORD_POOLS[1];
  const quizzes = QUIZ_TEMPLATES[grade] || QUIZ_TEMPLATES[1];
  const poems = POEM_POOL[grade] || POEM_POOL[1];

  // Generate 100+ lessons
  for (let i = 1; i <= 104; i++) {
    const typeRoll = i % 4;
    if (typeRoll === 0) {
      // Quiz
      const quiz = quizzes[i % quizzes.length];
      const title = quiz.split('|')[0].trim().substring(0, 20);
      lessons.push({ id: gid(grade, 'quiz', i), title: `Quiz: ${title}`, type: 'quiz', content: quiz });
    } else if (typeRoll === 1) {
      // Writing
      const word = words[i % words.length];
      lessons.push({ id: gid(grade, 'writing', i), title: `Write: ${word}`, type: 'writing', content: word });
    } else if (typeRoll === 2) {
      // Spelling
      const word = words[i % words.length];
      lessons.push({ id: gid(grade, 'spelling', i), title: `Spell: ${word}`, type: 'spelling', content: word });
    } else {
      // Reading
      const poem = poems[i % poems.length];
      lessons.push({ id: gid(grade, 'reading', i), title: `Level ${i} Reading`, type: 'reading', content: poem });
    }
  }

  return lessons;
}
