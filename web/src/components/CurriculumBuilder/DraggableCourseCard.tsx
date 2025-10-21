import React from 'react';
import { useDrag } from 'react-dnd';
import { Course } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { GripVertical, Star } from 'lucide-react';

interface DraggableCourseCardProps {
  course: Course;
  sourceYear?: number | null;
  sourceTerm?: number | null;
  showGrip?: boolean;
}

export const DraggableCourseCard: React.FC<DraggableCourseCardProps> = ({
  course,
  sourceYear = null,
  sourceTerm = null,
  showGrip = true,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COURSE',
    item: {
      courseId: course.id,
      sourceYear,
      sourceTerm,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major-required':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'major-elective':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'general-required':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'general-elective':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div
      ref={drag}
      id={`course-${course.id}`}
      className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card
        className={`p-3 cursor-move ${getCategoryColor(course.category)} border-2 hover:shadow-md transition-shadow`}
      >
        <div className="flex items-start gap-2">
          {showGrip && (
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs opacity-70">{course.code}</span>
                  {course.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span className="text-xs">{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="truncate mb-1">{course.name}</p>
              </div>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {course.credits}학점
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
