import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, Check, BookOpen, ArrowRight, AlertTriangle, Star, Briefcase } from 'lucide-react';
import { Course } from '../../types';

interface CourseDetailPanelProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  getCourseById: (id: string) => Course | undefined;
  isCompleted: boolean;
  prerequisitesMet: boolean;
  isInPlan: boolean;
  onAddToPlan: (courseId: string) => void;
}

export const CourseDetailPanel: React.FC<CourseDetailPanelProps> = ({
  course,
  isOpen,
  onClose,
  getCourseById,
  isCompleted,
  prerequisitesMet,
  isInPlan,
  onAddToPlan,
}) => {
  if (!course) return null;

  const getCategoryLabel = (category: Course['category']) => {
    switch (category) {
      case 'major-required':
        return '전공필수';
      case 'major-elective':
        return '전공선택';
      case 'university-required':
        return '대학필수';
      case 'department-required':
        return '학과필수';
    }
  };

  const getSemesterLabel = (semester: Course['offeredIn']) => {
    switch (semester) {
      case 'spring':
        return '1학기';
      case 'fall':
        return '2학기';
      case 'both':
        return '1·2학기';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{course.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge>{getCategoryLabel(course.category)}</Badge>
              <Badge variant="outline">{getSemesterLabel(course.offeredIn)}</Badge>
              {course.area && <Badge variant="secondary">{course.area}</Badge>}
              {isCompleted && (
                <Badge className="bg-green-100 text-green-900">
                  <Check className="w-3 h-3 mr-1" />
                  이수완료
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-500">과목코드</div>
                <div className="mt-1">{course.code}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">학점</div>
                <div className="mt-1">{course.credits}학점</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">학과</div>
                <div className="mt-1">{course.department}</div>
              </div>
              {course.recommendedYear && (
                <div>
                  <div className="text-sm text-gray-500">권장학년</div>
                  <div className="mt-1">{course.recommendedYear}학년</div>
                </div>
              )}
              {course.rating !== undefined && (
                <div>
                  <div className="text-sm text-gray-500">강의평 별점</div>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              {course.workload && (
                <div>
                  <div className="text-sm text-gray-500">과제량</div>
                  <div className="mt-1">
                    {course.workload === 'low' && '하'}
                    {course.workload === 'medium' && '중'}
                    {course.workload === 'high' && '상'}
                  </div>
                </div>
              )}
              {course.careerFit !== undefined && (
                <div>
                  <div className="text-sm text-gray-500">진로 적합도</div>
                  <div className="mt-1 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{course.careerFit}점</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              과목 설명
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                선수과목
              </h3>
              <div className="space-y-2">
                {course.prerequisites.map((prereqId) => {
                  const prereq = getCourseById(prereqId);
                  if (!prereq) return null;
                  return (
                    <div
                      key={prereqId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm">{prereq.name}</div>
                        <div className="text-xs text-gray-500">{prereq.code}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!prerequisitesMet && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    일부 선수과목이 충족되지 않았습니다. 선수과목을 먼저 이수하거나 동시수강 가능 여부를
                    확인하세요.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Corequisites */}
          {course.corequisites.length > 0 && (
            <div>
              <h3 className="mb-3">동시수강 가능 과목</h3>
              <div className="space-y-2">
                {course.corequisites.map((coreqId) => {
                  const coreq = getCourseById(coreqId);
                  if (!coreq) return null;
                  return (
                    <div
                      key={coreqId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm">{coreq.name}</div>
                        <div className="text-xs text-gray-500">{coreq.code}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Equivalents */}
          {course.equivalents.length > 0 && (
            <div>
              <h3 className="mb-3">대체 인정 과목</h3>
              <div className="space-y-2">
                {course.equivalents.map((equivId) => {
                  const equiv = getCourseById(equivId);
                  if (!equiv) return null;
                  return (
                    <div
                      key={equivId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm">{equiv.name}</div>
                        <div className="text-xs text-gray-500">{equiv.code}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mutually Exclusive */}
          {course.mutuallyExclusive.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                중복 수강 불가
              </h3>
              <div className="space-y-2">
                {course.mutuallyExclusive.map((mutualId) => {
                  const mutual = getCourseById(mutualId);
                  if (!mutual) return null;
                  return (
                    <div
                      key={mutualId}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div>
                        <div className="text-sm">{mutual.name}</div>
                        <div className="text-xs text-gray-500">{mutual.code}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                위 과목들과는 동시에 수강하거나 모두 이수할 수 없습니다.
              </p>
            </div>
          )}

          {/* Action Button */}
          {!isCompleted && (
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  onAddToPlan(course.id);
                  onClose();
                }}
                disabled={isInPlan}
              >
                {isInPlan ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    이미 계획에 추가됨
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    학기계획에 담기
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};