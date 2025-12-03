import React, { useState } from 'react';
import { X, Sparkles, Target, Calendar, AlertTriangle, Check, Loader2, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useApp } from '../../contexts/AppContext';

interface CurriculumWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type RecommendationType = 'career-focused' | 'graduation-optimized';

interface WizardState {
  step: 'career' | 'type' | 'loading-courses' | 'course-selection' | 'loading-curriculum' | 'result';
  careerGoal: string;
  customCareerInput: string;
  recommendationType: RecommendationType | null;
  recommendedCourses: string[];
  selectedCourses: string[]; // Initially empty, will be populated when courses are recommended
  generatedCurriculum: GeneratedCurriculum | null;
  error: string | null;
}

interface GeneratedCurriculum {
  semesters: Array<{
    year: number;
    term: number;
    courses: string[];
  }>;
  totalSemesters: number;
  warning?: string;
}

const CAREER_PRESETS = [
  { id: 'backend', name: '백엔드 개발자', icon: '🖥️' },
  { id: 'frontend', name: '프론트엔드 개발자', icon: '🎨' },
  { id: 'fullstack', name: '풀스택 개발자', icon: '⚡' },
  { id: 'ai', name: 'AI 엔지니어', icon: '🤖' },
  { id: 'data-science', name: '데이터 사이언티스트', icon: '📊' },
  { id: 'mobile', name: '모바일 개발자', icon: '📱' },
  { id: 'game', name: '게임 개발자', icon: '🎮' },
  { id: 'security', name: '보안 전문가', icon: '🔒' },
  { id: 'custom', name: '직접 입력', icon: '✏️' },
];

const RECOMMENDATION_TYPES = [
  { 
    id: 'career-focused' as RecommendationType, 
    name: '진로 적합형', 
    icon: '🎯', 
    description: '진로에 최적화된 과목 중심',
    details: '목표 진로에 가장 적합한 과목들을 우선 배치합니다. 실무 역량을 극대화하는 커리큘럼입니다.'
  },
  { 
    id: 'graduation-optimized' as RecommendationType, 
    name: '졸업 최적형', 
    icon: '🎓', 
    description: '졸업 요건 충족 중심',
    details: '졸업 요건을 가장 효율적으로 충족하는 과목들을 배치합니다. 안정적인 학점 관리가 가능합니다.'
  },
];

export const CurriculumWizard: React.FC<CurriculumWizardProps> = ({ isOpen, onClose }) => {
  const { userProfile, courses, getCourseById, curriculumPlan, setCurriculumPlan } = useApp();
  
  const [state, setState] = useState<WizardState>({
    step: 'career',
    careerGoal: '',
    customCareerInput: '',
    recommendationType: null,
    recommendedCourses: [],
    selectedCourses: [], // Initially empty, will be populated when courses are recommended
    generatedCurriculum: null,
    error: null,
  });

  const handleCareerNext = () => {
    if (state.customCareerInput.trim()) {
      setState(prev => ({ ...prev, careerGoal: state.customCareerInput, step: 'type' }));
    }
  };

  const handlePresetSelect = (presetGoal: string) => {
    setState(prev => ({ ...prev, customCareerInput: presetGoal }));
  };

  const handleTypeSelect = async (type: RecommendationType) => {
    setState(prev => ({ ...prev, recommendationType: type, step: 'loading-courses' }));
    
    // Simulate AI processing for course recommendation
    setTimeout(() => {
      try {
        const recommendedCourses = getRecommendedMajorCourses(
          state.careerGoal === 'custom' ? state.customCareerInput : state.careerGoal, 
          type
        );
        // Initialize selectedCourses with all recommended courses
        setState(prev => ({ ...prev, recommendedCourses, selectedCourses: recommendedCourses, step: 'course-selection' }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'AI 추천 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
          step: 'result'
        }));
      }
    }, 2000);
  };

  const getRecommendedMajorCourses = (career: string, type: RecommendationType): string[] => {
    const completedCourses = userProfile?.completedCourses.map(c => c.courseId) || [];
    
    // Filter only major courses (전공필수 + 전공선택)
    const majorCourses = courses.filter(c => 
      (c.category === 'major-required' || c.category === 'major-elective') && 
      !completedCourses.includes(c.id)
    );
    
    // Career-specific course priorities
    const careerPriorities: Record<string, string[]> = {
      backend: ['cs301', 'cs302', 'cs314', 'cs316'],
      frontend: ['cs311', 'cs315', 'cs316'],
      fullstack: ['cs311', 'cs302', 'cs314', 'cs316', 'cs315'],
      ai: ['cs312', 'cs202'],
      'data-science': ['cs312', 'cs302'],
      mobile: ['cs311', 'cs313'],
      game: ['cs311', 'cs315'],
      security: ['cs314', 'cs301', 'cs302'],
    };

    let priorityCourses = careerPriorities[career.toLowerCase()] || [];
    
    // For career-focused type, prioritize high careerFit courses
    if (type === 'career-focused') {
      return majorCourses
        .sort((a, b) => {
          // First, prioritize courses in priority list
          const aPriority = priorityCourses.indexOf(a.id);
          const bPriority = priorityCourses.indexOf(b.id);
          
          if (aPriority !== -1 && bPriority !== -1) {
            return aPriority - bPriority;
          }
          if (aPriority !== -1) return -1;
          if (bPriority !== -1) return 1;
          
          // Then sort by careerFit
          return (b.careerFit || 0) - (a.careerFit || 0);
        })
        .map(c => c.id);
    } else {
      // For graduation-optimized, prioritize required courses and easier workload
      return majorCourses
        .sort((a, b) => {
          // Required courses first
          if (a.category === 'major-required' && b.category !== 'major-required') return -1;
          if (a.category !== 'major-required' && b.category === 'major-required') return 1;
          
          // Then by workload (easier first)
          const workloadOrder = { 'low': 1, 'medium': 2, 'high': 3 };
          const aWorkload = workloadOrder[a.workload || 'medium'];
          const bWorkload = workloadOrder[b.workload || 'medium'];
          
          return aWorkload - bWorkload;
        })
        .map(c => c.id);
    }
  };

  const handleToggleCourse = (courseId: string) => {
    setState(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const handleSelectAll = () => {
    setState(prev => ({
      ...prev,
      selectedCourses: prev.recommendedCourses
    }));
  };

  const handleDeselectAll = () => {
    setState(prev => ({
      ...prev,
      selectedCourses: []
    }));
  };

  const handleApproveCourses = () => {
    setState(prev => ({ ...prev, step: 'loading-curriculum' }));
    
    // Simulate AI processing for curriculum generation
    setTimeout(() => {
      try {
        const curriculum = generateCurriculum(state.selectedCourses);
        setState(prev => ({ ...prev, generatedCurriculum: curriculum, step: 'result', error: null }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'AI 추천 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
          step: 'result'
        }));
      }
    }, 2000);
  };

  const generateCurriculum = (selectedCourseIds: string[]): GeneratedCurriculum => {
    const completedCourses = userProfile?.completedCourses.map(c => c.courseId) || [];
    
    // Get the selected courses
    const selectedCourses = selectedCourseIds
      .map(id => getCourseById(id))
      .filter(c => c !== null);
    
    // Sort courses by prerequisites
    const sortedCourses = [...selectedCourses].sort((a, b) => {
      return a!.prerequisites.length - b!.prerequisites.length;
    });

    const semesters: Array<{ year: number; term: number; courses: string[] }> = [];
    const remainingCourses = [...sortedCourses];
    
    let currentYear = 1;
    let currentTerm = 1;
    let assignedCourses = new Set<string>(completedCourses);
    const creditsPerSemester = 18;

    while (remainingCourses.length > 0 && currentYear <= 5) {
      const semesterCourses: string[] = [];
      let semesterCredits = 0;

      for (let i = 0; i < remainingCourses.length; i++) {
        const course = remainingCourses[i];
        if (!course) continue;
        
        // Check if prerequisites are met
        const prerequisitesMet = course.prerequisites.every(prereqId => 
          assignedCourses.has(prereqId)
        );

        if (!prerequisitesMet) continue;

        // Check if adding this course exceeds credit limit
        if (semesterCredits + course.credits <= creditsPerSemester) {
          semesterCourses.push(course.id);
          semesterCredits += course.credits;
          assignedCourses.add(course.id);
          remainingCourses.splice(i, 1);
          i--;
        }
      }

      if (semesterCourses.length > 0) {
        semesters.push({
          year: currentYear,
          term: currentTerm,
          courses: semesterCourses,
        });
      }

      // Move to next semester
      if (currentTerm === 2) {
        currentYear++;
        currentTerm = 1;
      } else {
        currentTerm++;
      }

      // Safety check
      if (semesters.length > 10) break;
    }

    const totalSemesters = semesters.length;
    const warning = totalSemesters > 8 
      ? `이 계획은 ${totalSemesters}학기가 필요합니다. 졸업 요건을 충족하려면 일부 과목을 재조정하거나 학점을 더 많이 이수해야 합니다.`
      : undefined;

    return {
      semesters,
      totalSemesters,
      warning,
    };
  };

  const handleSave = () => {
    if (!state.generatedCurriculum || !curriculumPlan) return;

    const updatedPlan = {
      ...curriculumPlan,
      semesters: state.generatedCurriculum.semesters.map(sem => ({
        year: sem.year,
        term: sem.term,
        courses: sem.courses,
        isLocked: false,
      })),
      updatedAt: new Date().toISOString(),
    };

    setCurriculumPlan(updatedPlan);
    onClose();
  };

  const handleBack = () => {
    if (state.step === 'type') {
      setState(prev => ({ ...prev, step: 'career' }));
    } else if (state.step === 'course-selection') {
      setState(prev => ({ ...prev, step: 'type' }));
    }
  };

  const handleReset = () => {
    setState({
      step: 'career',
      careerGoal: '',
      customCareerInput: '',
      recommendationType: null,
      recommendedCourses: [],
      selectedCourses: [],
      generatedCurriculum: null,
      error: null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl">AI 커리큘럼 마법사</h2>
              <p className="text-sm text-gray-600">맞춤형 수강 계획을 추천받으세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className={`flex items-center gap-2 ${state.step === 'career' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step === 'career' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                <Target className="w-4 h-4" />
              </div>
              <span className="text-sm">진로 목표</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-4 ${
              state.step !== 'career' ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            
            <div className={`flex items-center gap-2 ${state.step === 'type' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step === 'type' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm">추천 유형</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-4 ${
              state.step === 'loading-courses' || state.step === 'course-selection' ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            
            <div className={`flex items-center gap-2 ${
              state.step === 'loading-courses' || state.step === 'course-selection' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step === 'loading-courses' || state.step === 'course-selection' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-sm">과목 선택</span>
            </div>

            <div className={`flex-1 h-0.5 mx-4 ${
              state.step === 'loading-curriculum' || state.step === 'result' ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            
            <div className={`flex items-center gap-2 ${
              state.step === 'loading-curriculum' || state.step === 'result' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step === 'loading-curriculum' || state.step === 'result' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm">완료</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Career Goal Selection */}
          {state.step === 'career' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-2xl mb-2">진로 목표를 선택하세요</h3>
                <p className="text-gray-600 mb-6">
                  목표 진로에 맞는 최적의 커리큘럼을 추천해드립니다
                </p>
                
                {/* Direct Input Field */}
                <div className="max-w-md mx-auto mb-6">
                  <Input
                    value={state.customCareerInput}
                    onChange={(e) => setState(prev => ({ ...prev, customCareerInput: e.target.value }))}
                    placeholder="희망하는 진로를 입력하세요 (예: 백엔드 개발자, 클라우드 엔지니어)"
                    className="w-full text-center"
                  />
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 text-center mb-3">또는 아래에서 빠르게 선택하세요</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  {CAREER_PRESETS.filter(goal => goal.id !== 'custom').map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setState(prev => ({ ...prev, customCareerInput: goal.name }))}
                      className="p-3 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all border-gray-200"
                    >
                      <div className="text-3xl mb-1">{goal.icon}</div>
                      <div className="text-xs">{goal.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleCareerNext}
                  disabled={!state.customCareerInput.trim()}
                  className="px-8"
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Recommendation Type Selection */}
          {state.step === 'type' && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl mb-2">추천 유형을 선택하세요</h3>
                <p className="text-gray-600">
                  학습 목표에 맞는 커리큘럼 유형을 선택하세요
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {RECOMMENDATION_TYPES.map((recType) => (
                  <button
                    key={recType.id}
                    onClick={() => handleTypeSelect(recType.id)}
                    className="p-6 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left border-gray-200"
                  >
                    <div className="text-5xl mb-3">{recType.icon}</div>
                    <div className="text-xl mb-2">{recType.name}</div>
                    <div className="text-sm text-gray-600 mb-3">{recType.description}</div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      {recType.details}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-8">
                <Button variant="outline" onClick={handleBack}>
                  이전
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Loading Courses */}
          {state.step === 'loading-courses' && (
            <div className="text-center py-16">
              <div className="inline-block mb-6">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-2xl mb-2">AI가 전공 과목을 추천하고 있습니다</h3>
              <p className="text-gray-600">
                선택하신 진로와 유형에 맞는 최적의 전공 과목들을 분석하고 있어요...
              </p>
            </div>
          )}

          {/* Step 4: Course Selection */}
          {state.step === 'course-selection' && (
            <div>
              <div className="text-center mb-4">
                <h3 className="text-2xl mb-2">추천 전공 과목</h3>
                <p className="text-gray-600">
                  AI가 추천하는 전공 과목들입니다. 원하는 과목을 선택하여 커리큘럼을 생성하세요.
                </p>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {state.selectedCourses.length}개 / {state.recommendedCourses.length}개 선택됨
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    전체 선택
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    전체 해제
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto mb-6 border rounded-lg p-4">
                <div className="space-y-3">
                  {state.recommendedCourses.map((courseId) => {
                    const course = getCourseById(courseId);
                    const isSelected = state.selectedCourses.includes(courseId);
                    
                    return course ? (
                      <Card 
                        key={courseId} 
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-50 border-blue-300 shadow-md' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleToggleCourse(courseId)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className="pt-0.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleCourse(courseId)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* Course Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-blue-600">{course.code}</span>
                              <span className="font-medium">{course.name}</span>
                              <span className="text-sm text-gray-500">{course.credits}학점</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {course.rating && (
                                <span className="text-xs text-gray-500">★ {course.rating.toFixed(1)}</span>
                              )}
                              {course.workload && (
                                <span className="text-xs text-gray-500">
                                  과제량: {course.workload === 'low' ? '적음' : course.workload === 'medium' ? '보통' : '많음'}
                                </span>
                              )}
                              {course.careerFit && (
                                <span className="text-xs text-gray-500">진로 적합도: {course.careerFit}/5</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Category Badge */}
                          <div className={`px-2 py-1 rounded text-xs ${
                            course.category === 'major-required' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {course.category === 'major-required' ? '전공필수' : '전공선택'}
                          </div>
                        </div>
                      </Card>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">{state.selectedCourses.length}개의 전공 과목이 선택되었습니다</p>
                    <p className="text-blue-700">승인하시면 선수과목 관계를 고려한 최적의 커리큘럼을 생성합니다.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleBack}>
                  이전
                </Button>
                <Button 
                  onClick={handleApproveCourses} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={state.selectedCourses.length === 0}
                >
                  선택 과목으로 커리큘럼 생성 ({state.selectedCourses.length}개)
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Loading Curriculum */}
          {state.step === 'loading-curriculum' && (
            <div className="text-center py-16">
              <div className="inline-block mb-6">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-2xl mb-2">AI가 커리큘럼을 생성하고 있습니다</h3>
              <p className="text-gray-600">
                선택하신 전공 과목들을 바탕으로 최적의 학기별 계획을 만들고 있어요...
              </p>
            </div>
          )}

          {/* Step 6: Result */}
          {state.step === 'result' && (
            <div>
              {state.error ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl mb-2">오류가 발생했습니다</h3>
                  <p className="text-gray-600 mb-6">{state.error}</p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      처음부터 다시
                    </Button>
                    <Button onClick={onClose}>닫기</Button>
                  </div>
                </div>
              ) : state.generatedCurriculum ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl mb-2">커리큘럼이 생성되었습니다!</h3>
                    <p className="text-gray-600">
                      전공 과목 기준 {state.generatedCurriculum.totalSemesters}학기 계획이 완성되었습니다
                    </p>
                  </div>

                  {state.generatedCurriculum.warning && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-900 mb-1">경고</div>
                        <div className="text-sm text-yellow-800">{state.generatedCurriculum.warning}</div>
                      </div>
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto mb-6 border rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                      {state.generatedCurriculum.semesters.map((semester) => (
                        <Card key={`${semester.year}-${semester.term}`} className="p-3">
                          <div className="font-medium text-sm mb-2 text-blue-600">
                            {semester.year}학년 {semester.term}학기
                          </div>
                          <div className="space-y-1.5">
                            {semester.courses.map((courseId) => {
                              const course = getCourseById(courseId);
                              return course ? (
                                <div key={courseId} className="text-xs bg-gray-50 p-1.5 rounded">
                                  <div className="font-medium truncate">{course.name}</div>
                                  <div className="text-gray-500">{course.credits}학점</div>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                            총 {semester.courses.reduce((sum, id) => {
                              const course = getCourseById(id);
                              return sum + (course?.credits || 0);
                            }, 0)}학점
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      <strong>안내:</strong> 이 커리큘럼은 선택하신 전공 과목만을 기준으로 생성되었습니다. 
                      교양 과목 및 기타 졸업 요건은 별도로 추가하셔야 합니다.
                    </p>
                  </div>

                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      다시 생성
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                      <Check className="w-4 h-4 mr-2" />
                      커리큘럼 적용
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};