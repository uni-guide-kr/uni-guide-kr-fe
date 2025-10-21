// Core types for UniGuide platform

export type CourseCategory = 'major-required' | 'major-elective' | 'general-required' | 'general-elective';
export type Semester = 'spring' | 'fall' | 'both';
export type Workload = 'high' | 'medium' | 'low';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  category: CourseCategory;
  department: string;
  description: string;
  prerequisites: string[]; // Course IDs (required)
  recommendedCourses: string[]; // Course IDs (recommended but not required)
  corequisites: string[]; // Course IDs that can be taken simultaneously
  equivalents: string[]; // Courses that are considered the same
  mutuallyExclusive: string[]; // Cannot take both
  offeredIn: Semester;
  recommendedYear?: number;
  area?: string; // For general education requirements
  rating?: number; // Course rating 0-5
  workload?: Workload; // Assignment workload
}

export interface RequirementArea {
  id: string;
  name: string;
  category: CourseCategory;
  requiredCredits: number;
  courses?: string[]; // Specific course IDs (for required courses)
  area?: string; // For general education areas
}

export interface RequirementRule {
  enrollmentYear: number;
  major: string;
  totalCredits: number;
  areas: RequirementArea[];
  minorCredits?: number;
  doubleMajorCredits?: number;
}

export interface CompletedCourse {
  courseId: string;
  semester: string;
  grade?: string;
  credits: number;
}

export interface UserProfile {
  enrollmentYear: number;
  major: string;
  minors?: string[];
  doubleMajor?: string;
  linkedMajor?: string;
  completedCourses: CompletedCourse[];
}

export interface SemesterPlan {
  id: string;
  semester: string; // e.g., "2025-1"
  courses: string[]; // Course IDs
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummary {
  totalRequired: number;
  totalCompleted: number;
  totalPlanned: number;
  areaProgress: {
    areaId: string;
    areaName: string;
    required: number;
    completed: number;
    planned: number;
    remaining: number;
  }[];
}

export interface ValidationIssue {
  type: 'prerequisite' | 'duplicate' | 'credit-limit' | 'mutual-exclusion';
  severity: 'error' | 'warning';
  courseId: string;
  message: string;
  relatedCourses?: string[];
  suggestion?: string;
}

export interface CurriculumSemester {
  year: number; // 1-4
  term: number; // 1 or 2
  courses: string[]; // Course IDs
}

export interface CurriculumPlan {
  id: string;
  name: string;
  semesters: CurriculumSemester[];
  savedCourses: string[]; // Course IDs in the saved pool
  createdAt: string;
  updatedAt: string;
}
