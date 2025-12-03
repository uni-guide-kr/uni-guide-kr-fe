import React from 'react';
import { useDrag } from 'react-dnd';
import { Course } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { GripVertical, ArrowLeft, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface DraggableCourseCardProps {
  course: Course;
  sourceYear?: number | null;
  sourceTerm?: number | null;
  showGrip?: boolean;
  onHover?: (courseId: string | null) => void;
  isHighlighted?: boolean;
  isLocked?: boolean;
}

export const DraggableCourseCard: React.FC<DraggableCourseCardProps> = ({
  course,
  sourceYear = null,
  sourceTerm = null,
  showGrip = true,
  onHover,
  isHighlighted = false,
  isLocked = false,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COURSE',
    item: {
      courseId: course.id,
      sourceYear,
      sourceTerm,
    },
    canDrag: () => !isLocked,
    end: (item, monitor) => {
      // This ensures the drag operation completes properly
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        // Handle case where drag was cancelled
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [course.id, sourceYear, sourceTerm, isLocked]);

  const hasPrerequisites = course.prerequisites && course.prerequisites.length > 0;
  const hasRecommended = course.recommendedCourses && course.recommendedCourses.length > 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major-required':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'major-elective':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'university-required':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'department-required':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div
      ref={!isLocked ? drag : null}
      id={`course-${course.id}`}
      className={`transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onMouseEnter={() => onHover?.(course.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Card
        className={`p-3 ${isLocked ? 'cursor-default' : 'cursor-move'} ${getCategoryColor(course.category)} border-2 hover:shadow-md transition-all ${
          isHighlighted ? 'ring-2 ring-yellow-400 shadow-lg scale-105' : ''
        }`}
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
                  {hasPrerequisites && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-red-100 text-red-700">
                            <ArrowLeft className="w-3 h-3" />
                            <span className="text-xs">{course.prerequisites.length}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">선수과목 {course.prerequisites.length}개</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {hasRecommended && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 text-blue-700">
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-xs">{course.recommendedCourses.length}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">추천과목 {course.recommendedCourses.length}개</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
