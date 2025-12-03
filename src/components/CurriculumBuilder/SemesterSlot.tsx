import React from 'react';
import { useDrop } from 'react-dnd';
import { Course } from '../../types';
import { DraggableCourseCard } from './DraggableCourseCard';
import { Card } from '../ui/card';
import { X, Lock, Unlock, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SemesterSlotProps {
  year: number;
  term: number;
  courses: Course[];
  isLocked?: boolean;
  isCurrentSemester?: boolean;
  onDropCourse: (courseId: string, fromYear: number | null, fromTerm: number | null, toYear: number, toTerm: number) => void;
  onRemoveCourse: (year: number, term: number, courseId: string) => void;
  onToggleLock?: (year: number, term: number) => void;
  onSetCurrentSemester?: (year: number, term: number) => void;
  onHoverCourse?: (courseId: string | null) => void;
  highlightedCourses?: Set<string>;
}

export const SemesterSlot: React.FC<SemesterSlotProps> = ({
  year,
  term,
  courses,
  isLocked = false,
  isCurrentSemester = false,
  onDropCourse,
  onRemoveCourse,
  onToggleLock,
  onSetCurrentSemester,
  onHoverCourse,
  highlightedCourses = new Set(),
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'COURSE',
    canDrop: () => !isLocked,
    drop: (item: { courseId: string; sourceYear: number | null; sourceTerm: number | null }) => {
      // Prevent dropping in the same semester
      if (item.sourceYear === year && item.sourceTerm === term) {
        return;
      }
      // Prevent duplicates
      if (courses.some(c => c.id === item.courseId)) {
        return;
      }
      onDropCourse(item.courseId, item.sourceYear, item.sourceTerm, year, term);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [year, term, courses, onDropCourse, isLocked]);

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const isOverloaded = totalCredits > 18;

  return (
    <div
      ref={drop}
      className={`relative transition-all ${
        isLocked
          ? 'opacity-75'
          : isOver && canDrop
          ? 'ring-2 ring-blue-500 bg-blue-50'
          : canDrop
          ? 'ring-1 ring-gray-300'
          : ''
      }`}
    >
      <Card className={`p-4 min-h-[200px] h-full ${isLocked ? 'bg-gray-50' : ''} ${isCurrentSemester ? 'border-sky-400 border-2' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm text-gray-500">
                {year}학년 {term}학기
              </h3>
              {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
              {isCurrentSemester && (
                <Badge className="bg-sky-400 text-white text-xs px-1.5 py-0.5 h-5">
                  당학기
                </Badge>
              )}
            </div>
            <p className={`text-xs mt-1 ${isOverloaded ? 'text-red-600' : 'text-gray-500'}`}>
              {totalCredits}학점 {isOverloaded && '(초과)'}
            </p>
          </div>
          <div className="flex gap-1">
            {onSetCurrentSemester && !isCurrentSemester && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => onSetCurrentSemester(year, term)}
                title="당학기로 설정"
              >
                <Calendar className="w-3.5 h-3.5" />
              </Button>
            )}
            {onToggleLock && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onToggleLock(year, term)}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </Button>
            )}
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
                  onHover={onHoverCourse}
                  isHighlighted={highlightedCourses.has(course.id)}
                  isLocked={isLocked}
                />
                {!isLocked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm"
                    onClick={() => onRemoveCourse(year, term, course.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};