import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base">진척도</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Overall credits */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">전체 이수학점</span>
            <span className="text-gray-500 text-sm">
              {currentProgress.totalCompleted + planCredits} / {currentProgress.totalRequired}학점
            </span>
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
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">완료</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">+{delta}학점</span>
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
              {currentProgress.areaProgress.map((area) => {
                const completed = area.completed + area.planned;
                const total = area.required;
                
                return (
                  <div key={area.areaId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{area.areaName}</span>
                    <span className="text-gray-500">{completed} / {total}학점</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
