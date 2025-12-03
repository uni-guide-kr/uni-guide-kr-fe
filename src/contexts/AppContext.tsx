import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  SemesterPlan,
  Course,
  RequirementRule,
  ProgressSummary,
  ValidationIssue,
  CompletedCourse,
  CurriculumPlan,
  CurriculumSemester,
} from '../types';
import { COURSES, REQUIREMENT_RULES } from '../data/mockData';

interface AppContextType {
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateCompletedCourses: (courses: CompletedCourse[]) => void;
  
  // Onboarding
  onboardingComplete: boolean;
  completeOnboarding: (profile: UserProfile) => void;
  
  // Course catalog
  courses: Course[];
  getCourseById: (id: string) => Course | undefined;
  getCoursesByIds: (ids: string[]) => Course[];
  
  // Requirements
  requirementRule: RequirementRule | null;
  
  // Progress
  progressSummary: ProgressSummary | null;
  calculateProgress: () => void;
  isCourseCompleted: (courseId: string) => boolean;
  
  // Semester plans
  semesterPlans: SemesterPlan[];
  currentPlan: SemesterPlan | null;
  setCurrentPlan: (plan: SemesterPlan | null) => void;
  createPlan: (semester: string) => void;
  updatePlan: (planId: string, courseIds: string[]) => void;
  deletePlan: (planId: string) => void;
  addCourseToPlan: (courseId: string) => void;
  removeCourseFromPlan: (courseId: string) => void;
  
  // Validation
  validatePlan: (plan: SemesterPlan) => ValidationIssue[];
  
  // Curriculum Builder
  curriculumPlan: CurriculumPlan | null;
  setCurriculumPlan: (plan: CurriculumPlan | null) => void;
  addCourseToSemester: (year: number, term: number, courseId: string) => void;
  removeCourseFromSemester: (year: number, term: number, courseId: string) => void;
  addCourseToSaved: (courseId: string) => void;
  removeCourseFromSaved: (courseId: string) => void;
  moveCourseToSemester: (courseId: string, fromYear: number | null, fromTerm: number | null, toYear: number, toTerm: number) => void;
  toggleSemesterLock: (year: number, term: number) => void;
  setCurrentSemester: (year: number, term: number) => void;
  
  // History (undo)
  canUndo: boolean;
  undo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SemesterPlan | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [requirementRule, setRequirementRule] = useState<RequirementRule | null>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<UserProfile[]>([]);
  const [curriculumPlan, setCurriculumPlanState] = useState<CurriculumPlan | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('uniguide_profile');
    const savedPlans = localStorage.getItem('uniguide_plans');
    const savedOnboarding = localStorage.getItem('uniguide_onboarding');
    const savedCurriculum = localStorage.getItem('uniguide_curriculum');

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfileState(profile);
    }

    if (savedPlans) {
      setSemesterPlans(JSON.parse(savedPlans));
    }

    if (savedOnboarding) {
      setOnboardingComplete(JSON.parse(savedOnboarding));
    }

    if (savedCurriculum) {
      setCurriculumPlanState(JSON.parse(savedCurriculum));
    } else {
      // Initialize with default curriculum plan
      initializeCurriculumPlan();
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('uniguide_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('uniguide_plans', JSON.stringify(semesterPlans));
  }, [semesterPlans]);

  useEffect(() => {
    localStorage.setItem('uniguide_onboarding', JSON.stringify(onboardingComplete));
  }, [onboardingComplete]);

  useEffect(() => {
    if (curriculumPlan) {
      localStorage.setItem('uniguide_curriculum', JSON.stringify(curriculumPlan));
    }
  }, [curriculumPlan]);

  // Update requirement rule when profile changes
  useEffect(() => {
    if (userProfile) {
      const rule = REQUIREMENT_RULES.find(
        (r) => r.enrollmentYear === userProfile.enrollmentYear && r.major === userProfile.major
      );
      setRequirementRule(rule || null);
    }
  }, [userProfile]);

  // Calculate progress when profile or plans change
  useEffect(() => {
    if (userProfile && requirementRule) {
      calculateProgress();
    }
  }, [userProfile, requirementRule, semesterPlans, curriculumPlan]);

  const setUserProfile = (profile: UserProfile | null) => {
    if (profile && userProfile) {
      setHistory([...history.slice(-2), userProfile]);
    }
    setUserProfileState(profile);
  };

  const updateCompletedCourses = (courses: CompletedCourse[]) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, completedCourses: courses });
    }
  };

  const completeOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setOnboardingComplete(true);
  };

  const getCourseById = (id: string) => {
    return COURSES.find((c) => c.id === id);
  };

  const getCoursesByIds = (ids: string[]) => {
    return COURSES.filter((c) => ids.includes(c.id));
  };

  const calculateProgress = () => {
    if (!userProfile || !requirementRule) return;

    // Get completed courses from user profile
    const completedCourseIds = userProfile.completedCourses.map((c) => c.courseId);
    
    // Get completed courses from locked semesters in curriculum plan
    const lockedCourseIds = curriculumPlan 
      ? curriculumPlan.semesters
          .filter(sem => sem.isLocked)
          .flatMap(sem => sem.courses)
      : [];
    
    // Combine both sources of completed courses
    const allCompletedCourseIds = [...new Set([...completedCourseIds, ...lockedCourseIds])];
    
    // Get planned courses from both semesterPlans AND unlocked semesters in curriculumPlan
    const semesterPlansCoursesIds = semesterPlans.flatMap((p) => p.courses);
    const curriculumPlannedCourseIds = curriculumPlan 
      ? curriculumPlan.semesters
          .filter(sem => !sem.isLocked) // Only unlocked semesters
          .flatMap(sem => sem.courses)
      : [];
    
    // Combine and deduplicate planned courses, excluding completed courses
    const allPlannedCourseIds = [...new Set([...semesterPlansCoursesIds, ...curriculumPlannedCourseIds])]
      .filter(id => !allCompletedCourseIds.includes(id));

    const areaProgress = requirementRule.areas.map((area) => {
      let completed = 0;
      let planned = 0;

      if (area.courses) {
        // Specific courses required
        const completedInArea = allCompletedCourseIds.filter((id) => area.courses!.includes(id));
        const plannedInArea = allPlannedCourseIds.filter((id) => area.courses!.includes(id));
        
        completed = completedInArea.reduce((sum, id) => {
          const course = getCourseById(id);
          return sum + (course?.credits || 0);
        }, 0);

        planned = plannedInArea.reduce((sum, id) => {
          const course = getCourseById(id);
          return sum + (course?.credits || 0);
        }, 0);
      } else {
        // Any courses in category/area
        const completedCourses = getCoursesByIds(allCompletedCourseIds).filter(
          (c) => c.category === area.category && (!area.area || c.area === area.area)
        );
        const plannedCourses = getCoursesByIds(allPlannedCourseIds).filter(
          (c) => c.category === area.category && (!area.area || c.area === area.area)
        );

        completed = completedCourses.reduce((sum, c) => sum + c.credits, 0);
        planned = plannedCourses.reduce((sum, c) => sum + c.credits, 0);
      }

      return {
        areaId: area.id,
        areaName: area.name,
        required: area.requiredCredits,
        completed,
        planned,
        remaining: Math.max(0, area.requiredCredits - completed - planned),
      };
    });

    const totalCompleted = areaProgress.reduce((sum, a) => sum + a.completed, 0);
    const totalPlanned = areaProgress.reduce((sum, a) => sum + a.planned, 0);

    setProgressSummary({
      totalRequired: requirementRule.totalCredits,
      totalCompleted,
      totalPlanned,
      areaProgress,
    });
  };

  const createPlan = (semester: string) => {
    const newPlan: SemesterPlan = {
      id: `plan-${Date.now()}`,
      semester,
      courses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSemesterPlans([...semesterPlans, newPlan]);
    setCurrentPlan(newPlan);
  };

  const updatePlan = (planId: string, courseIds: string[]) => {
    setSemesterPlans(
      semesterPlans.map((p) =>
        p.id === planId ? { ...p, courses: courseIds, updatedAt: new Date().toISOString() } : p
      )
    );
    if (currentPlan?.id === planId) {
      setCurrentPlan({ ...currentPlan, courses: courseIds, updatedAt: new Date().toISOString() });
    }
  };

  const deletePlan = (planId: string) => {
    setSemesterPlans(semesterPlans.filter((p) => p.id !== planId));
    if (currentPlan?.id === planId) {
      setCurrentPlan(null);
    }
  };

  const addCourseToPlan = (courseId: string) => {
    if (!currentPlan) return;
    if (currentPlan.courses.includes(courseId)) return;
    
    updatePlan(currentPlan.id, [...currentPlan.courses, courseId]);
  };

  const removeCourseFromPlan = (courseId: string) => {
    if (!currentPlan) return;
    updatePlan(
      currentPlan.id,
      currentPlan.courses.filter((id) => id !== courseId)
    );
  };

  const validatePlan = (plan: SemesterPlan): ValidationIssue[] => {
    if (!userProfile) return [];

    const issues: ValidationIssue[] = [];
    const planCourses = getCoursesByIds(plan.courses);
    const completedIds = userProfile.completedCourses.map((c) => c.courseId);
    const allCompletedAndPlannedIds = [...completedIds, ...plan.courses];

    // Check prerequisites
    planCourses.forEach((course) => {
      const unmetPrereqs = course.prerequisites.filter(
        (prereqId) => !completedIds.includes(prereqId)
      );

      if (unmetPrereqs.length > 0) {
        const prereqNames = unmetPrereqs
          .map((id) => getCourseById(id)?.name || id)
          .join(', ');
        issues.push({
          type: 'prerequisite',
          severity: 'error',
          courseId: course.id,
          message: `${course.name}의 선수과목이 충족��지 않았습니다: ${prereqNames}`,
          relatedCourses: unmetPrereqs,
          suggestion: '선수과목을 먼저 수강하거나 동시수강 가능 여부를 확인하세요.',
        });
      }
    });

    // Check duplicates (already completed)
    planCourses.forEach((course) => {
      if (completedIds.includes(course.id)) {
        issues.push({
          type: 'duplicate',
          severity: 'warning',
          courseId: course.id,
          message: `${course.name}은(는) 이미 이수한 과목입니다.`,
          suggestion: '재수강이 아니라면 계획에서 제거하세요.',
        });
      }
    });

    // Check mutual exclusions
    planCourses.forEach((course) => {
      const conflicts = course.mutuallyExclusive.filter((id) =>
        allCompletedAndPlannedIds.includes(id)
      );

      if (conflicts.length > 0) {
        const conflictNames = conflicts.map((id) => getCourseById(id)?.name || id).join(', ');
        issues.push({
          type: 'mutual-exclusion',
          severity: 'error',
          courseId: course.id,
          message: `${course.name}은(는) 다음 과목과 중복 수강할 수 없습니다: ${conflictNames}`,
          relatedCourses: conflicts,
          suggestion: '둘 중 하나만 선택하세요.',
        });
      }
    });

    // Check credit limit (assuming 18 credits per semester)
    const totalCredits = planCourses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCredits > 18) {
      issues.push({
        type: 'credit-limit',
        severity: 'warning',
        courseId: plan.courses[0], // Just reference first course
        message: `학기당 학점 상한(18학점)을 ${totalCredits - 18}학점 초과했습니다.`,
        suggestion: '일부 과목을 다른 학기로 이동하거나 학점초과 신청을 고려하세요.',
      });
    }

    return issues;
  };

  const undo = () => {
    if (history.length > 0) {
      const previousProfile = history[history.length - 1];
      setUserProfileState(previousProfile);
      setHistory(history.slice(0, -1));
    }
  };

  const initializeCurriculumPlan = () => {
    const semesters: CurriculumSemester[] = [];
    for (let year = 1; year <= 4; year++) {
      for (let term = 1; term <= 2; term++) {
        semesters.push({
          year,
          term,
          courses: [],
          isLocked: false,
        });
      }
    }

    // Lock completed semesters (1-1, 1-2, 2-1)
    semesters[0].isLocked = true; // 1-1
    semesters[1].isLocked = true; // 1-2
    semesters[2].isLocked = true; // 2-1
    
    // Add current semester courses (2-2) with 2025-2 schedule
    // 알고리즘, 데이터베이스 추가
    semesters[3].courses = ['cs202', 'cs302', 'dept102'];

    const newPlan: CurriculumPlan = {
      id: 'curriculum-default',
      name: '나의 커리큘럼',
      semesters,
      savedCourses: [], // Empty saved courses pool
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurriculumPlanState(newPlan);
  };

  const setCurriculumPlan = (plan: CurriculumPlan | null) => {
    setCurriculumPlanState(plan);
  };

  const addCourseToSemester = (year: number, term: number, courseId: string) => {
    if (!curriculumPlan) return;

    const updatedSemesters = curriculumPlan.semesters.map((sem) => {
      if (sem.year === year && sem.term === term) {
        if (!sem.courses.includes(courseId)) {
          return { ...sem, courses: [...sem.courses, courseId] };
        }
      }
      return sem;
    });

    setCurriculumPlanState({
      ...curriculumPlan,
      semesters: updatedSemesters,
      updatedAt: new Date().toISOString(),
    });
  };

  const removeCourseFromSemester = (year: number, term: number, courseId: string) => {
    if (!curriculumPlan) return;

    const updatedSemesters = curriculumPlan.semesters.map((sem) => {
      if (sem.year === year && sem.term === term) {
        return { ...sem, courses: sem.courses.filter((id) => id !== courseId) };
      }
      return sem;
    });

    setCurriculumPlanState({
      ...curriculumPlan,
      semesters: updatedSemesters,
      updatedAt: new Date().toISOString(),
    });
  };

  const addCourseToSaved = (courseId: string) => {
    if (!curriculumPlan) return;
    if (curriculumPlan.savedCourses.includes(courseId)) return;

    setCurriculumPlanState({
      ...curriculumPlan,
      savedCourses: [...curriculumPlan.savedCourses, courseId],
      updatedAt: new Date().toISOString(),
    });
  };

  const removeCourseFromSaved = (courseId: string) => {
    if (!curriculumPlan) return;

    setCurriculumPlanState({
      ...curriculumPlan,
      savedCourses: curriculumPlan.savedCourses.filter((id) => id !== courseId),
      updatedAt: new Date().toISOString(),
    });
  };

  const moveCourseToSemester = (
    courseId: string,
    fromYear: number | null,
    fromTerm: number | null,
    toYear: number,
    toTerm: number
  ) => {
    if (!curriculumPlan) return;

    let updatedSemesters = curriculumPlan.semesters;
    let updatedSavedCourses = curriculumPlan.savedCourses;

    // Remove from source
    if (fromYear !== null && fromTerm !== null) {
      updatedSemesters = updatedSemesters.map((sem) => {
        if (sem.year === fromYear && sem.term === fromTerm) {
          return { ...sem, courses: sem.courses.filter((id) => id !== courseId) };
        }
        return sem;
      });
    } else {
      // From saved courses
      updatedSavedCourses = updatedSavedCourses.filter((id) => id !== courseId);
    }

    // Add to destination
    updatedSemesters = updatedSemesters.map((sem) => {
      if (sem.year === toYear && sem.term === toTerm) {
        if (!sem.courses.includes(courseId)) {
          return { ...sem, courses: [...sem.courses, courseId] };
        }
      }
      return sem;
    });

    setCurriculumPlanState({
      ...curriculumPlan,
      semesters: updatedSemesters,
      savedCourses: updatedSavedCourses,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleSemesterLock = (year: number, term: number) => {
    if (!curriculumPlan) return;

    const updatedSemesters = curriculumPlan.semesters.map((sem) => {
      if (sem.year === year && sem.term === term) {
        return { ...sem, isLocked: !sem.isLocked };
      }
      return sem;
    });

    setCurriculumPlanState({
      ...curriculumPlan,
      semesters: updatedSemesters,
      updatedAt: new Date().toISOString(),
    });
  };

  const setCurrentSemester = (year: number, term: number) => {
    if (!curriculumPlan) return;

    // Set isCurrentSemester to true for the selected semester, false for all others
    const updatedSemesters = curriculumPlan.semesters.map((sem) => {
      return { ...sem, isCurrentSemester: sem.year === year && sem.term === term };
    });

    setCurriculumPlanState({
      ...curriculumPlan,
      semesters: updatedSemesters,
      updatedAt: new Date().toISOString(),
    });
  };

  const isCourseCompleted = (courseId: string): boolean => {
    // Check if course is in user's completed courses
    if (userProfile?.completedCourses.some(c => c.courseId === courseId)) {
      return true;
    }
    
    // Check if course is in a locked semester in curriculum plan
    if (curriculumPlan) {
      const isInLockedSemester = curriculumPlan.semesters.some(
        sem => sem.isLocked && sem.courses.includes(courseId)
      );
      if (isInLockedSemester) {
        return true;
      }
    }
    
    return false;
  };

  const value: AppContextType = {
    userProfile,
    setUserProfile,
    updateCompletedCourses,
    onboardingComplete,
    completeOnboarding,
    courses: COURSES,
    getCourseById,
    getCoursesByIds,
    requirementRule,
    progressSummary,
    calculateProgress,
    isCourseCompleted,
    semesterPlans,
    currentPlan,
    setCurrentPlan,
    createPlan,
    updatePlan,
    deletePlan,
    addCourseToPlan,
    removeCourseFromPlan,
    validatePlan,
    curriculumPlan,
    setCurriculumPlan,
    addCourseToSemester,
    removeCourseFromSemester,
    addCourseToSaved,
    removeCourseFromSaved,
    moveCourseToSemester,
    toggleSemesterLock,
    setCurrentSemester,
    canUndo: history.length > 0,
    undo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};