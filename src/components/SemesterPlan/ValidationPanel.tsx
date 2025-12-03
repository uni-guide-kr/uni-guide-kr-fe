import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { ValidationIssue, Course } from '../../types';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  getCourseById: (id: string) => Course | undefined;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues, getCourseById }) => {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (issues.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <div className="text-green-900">검증 완료</div>
              <div className="text-sm text-green-700 mt-1">
                현재 학기 계획에 문제가 없습니다.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {errors.length > 0 ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              검증 결과 ({errors.length}개 오류, {warnings.length}개 경고)
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              검증 결과 ({warnings.length}개 경고)
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Errors */}
        {errors.map((issue, index) => {
          const course = getCourseById(issue.courseId);
          return (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <span className="text-sm">
                    <strong>{course?.name}</strong>: {issue.message}
                  </span>
                </div>
                {issue.suggestion && (
                  <div className="text-xs mt-2 text-red-700">{issue.suggestion}</div>
                )}
              </AlertDescription>
            </Alert>
          );
        })}

        {/* Warnings */}
        {warnings.map((issue, index) => {
          const course = getCourseById(issue.courseId);
          return (
            <Alert key={index} className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div>
                  <span className="text-sm text-yellow-900">
                    <strong>{course?.name}</strong>: {issue.message}
                  </span>
                </div>
                {issue.suggestion && (
                  <div className="text-xs mt-2 text-yellow-800">{issue.suggestion}</div>
                )}
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};
