import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, BookOpen, GraduationCap, Library } from 'lucide-react';
import { Course, SemesterPlan } from '../../types';

interface PlanListProps {
  plan: SemesterPlan;
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  totalCredits: number;
}

export const PlanList: React.FC<PlanListProps> = ({
  plan,
  courses,
  onRemoveCourse,
  totalCredits,
}) => {
  // Group courses by category
  const majorRequired = courses.filter((c) => c.category === 'major-required');
  const majorElective = courses.filter((c) => c.category === 'major-elective');
  const generalRequired = courses.filter((c) => c.category === 'general-required');
  const generalElective = courses.filter((c) => c.category === 'general-elective');

  const CourseItem: React.FC<{ course: Course }> = ({ course }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-500">{course.code}</span>
          <span className="text-sm">{course.name}</span>
        </div>
        <div className="text-xs text-gray-500">{course.credits}학점</div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemoveCourse(course.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );

  const CategorySection: React.FC<{
    title: string;
    icon: React.ReactNode;
    courses: Course[];
    color: string;
  }> = ({ title, icon, courses, color }) => {
    if (courses.length === 0) return null;

    const categoryCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm">{title}</h3>
          </div>
          <Badge variant="outline" className={color}>
            {categoryCredits}학점
          </Badge>
        </div>
        <div className="space-y-2">
          {courses.map((course) => (
            <CourseItem key={course.id} course={course} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">과목 목록</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">총</span>
            <Badge variant="default" className="bg-blue-600">
              {totalCredits}학점
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>과목탐색에서 과목을 추가해보세요</p>
          </div>
        ) : (
          <>
            <CategorySection
              title="전공필수"
              icon={<GraduationCap className="w-4 h-4 text-purple-600" />}
              courses={majorRequired}
              color="text-purple-600"
            />
            <CategorySection
              title="전공선택"
              icon={<BookOpen className="w-4 h-4 text-purple-500" />}
              courses={majorElective}
              color="text-purple-500"
            />
            <CategorySection
              title="교양필수"
              icon={<Library className="w-4 h-4 text-green-600" />}
              courses={generalRequired}
              color="text-green-600"
            />
            <CategorySection
              title="교양선택"
              icon={<Library className="w-4 h-4 text-green-500" />}
              courses={generalElective}
              color="text-green-500"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
