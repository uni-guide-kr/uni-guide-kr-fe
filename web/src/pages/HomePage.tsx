import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { OnboardingModal } from '../components/OnboardingModal';
import { ProgressDashboard } from '../components/Dashboard/ProgressDashboard';
import { RecommendedCourses } from '../components/Dashboard/RecommendedCourses';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { GraduationCap, Plus, Edit, Undo } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CompletedCourse } from '../types';
import { COURSES } from '../data/mockData';

interface HomePageProps {
  onNavigate: (page: 'home' | 'explore' | 'plan' | 'curriculum') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const {
    onboardingComplete,
    completeOnboarding,
    userProfile,
    progressSummary,
    addCourseToPlan,
    currentPlan,
    createPlan,
    updateCompletedCourses,
    canUndo,
    undo,
  } = useApp();

  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');

  const handleAddCompletedCourse = () => {
    if (!courseCode.trim() || !userProfile) return;

    const course = COURSES.find((c) => c.code.toLowerCase() === courseCode.trim().toLowerCase());

    if (course) {
      const newCompleted: CompletedCourse = {
        courseId: course.id,
        semester: '2024-1',
        credits: course.credits,
      };
      updateCompletedCourses([...userProfile.completedCourses, newCompleted]);
      setCourseCode('');
    }
  };

  const handleRemoveCompletedCourse = (index: number) => {
    if (!userProfile) return;
    const updated = userProfile.completedCourses.filter((_, i) => i !== index);
    updateCompletedCourses(updated);
  };

  const handleAddToPlan = (courseId: string) => {
    if (!currentPlan) {
      createPlan('2025-1');
    }
    addCourseToPlan(courseId);
  };

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
                  </div>

                  <div>
                    <Label>이수 완료 과목 ({userProfile.completedCourses.length}개)</Label>
                    <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                      {userProfile.completedCourses.map((completed, index) => {
                        const course = COURSES.find((c) => c.id === completed.courseId);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="text-sm">
                                {course?.code} - {course?.name}
                              </div>
                              <div className="text-xs text-gray-500">{course?.credits}학점</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveCompletedCourse(index)}
                            >
                              삭제
                            </Button>
                          </div>
                        );
                      })}
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
          />
        </div>

        <div className="space-y-6">
          <RecommendedCourses
            courses={COURSES}
            progressSummary={progressSummary}
            completedCourseIds={userProfile.completedCourses.map((c) => c.courseId)}
            onAddToPlan={handleAddToPlan}
            onNavigateToExplore={() => onNavigate('explore')}
          />

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button className="w-full" onClick={() => onNavigate('explore')}>
                  과목탐색 시작하기
                </Button>
                <Button className="w-full" variant="outline" onClick={() => onNavigate('plan')}>
                  학기계획 보기
                </Button>
                <Button className="w-full" variant="outline" onClick={() => onNavigate('curriculum')}>
                  커리큘럼 구성하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
