import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { UserProfile, CompletedCourse } from '../types';
import { MAJORS, ENROLLMENT_YEARS, COURSES } from '../data/mockData';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const [step, setStep] = useState(1);
  const [enrollmentYear, setEnrollmentYear] = useState<number>(2024);
  const [major, setMajor] = useState<string>('소프트웨어학과');
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [currentCourseCode, setCurrentCourseCode] = useState('');
  const [currentCredits, setCurrentCredits] = useState('');

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete({
        enrollmentYear,
        major,
        completedCourses,
      });
    }
  };

  const handleSkip = () => {
    onComplete({
      enrollmentYear,
      major,
      completedCourses: [],
    });
  };

  const addCompletedCourse = () => {
    if (!currentCourseCode.trim()) return;

    const course = COURSES.find(
      (c) => c.code.toLowerCase() === currentCourseCode.trim().toLowerCase()
    );

    if (course) {
      const newCourse: CompletedCourse = {
        courseId: course.id,
        semester: '2024-1',
        credits: course.credits,
      };
      setCompletedCourses([...completedCourses, newCourse]);
      setCurrentCourseCode('');
      setCurrentCredits('');
    }
  };

  const removeCourse = (index: number) => {
    setCompletedCourses(completedCourses.filter((_, i) => i !== index));
  };

  const getCourseById = (id: string) => COURSES.find((c) => c.id === id);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle>UniGuide 시작하기</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-gray-600 mb-6">
                졸업 요건을 확인하기 위해 기본 정보를 입력해주세요.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="enrollment-year">입학년도</Label>
                  <Select
                    value={enrollmentYear.toString()}
                    onValueChange={(value) => setEnrollmentYear(parseInt(value))}
                  >
                    <SelectTrigger id="enrollment-year" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENROLLMENT_YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}학번
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="major">주전공</Label>
                  <Select value={major} onValueChange={setMajor}>
                    <SelectTrigger id="major" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJORS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleNext}>
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-gray-600 mb-6">
                기이수 과목을 입력하면 더 정확한 졸업 진척도를 확인할 수 있습니다.
                <br />
                나중에 추가할 수도 있습니다.
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="course-code">과목코드</Label>
                    <Input
                      id="course-code"
                      placeholder="예: CS101"
                      value={currentCourseCode}
                      onChange={(e) => setCurrentCourseCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCompletedCourse()}
                      className="mt-2"
                    />
                  </div>
                  <div className="pt-8">
                    <Button onClick={addCompletedCourse} variant="outline">
                      추가
                    </Button>
                  </div>
                </div>

                {completedCourses.length > 0 && (
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {completedCourses.map((completed, index) => {
                        const course = getCourseById(completed.courseId);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="text-sm">
                                {course?.code} - {course?.name}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                ({course?.credits}학점)
                              </span>
                            </div>
                            <button
                              onClick={() => removeCourse(index)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {completedCourses.length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                    과목코드를 입력하고 추가 버튼을 눌러주세요
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>
                  나중에 입력
                </Button>
                <Button onClick={handleNext}>완료</Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 pb-2">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
