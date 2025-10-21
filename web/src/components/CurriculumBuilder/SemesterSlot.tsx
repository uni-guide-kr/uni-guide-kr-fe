import React from 'react';
import { useDrop } from 'react-dnd';
import { Course } from '../../types';
import { DraggableCourseCard } from './DraggableCourseCard';
import { Card } from '../ui/card';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface SemesterSlotProps {
  year: number;
  term: number;
  courses: Course[];
  onDropCourse: (courseId: string, fromYear: number | null, fromTerm: number | null, toYear: number, toTerm: number) => void;
  onRemoveCourse: (year: number, term: number, courseId: string) => void;
}

export const SemesterSlot: React.FC<SemesterSlotProps> = ({
  year,
  term,
  courses,
  onDropCourse,
  onRemoveCourse,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'COURSE',
    drop: (item: { courseId: string; sourceYear: number | null; sourceTerm: number | null }) => {
      onDropCourse(item.courseId, item.sourceYear, item.sourceTerm, year, term);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const isOverloaded = totalCredits > 18;

  return (
    <div
      ref={drop}
      className={`relative transition-all ${
        isOver && canDrop
          ? 'ring-2 ring-blue-500 bg-blue-50'
          : canDrop
          ? 'ring-1 ring-gray-300'
          : ''
      }`}
    >
      <Card className="p-4 min-h-[200px] h-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm text-gray-500">
              {year}학년 {term}학기
            </h3>
            <p className={`text-xs mt-1 ${isOverloaded ? 'text-red-600' : 'text-gray-500'}`}>
              {totalCredits}학점 {isOverloaded && '(초과)'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {courses.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              과목을 여기에 드래그하세요
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="relative group">
                <DraggableCourseCard
                  course={course}
                  sourceYear={year}
                  sourceTerm={term}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm"
                  onClick={() => onRemoveCourse(year, term, course.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
