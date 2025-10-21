import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import { FilterPanel } from '../components/CourseExplorer/FilterPanel';
import { CourseCard } from '../components/CourseExplorer/CourseCard';
import { CourseDetailPanel } from '../components/CourseExplorer/CourseDetailPanel';
import { Course } from '../types';

export const CourseExplorerPage: React.FC = () => {
  const {
    courses,
    getCourseById,
    userProfile,
    addCourseToPlan,
    currentPlan,
    createPlan,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [] as string[],
    areas: [] as string[],
    credits: [] as number[],
    semesters: [] as string[],
    ratings: [] as number[],
    workloads: [] as string[],
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

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

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((course) => filters.categories.includes(course.category));
    }

    // Apply area filter
    if (filters.areas.length > 0) {
      result = result.filter((course) => course.area && filters.areas.includes(course.area));
    }

    // Apply credits filter
    if (filters.credits.length > 0) {
      result = result.filter((course) => filters.credits.includes(course.credits));
    }

    // Apply semester filter
    if (filters.semesters.length > 0) {
      result = result.filter((course) => filters.semesters.includes(course.offeredIn));
    }

    // Apply rating filter
    if (filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings);
      result = result.filter((course) => course.rating !== undefined && course.rating >= minRating);
    }

    // Apply workload filter
    if (filters.workloads.length > 0) {
      result = result.filter((course) => course.workload && filters.workloads.includes(course.workload));
    }

    return result;
  }, [courses, searchQuery, filters]);

  const completedCourseIds = userProfile?.completedCourses.map((c) => c.courseId) || [];
  const plannedCourseIds = currentPlan?.courses || [];

  const checkPrerequisites = (course: Course): boolean => {
    return course.prerequisites.every((prereqId) => completedCourseIds.includes(prereqId));
  };

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
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
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
                  isCompleted={completedCourseIds.includes(course.id)}
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
        isCompleted={selectedCourse ? completedCourseIds.includes(selectedCourse.id) : false}
        prerequisitesMet={selectedCourse ? checkPrerequisites(selectedCourse) : true}
        isInPlan={selectedCourse ? plannedCourseIds.includes(selectedCourse.id) : false}
        onAddToPlan={handleAddToPlan}
      />
    </div>
  );
};
