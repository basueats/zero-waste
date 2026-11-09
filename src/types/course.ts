export interface LearningOutcome {
  id: string;
  verb: string;
  text: string;
}

export interface ScrapWasteMetrics {
  wasteDivertedPercentage: string;
  householdAnnualSavingsUSD: string;
  co2ReductionKg: string;
}

export interface LessonSection {
  heading: string;
  content: string;
  formulaBox?: {
    title: string;
    ratioOrStep: string;
    safetyNote?: string;
  };
}

export interface VideoQuizCheckpoint {
  id: string;
  timestampSeconds: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface VideoTranscriptItem {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
}

export interface VideoMasterclass {
  title: string;
  durationSeconds: number;
  posterImage: string;
  instructor: string;
  instructorRole: string;
  videoType: 'masterclass' | 'demonstration' | 'lab_audit';
  checkpoints: VideoQuizCheckpoint[];
  transcript: VideoTranscriptItem[];
}

export interface Lesson {
  id: string;
  title: string;
  topicType?: 'concept' | 'case_study' | 'summary';
  readTimeMinutes: number;
  newsletterRef?: number[];
  heroImage?: string;
  imageCaption?: string;
  video?: VideoMasterclass;
  sections: LessonSection[];
  scrapWasteMetrics?: ScrapWasteMetrics;
  keyTakeaways: string[];
  quickKnowledgeCheck?: AssessmentQuestion;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleAssessment {
  id: string;
  title: string;
  passingGrade: number; // e.g. 80
  questions: AssessmentQuestion[];
}

export interface ModuleSummary {
  title: string;
  keyTakeaways: string[];
  operationalChecklist: string[];
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  estimatedHours: number;
  newsletterRange: string;
  learningOutcomes: string[];
  lessons: Lesson[];
  summary?: ModuleSummary;
  assessment?: ModuleAssessment;
  isCompleted?: boolean;
}

export interface CourseOverview {
  id: string;
  title: string;
  category: string;
  accreditationLevel: string;
  totalModules: number;
  totalHours: number;
  totalNewslettersCovered: number;
  originalNewsletterTitle: string;
  originalNewsletterUrl: string;
  alisonTopicUrl: string;
  description: string;
  modules: CourseModule[];
}

export interface NewsletterIndexItem {
  issueNumber: number;
  title: string;
  category: 'Root-to-Stem' | 'Fermentation & Pickling' | 'Protein & Broths' | 'Bakery & Grains' | 'Dairy & Fats' | 'Pantry & Preservation' | 'Energy & Equipment' | 'Commercial & Systems';
  primaryScrap: string;
  moduleMapped: number;
  summary: string;
}
