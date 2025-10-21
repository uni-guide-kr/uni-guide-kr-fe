import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useApp } from '../contexts/AppContext';
import { SemesterSlot } from '../components/CurriculumBuilder/SemesterSlot';
import { SavedCoursesList } from '../components/CurriculumBuilder/SavedCoursesList';
import { Button } from '../components/ui/button';
import { Wand2, Download, Upload } from 'lucide-react';
import { Card } from '../components/ui/card';

export const CurriculumBuilderPage: React.FC = () => {
  const {
    curriculumPlan,
    getCoursesByIds,
    moveCourseToSemester,
    removeCourseFromSemester,
    removeCourseFromSaved,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<Array<{ from: string; to: string; type: 'prerequisite' | 'recommended' }>>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    if (!curriculumPlan) return;

    // Calculate prerequisite connections
    const newConnections: Array<{ from: string; to: string; type: 'prerequisite' | 'recommended' }> = [];
    
    curriculumPlan.semesters.forEach((semester) => {
      semester.courses.forEach((courseId) => {
        const course = getCoursesByIds([courseId])[0];
        if (!course) return;

        // Check prerequisites
        course.prerequisites.forEach((prereqId) => {
          // Check if prerequisite is in an earlier semester
          const prereqSemester = curriculumPlan.semesters.find((sem) =>
            sem.courses.includes(prereqId)
          );
          if (prereqSemester) {
            newConnections.push({
              from: prereqId,
              to: courseId,
              type: 'prerequisite',
            });
          }
        });

        // Check recommended courses
        course.recommendedCourses.forEach((recId) => {
          const recSemester = curriculumPlan.semesters.find((sem) =>
            sem.courses.includes(recId)
          );
          if (recSemester) {
            newConnections.push({
              from: recId,
              to: courseId,
              type: 'recommended',
            });
          }
        });
      });
    });

    setConnections(newConnections);
    
    // Trigger re-render for SVG after a short delay to ensure DOM is updated
    setTimeout(() => setUpdateTrigger((prev) => prev + 1), 100);
  }, [curriculumPlan, getCoursesByIds]);

  if (!curriculumPlan) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">커리큘럼을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const savedCourses = getCoursesByIds(curriculumPlan.savedCourses);

  const handleDropCourse = (
    courseId: string,
    fromYear: number | null,
    fromTerm: number | null,
    toYear: number,
    toTerm: number
  ) => {
    moveCourseToSemester(courseId, fromYear, fromTerm, toYear, toTerm);
  };

  const handleRemoveCourse = (year: number, term: number, courseId: string) => {
    removeCourseFromSemester(year, term, courseId);
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="mb-2">커리큘럼 구성</h1>
                <p className="text-gray-600">
                  4년간의 학업 계획을 세워보세요. 과목을 드래그하여 각 학기에 배치할 수 있습니다.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  불러오기
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  저장하기
                </Button>
                <Button size="sm">
                  <Wand2 className="w-4 h-4 mr-2" />
                  커리큘럼 마법사
                </Button>
              </div>
            </div>

            {/* Legend */}
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                  <span>전공필수</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span>전공선택</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
                  <span>교양필수</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                  <span>교양선택</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-500"></div>
                    <span>선수과목</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-blue-400 opacity-50" style={{ borderTop: '2px dashed' }}></div>
                    <span>추천과목</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Curriculum Grid */}
            <div className="flex-1 overflow-hidden" ref={containerRef}>
              <div className="relative h-full">
                {/* Connection Lines SVG Overlay */}
                {updateTrigger >= 0 && (
                  <svg
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {connections.map((conn, idx) => {
                      const fromElement = document.getElementById(`course-${conn.from}`);
                      const toElement = document.getElementById(`course-${conn.to}`);
                      
                      if (!fromElement || !toElement || !containerRef.current) return null;

                      const containerRect = containerRef.current.getBoundingClientRect();
                      const fromRect = fromElement.getBoundingClientRect();
                      const toRect = toElement.getBoundingClientRect();

                      const x1 = fromRect.right - containerRect.left;
                      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
                      const x2 = toRect.left - containerRect.left;
                      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

                      return (
                        <line
                          key={`${conn.from}-${conn.to}-${idx}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={conn.type === 'prerequisite' ? '#ef4444' : '#60a5fa'}
                          strokeWidth="2"
                          strokeDasharray={conn.type === 'recommended' ? '5,5' : '0'}
                          opacity={conn.type === 'recommended' ? '0.5' : '0.7'}
                        />
                      );
                    })}
                  </svg>
                )}

                {/* Semester Grid */}
                <div className="overflow-x-auto h-full pb-4">
                  <div className="grid grid-cols-8 gap-4 relative z-0 min-w-max">
                    {[1, 2, 3, 4].map((year) => (
                      <React.Fragment key={year}>
                        {[1, 2].map((term) => {
                          const semester = curriculumPlan.semesters.find(
                            (s) => s.year === year && s.term === term
                          );
                          const courses = semester
                            ? getCoursesByIds(semester.courses).map((course) => ({
                                ...course,
                                id: course.id,
                              }))
                            : [];

                          return (
                            <div key={`${year}-${term}`} id={`semester-${year}-${term}`} className="min-w-[280px]">
                              <SemesterSlot
                                year={year}
                                term={term}
                                courses={courses}
                                onDropCourse={handleDropCourse}
                                onRemoveCourse={handleRemoveCourse}
                              />
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Saved Courses Panel */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg transition-all duration-300 ease-in-out z-50 ${
            isExpanded ? 'h-[70vh]' : 'h-[30vh]'
          }`}
        >
          <SavedCoursesList
            courses={savedCourses}
            onRemoveCourse={removeCourseFromSaved}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>
    </DndProvider>
  );
};
