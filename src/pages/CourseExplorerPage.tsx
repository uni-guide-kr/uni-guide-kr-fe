import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Input } from '../components/ui/input';
import { Search, ChevronDown } from 'lucide-react';
import { FilterPanel } from '../components/CourseExplorer/FilterPanel';
import { CourseCard } from '../components/CourseExplorer/CourseCard';
import { CourseDetailPanel } from '../components/CourseExplorer/CourseDetailPanel';
import { Course } from '../types';
import { Button } from '../components/ui/button';

export const CourseExplorerPage: React.FC = () => {
  const {
    courses,
    getCourseById,
    userProfile,
    addCourseToPlan,
    currentPlan,
    createPlan,
    isCourseCompleted,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    onlyAvailable: true,
    categories: [] as string[],
    credits: [] as number[],
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'workload' | 'careerFit' | 'major'>('major');
  
  // 새로운 필터 상태
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedSemester, setSelectedSemester] = useState<string>('1학기');
  const [selectedMajor, setSelectedMajor] = useState<string>('전체');
  
  // 드롭다운 열림 상태
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [isMajorOpen, setIsMajorOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const years = ['2024', '2025'];
  const semesters = ['1학기', '2학기', '하계계절', '동계계절'];
  const majors = ['전체', '컴퓨터공학과', '소프트웨어학과', '전기전자공학과', '기계공학과', '화학공학과'];

  const completedCourseIds = userProfile?.completedCourses.map((c) => c.courseId) || [];
  const plannedCourseIds = currentPlan?.courses || [];

  const checkPrerequisites = (course: Course): boolean => {
    return course.prerequisites.every((prereqId) => isCourseCompleted(prereqId));
  };

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    // Apply only available filter
    if (filters.onlyAvailable) {
      result = result.filter((course) => checkPrerequisites(course));
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((course) => filters.categories.includes(course.category));
    }

    // Apply credits filter
    if (filters.credits.length > 0) {
      result = result.filter((course) => filters.credits.includes(course.credits));
    }

    // Apply rating filter
    if (sortBy === 'rating') {
      result = result.filter((course) => course.rating !== undefined).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Apply workload filter (convert workload string to number)
    if (sortBy === 'workload') {
      result = result.filter((course) => {
        if (!course.workload) return false;
        const workloadNum = course.workload === 'low' ? 1 : course.workload === 'medium' ? 2 : 3;
        return workloadNum;
      }).sort((a, b) => {
        const aWorkload = a.workload === 'low' ? 1 : a.workload === 'medium' ? 2 : 3;
        const bWorkload = b.workload === 'low' ? 1 : b.workload === 'medium' ? 2 : 3;
        return aWorkload - bWorkload;
      });
    }

    // Apply career fit filter
    if (sortBy === 'careerFit') {
      result = result.filter((course) => course.careerFit).sort((a, b) => (b.careerFit || 0) - (a.careerFit || 0));
    }

    // Apply major filter
    if (sortBy === 'major') {
      result = result.filter((course) => course.major === selectedMajor || selectedMajor === '전체');
    }

    return result;
  }, [courses, searchQuery, filters, isCourseCompleted, sortBy, selectedMajor]);

  const handleAddToPlan = (courseId: string) => {
    if (!currentPlan) {
      createPlan('2025-1');
    }
    addCourseToPlan(courseId);
  };

  const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">과목 탐색</h1>
        <p className="text-gray-600">
          졸업 요건에 맞는 과목을 찾아 학기 계획에 추가하세요
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>
        </div>

        {/* Course List */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="mb-6 flex gap-3">
            {/* Year Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setIsYearOpen(!isYearOpen);
                  setIsSemesterOpen(false);
                  setIsMajorOpen(false);
                }}
                className="w-28 justify-between"
              >
                <span className="text-sm">{selectedYear}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              {isYearOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedYear === year ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Semester Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSemesterOpen(!isSemesterOpen);
                  setIsYearOpen(false);
                  setIsMajorOpen(false);
                }}
                className="w-32 justify-between"
              >
                <span className="text-sm">{selectedSemester}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              {isSemesterOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {semesters.map((semester) => (
                    <button
                      key={semester}
                      onClick={() => {
                        setSelectedSemester(semester);
                        setIsSemesterOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedSemester === semester ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {semester}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Major Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setIsMajorOpen(!isMajorOpen);
                  setIsYearOpen(false);
                  setIsSemesterOpen(false);
                }}
                className="w-40 justify-between"
              >
                <span className="text-sm truncate">{selectedMajor}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              {isMajorOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {majors.map((major) => (
                    <button
                      key={major}
                      onClick={() => {
                        setSelectedMajor(major);
                        setIsMajorOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedMajor === major ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {major}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="과목명 또는 과목코드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">{filteredCourses.length}개의 과목</p>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsYearOpen(false);
                  setIsSemesterOpen(false);
                  setIsMajorOpen(false);
                }}
                className="w-40 justify-between"
              >
                <span className="text-sm">
                  {sortBy === 'major' && '전공'}
                  {sortBy === 'careerFit' && '진로 적합도'}
                  {sortBy === 'rating' && '강의평'}
                  {sortBy === 'workload' && '과제량'}
                </span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              {isSortOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg right-0">
                  {[
                    { value: 'major', label: '전공' },
                    { value: 'careerFit', label: '진로 적합도' },
                    { value: 'rating', label: '강의평' },
                    { value: 'workload', label: '과제량' },
                  ].map((sort) => (
                    <button
                      key={sort.value}
                      onClick={() => {
                        setSortBy(sort.value as typeof sortBy);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                        sortBy === sort.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-gray-400 mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-500">필터를 완화하거나 다른 검색어를 입력해보세요</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isCompleted={isCourseCompleted(course.id)}
                  prerequisitesMet={checkPrerequisites(course)}
                  isInPlan={plannedCourseIds.includes(course.id)}
                  onAddToPlan={handleAddToPlan}
                  onShowDetails={(id) => setSelectedCourseId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <CourseDetailPanel
        course={selectedCourse}
        isOpen={selectedCourseId !== null}
        onClose={() => setSelectedCourseId(null)}
        getCourseById={getCourseById}
        isCompleted={selectedCourse ? isCourseCompleted(selectedCourse.id) : false}
        prerequisitesMet={selectedCourse ? checkPrerequisites(selectedCourse) : true}
        isInPlan={selectedCourse ? plannedCourseIds.includes(selectedCourse.id) : false}
        onAddToPlan={handleAddToPlan}
      />
    </div>
  );
};