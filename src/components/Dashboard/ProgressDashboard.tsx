import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Award, BookOpen, Library, CheckCircle2, Sparkles } from 'lucide-react';
import { ProgressSummary, CompletedCourse } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';

interface ProgressDashboardProps {
  progressSummary: ProgressSummary;
  onNavigateToExplore: () => void;
  requiredCourses?: { areaId: string; courses: Array<{ code: string; name: string; credits: number; id: string }> }[];
  completedCourses?: CompletedCourse[];
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progressSummary,
  onNavigateToExplore,
  requiredCourses = [],
  completedCourses = [],
}) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const totalProgress =
    ((progressSummary.totalCompleted + progressSummary.totalPlanned) /
      progressSummary.totalRequired) *
    100;

  const completedProgress = (progressSummary.totalCompleted / progressSummary.totalRequired) * 100;

  const selectedAreaData = selectedArea 
    ? requiredCourses.find(rc => rc.areaId === selectedArea)
    : null;

  const selectedAreaProgress = selectedArea
    ? progressSummary.areaProgress.find(ap => ap.areaId === selectedArea)
    : null;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            전체 졸업 진척도
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl">
                  {progressSummary.totalCompleted + progressSummary.totalPlanned} /{' '}
                  {progressSummary.totalRequired} 학점
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  이수: {progressSummary.totalCompleted}학점 | 당학기: {progressSummary.totalPlanned}
                  학점
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl text-blue-600">{totalProgress.toFixed(0)}%</div>
                <div className="text-sm text-gray-500">완료율</div>
              </div>
            </div>

            <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              {/* Planned progress (sky blue) */}
              <div 
                className="absolute top-0 left-0 h-full bg-sky-300 transition-all"
                style={{ width: `${Math.min(totalProgress, 100)}%` }}
              />
              {/* Completed progress (blue) */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(completedProgress, 100)}%` }}
              />
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded" />
                <span>이수 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-300 rounded" />
                <span>당학기</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded" />
                <span>남은 학점</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Area Progress */}
      <div>
        <h3 className="text-lg mb-4">영역별 진척도</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {progressSummary.areaProgress.map((area) => {
            const areaCompleted = (area.completed / area.required) * 100;
            const areaTotal = ((area.completed + area.planned) / area.required) * 100;
            const isMajor = area.areaName.includes('전공');
            const hasRequiredCourses = requiredCourses.some(rc => rc.areaId === area.areaId && rc.courses.length > 0);

            return (
              <Card 
                key={area.areaId}
                className={hasRequiredCourses ? 'cursor-pointer hover:border-blue-400 transition-colors' : ''}
                onClick={() => hasRequiredCourses && setSelectedArea(area.areaId)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {isMajor ? (
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Library className="w-4 h-4 text-green-600" />
                    )}
                    {area.areaName}
                    {hasRequiredCourses && (
                      <span className="text-xs text-gray-400 ml-auto">클릭하여 필수과목 확인</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {area.completed + area.planned} / {area.required} 학점
                      </span>
                      <span
                        className={`text-sm ${
                          area.remaining === 0 ? 'text-green-600' : 'text-blue-600'
                        }`}
                      >
                        {area.remaining === 0 ? '완료' : `${area.remaining}학점 필요`}
                      </span>
                    </div>

                    <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      {/* Planned progress (sky blue) */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-sky-300 transition-all"
                        style={{ width: `${Math.min(areaTotal, 100)}%` }}
                      />
                      {/* Completed progress (blue) */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-600 transition-all"
                        style={{ width: `${Math.min(areaCompleted, 100)}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      이수: {area.completed}학점 | 당학기: {area.planned}학점
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Warnings and Tips */}
      {progressSummary.areaProgress.some((a) => a.remaining > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-yellow-900">졸업 요건 충족 팁</span>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  {progressSummary.areaProgress
                    .filter((a) => a.remaining > 0)
                    .slice(0, 3)
                    .map((area) => (
                      <li key={area.areaId}>
                        {area.areaName}: {area.remaining}학점이 더 필요합니다
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Courses Dialog */}
      <Dialog open={!!selectedArea} onOpenChange={(open) => !open && setSelectedArea(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAreaProgress?.areaName} 필수 과목
            </DialogTitle>
            <DialogDescription>
              이수해야 할 필수 과목 목록입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAreaData?.courses.map((course) => {
              const isCompleted = completedCourses.some(c => c.courseId === course.id);
              
              return (
                <Card 
                  key={course.code}
                  className={isCompleted ? 'bg-green-50 border-green-200' : ''}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">{course.code}</span>
                            <Badge variant="outline" className={isCompleted ? 'bg-white' : ''}>
                              {course.credits}학점
                            </Badge>
                            {isCompleted && (
                              <Badge className="bg-green-600 text-white text-xs">
                                이수완료
                              </Badge>
                            )}
                          </div>
                          <div className={isCompleted ? 'text-gray-700' : ''}>{course.name}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {selectedAreaData?.courses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                필수 과목 정보가 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};