import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { OnboardingModal } from '../components/OnboardingModal';
import { ProgressDashboard } from '../components/Dashboard/ProgressDashboard';
import { WeeklyTimetable } from '../components/Timetable/WeeklyTimetable';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { GraduationCap, Plus, Edit, Undo, CheckCircle2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { CompletedCourse } from '../types';
import { COURSES, REQUIREMENT_RULES } from '../data/mockData';

interface HomePageProps {
  onNavigate: (page: 'home' | 'explore' | 'curriculum') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const {
    onboardingComplete,
    completeOnboarding,
    userProfile,
    progressSummary,
    updateCompletedCourses,
    canUndo,
    undo,
    isCourseCompleted,
    curriculumPlan,
    getCoursesByIds,
  } = useApp();

  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddCompletedCourse = () => {
    if (!courseCode.trim() || !userProfile) return;

    const course = COURSES.find((c) => c.code.toLowerCase() === courseCode.trim().toLowerCase());

    if (!course) {
      setAddFeedback({ type: 'error', message: '과목을 찾을 수 없습니다.' });
      setTimeout(() => setAddFeedback(null), 3000);
      return;
    }

    // Check if already completed (including locked semesters)
    if (isCourseCompleted(course.id)) {
      setAddFeedback({ type: 'error', message: '이미 추가된 과목입니다.' });
      setTimeout(() => setAddFeedback(null), 3000);
      return;
    }

    const newCompleted: CompletedCourse = {
      courseId: course.id,
      semester: '2024-1',
      credits: course.credits,
    };
    updateCompletedCourses([...userProfile.completedCourses, newCompleted]);
    setCourseCode('');
    setAddFeedback({ type: 'success', message: `${course.name} 추가 완료!` });
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const handleRemoveCompletedCourse = (index: number) => {
    if (!userProfile) return;
    const updated = userProfile.completedCourses.filter((_, i) => i !== index);
    updateCompletedCourses(updated);
  };

  // Calculate required courses for each area
  const requiredCourses = useMemo(() => {
    if (!userProfile) return [];
    
    const rule = REQUIREMENT_RULES.find(
      (r) => r.enrollmentYear === userProfile.enrollmentYear && r.major === userProfile.major
    );

    if (!rule) return [];

    return rule.areas
      .filter(area => area.courses && area.courses.length > 0)
      .map(area => ({
        areaId: area.id,
        courses: area.courses!.map(courseId => {
          const course = COURSES.find(c => c.id === courseId);
          return course ? {
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
          } : null;
        }).filter(c => c !== null) as Array<{ id: string; code: string; name: string; credits: number }>
      }));
  }, [userProfile]);

  // Get current semester courses for timetable
  const currentSemesterCourses = useMemo(() => {
    if (!curriculumPlan) return [];

    // Find the first unlocked semester (current semester)
    const currentSemester = curriculumPlan.semesters.find(sem => !sem.isLocked);
    
    if (!currentSemester || currentSemester.courses.length === 0) {
      // If no unlocked semester, use the first semester with courses (for demo purposes)
      const firstSemesterWithCourses = curriculumPlan.semesters.find(sem => sem.courses.length > 0);
      return firstSemesterWithCourses ? getCoursesByIds(firstSemesterWithCourses.courses) : [];
    }

    return getCoursesByIds(currentSemester.courses);
  }, [curriculumPlan, getCoursesByIds]);

  if (!onboardingComplete) {
    return <OnboardingModal open={true} onComplete={completeOnboarding} />;
  }

  if (!userProfile || !progressSummary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">온보딩을 완료하면 졸업진척도를 보여드립니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            나의 졸업 현황
          </h1>
          <div className="flex gap-2">
            {canUndo && (
              <Button variant="outline" size="sm" onClick={undo}>
                <Undo className="w-4 h-4 mr-1" />
                되돌리기
              </Button>
            )}
            <Sheet open={editPanelOpen} onOpenChange={setEditPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  기이수 과목 편집
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>기이수 과목 관리</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="add-course">과목 추가</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="add-course"
                        placeholder="과목코드 (예: CS101)"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCompletedCourse()}
                      />
                      <Button onClick={handleAddCompletedCourse}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {addFeedback && (
                      <div
                        className={`mt-2 p-2 rounded-md text-sm ${
                          addFeedback.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {addFeedback.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>이수 완료 과목 ({userProfile.completedCourses.length}개)</Label>
                    <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                      {userProfile.completedCourses.map((completed, index) => {
                        const course = COURSES.find((c) => c.id === completed.courseId);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg group hover:bg-green-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-600">{course?.code}</span>
                                  <Badge variant="outline" className="text-xs bg-white">
                                    {course?.credits}학점
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-900 truncate">{course?.name}</div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 p-0"
                              onClick={() => handleRemoveCompletedCourse(index)}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        );
                      })}
                      {userProfile.completedCourses.length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-400">
                          아직 추가된 과목이 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <p className="text-gray-600">
          {userProfile.enrollmentYear}학번 · {userProfile.major}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressDashboard
            progressSummary={progressSummary}
            onNavigateToExplore={() => onNavigate('explore')}
            requiredCourses={requiredCourses}
            completedCourses={userProfile.completedCourses}
          />
        </div>

        <div className="space-y-6">
          <WeeklyTimetable courses={currentSemesterCourses} />
        </div>
      </div>
    </div>
  );
};