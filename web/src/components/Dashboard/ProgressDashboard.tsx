import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Award, BookOpen, Library, Sparkles } from 'lucide-react';
import { ProgressSummary } from '../../types';

interface ProgressDashboardProps {
  progressSummary: ProgressSummary;
  onNavigateToExplore: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progressSummary,
  onNavigateToExplore,
}) => {
  const totalProgress =
    ((progressSummary.totalCompleted + progressSummary.totalPlanned) /
      progressSummary.totalRequired) *
    100;

  const completedProgress = (progressSummary.totalCompleted / progressSummary.totalRequired) * 100;

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
                  이수: {progressSummary.totalCompleted}학점 | 계획: {progressSummary.totalPlanned}
                  학점
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl text-blue-600">{totalProgress.toFixed(0)}%</div>
                <div className="text-sm text-gray-500">완료율</div>
              </div>
            </div>

            <div className="relative">
              <Progress value={completedProgress} className="h-3" />
              <Progress
                value={totalProgress}
                className="h-3 absolute top-0 left-0 opacity-40"
              />
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded" />
                <span>이수 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded" />
                <span>계획 중</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Area Progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">영역별 진척도</h3>
          <button
            onClick={onNavigateToExplore}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            추천 과목 보기
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {progressSummary.areaProgress.map((area) => {
            const areaCompleted = (area.completed / area.required) * 100;
            const areaTotal = ((area.completed + area.planned) / area.required) * 100;
            const isMajor = area.areaName.includes('전공');

            return (
              <Card key={area.areaId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {isMajor ? (
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Library className="w-4 h-4 text-green-600" />
                    )}
                    {area.areaName}
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

                    <div className="relative">
                      <Progress value={areaCompleted} className="h-2" />
                      <Progress
                        value={areaTotal}
                        className="h-2 absolute top-0 left-0 opacity-40"
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      이수: {area.completed}학점 | 계획: {area.planned}학점
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
    </div>
  );
};
