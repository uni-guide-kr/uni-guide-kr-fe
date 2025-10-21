import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ProgressSummary } from '../../types';

interface ProgressPreviewProps {
  currentProgress: ProgressSummary;
  planCredits: number;
}

export const ProgressPreview: React.FC<ProgressPreviewProps> = ({
  currentProgress,
  planCredits,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">진척도 변화 미리보기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall change */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">전체 이수학점</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentProgress.totalCompleted}학점
              </span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">
                {currentProgress.totalCompleted + planCredits}학점
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            이 학기 완료 후 +{planCredits}학점 ({' '}
            {(
              ((currentProgress.totalCompleted + planCredits) / currentProgress.totalRequired) *
              100
            ).toFixed(1)}
            % )
          </div>
        </div>

        {/* Area changes */}
        <div className="space-y-3">
          {currentProgress.areaProgress.map((area) => {
            const willComplete = area.completed + area.planned >= area.required;
            const delta = area.planned;

            if (delta === 0) return null;

            return (
              <div
                key={area.areaId}
                className={`p-3 rounded-lg ${
                  willComplete ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{area.areaName}</span>
                  {willComplete && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">완료</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{area.completed}학점</span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">
                    {area.completed + area.planned}학점 (+{delta})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Remaining requirements */}
        {currentProgress.areaProgress.some((a) => a.remaining > 0) && (
          <div className="pt-3 border-t">
            <div className="text-sm text-gray-600 mb-2">남은 요건</div>
            <div className="space-y-1">
              {currentProgress.areaProgress
                .filter((a) => a.remaining - a.planned > 0)
                .map((area) => (
                  <div key={area.areaId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{area.areaName}</span>
                    <span className="text-gray-500">{area.remaining - area.planned}학점</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
