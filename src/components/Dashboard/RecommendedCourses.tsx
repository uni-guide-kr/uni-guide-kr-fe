import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sparkles, Plus } from 'lucide-react';
import { Course, ProgressSummary } from '../../types';

interface RecommendedCoursesProps {
  courses: Course[];
  progressSummary: ProgressSummary;
  completedCourseIds: string[];
  onAddToPlan: (courseId: string) => void;
  onNavigateToExplore: () => void;
}

export const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({
  courses,
  progressSummary,
  completedCourseIds,
  onAddToPlan,
  onNavigateToExplore,
}) => {
  // Get areas that need more credits
  const areasNeedingCredits = progressSummary.areaProgress
    .filter((a) => a.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);

  // Find recommended courses based on what's needed
  const getRecommendedCourses = (): Course[] => {
    const recommended: Course[] = [];

    for (const area of areasNeedingCredits) {
      const areaCourses = courses.filter((course) => {
        // Skip completed courses
        if (completedCourseIds.includes(course.id)) return false;

        // Check if course matches area category
        if (area.category !== course.category) return false;

        // Check if course matches area (for general education)
        if (area.areaName.includes('교양') && area.areaName.includes('인문')) {
          return course.area === 'humanities';
        }
        if (area.areaName.includes('교양') && area.areaName.includes('사회')) {
          return course.area === 'social-science';
        }
        if (area.areaName.includes('교양') && area.areaName.includes('자연')) {
          return course.area === 'natural-science';
        }
        if (area.areaName.includes('교양') && area.areaName.includes('예체능')) {
          return course.area === 'arts';
        }

        // For major courses, check if prerequisites are met
        if (area.category === 'major-required' || area.category === 'major-elective') {
          const prereqsMet = course.prerequisites.every((prereqId) =>
            completedCourseIds.includes(prereqId)
          );
          return prereqsMet;
        }

        return true;
      });

      recommended.push(...areaCourses.slice(0, 2));
    }

    return recommended.slice(0, 5);
  };

  const recommendedCourses = getRecommendedCourses();

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
      case 'university-required':
        return (
          <Badge variant="default" className="bg-green-100 text-green-900 hover:bg-green-100">
            대학필수
          </Badge>
        );
      case 'department-required':
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 hover:bg-green-50">
            학과필수
          </Badge>
        );
    }
  };

  if (recommendedCourses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          추천 과목
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendedCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryBadge(course.category)}
                  <span className="text-sm text-gray-500">{course.code}</span>
                </div>
                <div className="mb-1">{course.name}</div>
                <div className="text-sm text-gray-500">{course.credits}학점</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onAddToPlan(course.id)}>
                <Plus className="w-4 h-4 mr-1" />
                담기
              </Button>
            </div>
          ))}

          <Button variant="ghost" className="w-full mt-2" onClick={onNavigateToExplore}>
            과목탐색에서 더 보기 →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
