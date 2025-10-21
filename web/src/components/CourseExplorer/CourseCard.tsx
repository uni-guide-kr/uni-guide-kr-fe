import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, Check, AlertCircle, Info, Star, Briefcase } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  isCompleted: boolean;
  prerequisitesMet: boolean;
  isInPlan: boolean;
  onAddToPlan: (courseId: string) => void;
  onShowDetails: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isCompleted,
  prerequisitesMet,
  isInPlan,
  onAddToPlan,
  onShowDetails,
}) => {
  const getCategoryBadge = (category: Course['category']) => {
    switch (category) {
      case 'major-required':
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-900 hover:bg-purple-100">
            전공필수
          </Badge>
        );
      case 'major-elective':
        return (
          <Badge variant="default" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            전공선택
          </Badge>
        );
      case 'general-required':
        return (
          <Badge variant="default" className="bg-green-100 text-green-900 hover:bg-green-100">
            교양필수
          </Badge>
        );
      case 'general-elective':
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 hover:bg-green-50">
            교양선택
          </Badge>
        );
    }
  };

  const getSemesterBadge = (semester: Course['offeredIn']) => {
    switch (semester) {
      case 'spring':
        return <Badge variant="outline">1학기</Badge>;
      case 'fall':
        return <Badge variant="outline">2학기</Badge>;
      case 'both':
        return <Badge variant="outline">1·2학기</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getCategoryBadge(course.category)}
                {getSemesterBadge(course.offeredIn)}
                {course.area && (
                  <Badge variant="secondary" className="text-xs">
                    {course.area === 'humanities' && '인문'}
                    {course.area === 'social-science' && '사회'}
                    {course.area === 'natural-science' && '자연'}
                    {course.area === 'arts' && '예체능'}
                    {course.area === 'language' && '언어'}
                    {course.area === 'writing' && '글쓰기'}
                  </Badge>
                )}
              </div>

              <button
                onClick={() => onShowDetails(course.id)}
                className="text-left hover:text-blue-600 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-500">{course.code}</span>
                  <span>{course.name}</span>
                </div>
              </button>

              <div className="text-sm text-gray-500 mt-1">{course.credits}학점</div>
            </div>

            <div className="flex flex-col gap-2">
              {isCompleted && (
                <Badge variant="default" className="bg-green-100 text-green-900 hover:bg-green-100">
                  <Check className="w-3 h-3 mr-1" />
                  이수완료
                </Badge>
              )}
              {isInPlan && !isCompleted && (
                <Badge variant="default" className="bg-blue-100 text-blue-900 hover:bg-blue-100">
                  계획중
                </Badge>
              )}
              {!prerequisitesMet && !isCompleted && (
                <Badge variant="default" className="bg-red-100 text-red-900 hover:bg-red-100">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  선수과목
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <button
              onClick={() => onShowDetails(course.id)}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              상세보기
            </button>

            {!isCompleted && (
              <Button
                size="sm"
                variant={isInPlan ? 'secondary' : 'default'}
                onClick={() => onAddToPlan(course.id)}
                disabled={isInPlan}
              >
                {isInPlan ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    담김
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    담기
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
