import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useApp } from '../contexts/AppContext';
import { SemesterSlot } from '../components/CurriculumBuilder/SemesterSlot';
import { SavedCoursesList } from '../components/CurriculumBuilder/SavedCoursesList';
import { ValidationPanel } from '../components/SemesterPlan/ValidationPanel';
import { ProgressPreview } from '../components/SemesterPlan/ProgressPreview';
import { CurriculumWizard } from '../components/CurriculumPlanner/CurriculumWizard';
import { Button } from '../components/ui/button';
import { Wand2, Download, Upload, ArrowLeft, AlertCircle, TrendingUp, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ValidationIssue } from '../types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

export const CurriculumBuilderPage: React.FC = () => {
  const {
    curriculumPlan,
    getCoursesByIds,
    getCourseById,
    moveCourseToSemester,
    removeCourseFromSemester,
    removeCourseFromSaved,
    toggleSemesterLock,
    setCurrentSemester,
    progressSummary,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<Array<{ from: string; to: string; type: 'prerequisite' }>>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [highlightedCourses, setHighlightedCourses] = useState<Set<string>>(new Set());
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [showPrerequisites, setShowPrerequisites] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    if (!curriculumPlan) return;

    // Calculate prerequisite connections
    const newConnections: Array<{ from: string; to: string; type: 'prerequisite' }> = [];
    
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
      });
    });

    setConnections(newConnections);
    
    // Trigger re-render for SVG after a short delay to ensure DOM is updated
    setTimeout(() => setUpdateTrigger((prev) => prev + 1), 100);
  }, [curriculumPlan, getCoursesByIds]);

  // Update highlighted courses when hovering
  useEffect(() => {
    if (!hoveredCourseId) {
      setHighlightedCourses(new Set());
      return;
    }

    const highlighted = new Set<string>();
    highlighted.add(hoveredCourseId);

    // Find all related courses (prerequisites and recommended)
    connections.forEach((conn) => {
      if (conn.from === hoveredCourseId) {
        highlighted.add(conn.to);
      }
      if (conn.to === hoveredCourseId) {
        highlighted.add(conn.from);
      }
    });

    setHighlightedCourses(highlighted);
  }, [hoveredCourseId, connections]);

  // Validate curriculum
  const validateCurriculum = (): ValidationIssue[] => {
    if (!curriculumPlan) return [];
    
    const issues: ValidationIssue[] = [];
    
    curriculumPlan.semesters.forEach((semester) => {
      const semesterCourses = getCoursesByIds(semester.courses);
      const totalCredits = semesterCourses.reduce((sum, c) => sum + c.credits, 0);
      
      // Check credit limit
      if (totalCredits > 18) {
        semesterCourses.forEach(course => {
          issues.push({
            courseId: course.id,
            message: `${semester.year}학년 ${semester.term}학기 학점 초과 (${totalCredits}학점)`,
            severity: 'error',
            suggestion: '학기당 최대 18학점까지 가능합니다.',
          });
        });
      }
      
      // Check prerequisites
      semesterCourses.forEach((course) => {
        course.prerequisites.forEach((prereqId) => {
          const prereqCourse = getCourseById(prereqId);
          if (!prereqCourse) return;
          
          // Check if prerequisite is completed or in earlier semester
          const prereqSemester = curriculumPlan.semesters.find((s) =>
            s.courses.includes(prereqId)
          );
          
          if (!prereqSemester) {
            issues.push({
              courseId: course.id,
              message: `선수과목 미이수: ${prereqCourse.name}`,
              severity: 'error',
              suggestion: `${prereqCourse.name}을(를) 먼저 이수해야 합니다.`,
            });
          } else {
            // Check if prerequisite is in same or later semester
            const isSameSemester = prereqSemester.year === semester.year && prereqSemester.term === semester.term;
            const isLaterSemester = 
              prereqSemester.year > semester.year || 
              (prereqSemester.year === semester.year && prereqSemester.term > semester.term);
            
            if (isSameSemester || isLaterSemester) {
              issues.push({
                courseId: course.id,
                message: `선수과목 순서 오류: ${prereqCourse.name}`,
                severity: 'error',
                suggestion: `${prereqCourse.name}을(를) 이전 학기에 배치해야 합니다.`,
              });
            }
          }
        });
      });
    });
    
    return issues;
  };

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
  const validationIssues = validateCurriculum();
  const totalCourses = curriculumPlan.semesters.reduce((sum, s) => sum + s.courses.length, 0);
  const totalCredits = curriculumPlan.semesters.reduce((sum, semester) => {
    const courses = getCoursesByIds(semester.courses);
    return sum + courses.reduce((s, c) => s + c.credits, 0);
  }, 0);

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
              <div className="flex-1">
                <h1 className="mb-2">커리큘럼 구성</h1>
                <p className="text-gray-600">
                  4년간의 학업 계획을 세워보세요. 과목을 드래그하여 각 학기에 배치할 수 있습니다.
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-600">총 {totalCourses}과목</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-600">{totalCredits}학점</span>
                </div>
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
                <Button size="sm" onClick={() => setIsWizardOpen(true)}>
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
                  <span>대학필수</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                  <span>학과필수</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <Button
                    variant={showPrerequisites ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowPrerequisites(!showPrerequisites)}
                    className="h-8"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    선수과목 연결선 {showPrerequisites ? '숨기기' : '보기'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Content - Grid and Sidebar */}
            <div className="flex-1 overflow-hidden flex gap-6">
              {/* Curriculum Grid */}
              <div className="flex-1 overflow-hidden" ref={containerRef}>
              <div className="relative h-full">
                {/* Connection Lines SVG Overlay - Only show when button is clicked */}
                {updateTrigger >= 0 && showPrerequisites && (
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
                          strokeWidth="3"
                          strokeDasharray={conn.type === 'recommended' ? '5,5' : '0'}
                          opacity={conn.type === 'recommended' ? '0.6' : '0.8'}
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
                                isLocked={semester?.isLocked}
                                isCurrentSemester={semester?.isCurrentSemester}
                                onDropCourse={handleDropCourse}
                                onRemoveCourse={handleRemoveCourse}
                                onToggleLock={toggleSemesterLock}
                                onSetCurrentSemester={setCurrentSemester}
                                onHoverCourse={setHoveredCourseId}
                                highlightedCourses={highlightedCourses}
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

              {/* Sidebar - Validation and Progress */}
              <div className="w-80 overflow-y-auto space-y-4">
                {/* Validation Section */}
                <Collapsible 
                  open={isValidationOpen} 
                  onOpenChange={setIsValidationOpen}
                  className={validationIssues.length > 0 ? 'cursor-pointer' : ''}
                >
                  <Card className={`${
                    validationIssues.length > 0 
                      ? 'border-red-200 hover:border-red-300 transition-colors' 
                      : 'border-green-200 bg-green-50'
                  }`}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className={`pb-3 ${validationIssues.length > 0 ? 'cursor-pointer' : ''}`}>
                        <CardTitle className="text-base flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {validationIssues.length > 0 ? (
                              <>
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span>검증</span>
                                <Badge variant="destructive" className="h-5 px-1.5">
                                  {validationIssues.length}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span>검증 완료</span>
                              </>
                            )}
                          </div>
                          {validationIssues.length > 0 && (
                            isValidationOpen ? 
                              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    {validationIssues.length === 0 ? (
                      <CardContent className="pt-0 pb-4">
                        <div className="text-sm text-green-700">
                          현재 학기 계획에 문제가 없습니다.
                        </div>
                      </CardContent>
                    ) : (
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {validationIssues.map((issue, index) => {
                              const course = getCourseById(issue.courseId);
                              return (
                                <div 
                                  key={index}
                                  className={`p-3 rounded-lg border ${
                                    issue.severity === 'error'
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-yellow-50 border-yellow-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    {issue.severity === 'error' ? (
                                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <div className={`text-sm ${
                                        issue.severity === 'error' ? 'text-red-900' : 'text-yellow-900'
                                      }`}>
                                        <strong>{course?.name}</strong>: {issue.message}
                                      </div>
                                      {issue.suggestion && (
                                        <div className={`text-xs mt-1 ${
                                          issue.severity === 'error' ? 'text-red-700' : 'text-yellow-800'
                                        }`}>
                                          {issue.suggestion}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    )}
                  </Card>
                </Collapsible>

                {/* Progress Section */}
                {progressSummary && (
                  <ProgressPreview 
                    currentProgress={progressSummary} 
                    planCredits={totalCredits - progressSummary.totalCompleted}
                  />
                )}
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
        
        {/* Curriculum Wizard Modal */}
        <CurriculumWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      </div>
    </DndProvider>
  );
};