import React, { useState } from 'react';
import { Course } from '../../types';
import { DraggableCourseCard } from './DraggableCourseCard';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Plus, BookOpen, ChevronUp, ChevronDown, GripHorizontal, BookMarked } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface SavedCoursesListProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const SavedCoursesList: React.FC<SavedCoursesListProps> = ({
  courses,
  onRemoveCourse,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { courses: allCourses, addCourseToSaved, getCoursesByIds } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const savedCourseIds = courses.map((c) => c.id);
  const availableCourses = allCourses.filter((c) => !savedCourseIds.includes(c.id));

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddCourse = (courseId: string) => {
    addCourseToSaved(courseId);
    setIsDialogOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'major-required': return '전공필수';
      case 'major-elective': return '전공선택';
      case 'university-required': return '대학필수';
      case 'department-required': return '학과필수';
      default: return category;
    }
  };

  const getWorkloadLabel = (workload?: string) => {
    switch (workload) {
      case 'high': return '상';
      case 'medium': return '중';
      case 'low': return '하';
      default: return '-';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Drag Handle */}
      <div 
        className="flex items-center justify-center py-2 cursor-pointer hover:bg-gray-50 border-b"
        onClick={onToggleExpand}
      >
        <GripHorizontal className="w-6 h-6 text-gray-400" />
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-600 ml-2" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-600 ml-2" />
        )}
        <span className="ml-2 text-sm text-gray-600">
          {isExpanded ? '접기' : '펼쳐서 상세보기'}
        </span>
      </div>

      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h2>담은 과목</h2>
            <Badge variant="secondary">{courses.length}개</Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>과목 추가</DialogTitle>
                <DialogDescription>
                  커리큘럼에 추가할 과목을 검색하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="과목명 또는 과목코드 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="분류" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="major-required">전공필수</SelectItem>
                      <SelectItem value="major-elective">전공선택</SelectItem>
                      <SelectItem value="university-required">대학필수</SelectItem>
                      <SelectItem value="department-required">학과필수</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleAddCourse(course.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">{course.code}</span>
                            <Badge variant="outline" className="text-xs">
                              {course.credits}학점
                            </Badge>
                          </div>
                          <p className="mb-1">{course.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isExpanded && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="w-full">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="grid">카드뷰</TabsTrigger>
              <TabsTrigger value="list">상세뷰</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>과목을 추가하여 학기별로 배치해보세요</p>
          </div>
        ) : isExpanded && viewMode === 'list' ? (
          // Detailed List View
          <div className="space-y-3">
            {courses.map((course) => {
              return (
                <Card key={course.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">{course.code}</span>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(course.category)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {course.credits}학점
                            </Badge>
                          </div>
                          <h3 className="mb-2">{course.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">과제량</span>
                          <div className="mt-1">
                            <Badge variant="secondary">
                              {getWorkloadLabel(course.workload)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">담당교수</span>
                          <div className="mt-1">{course.professor || '-'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <DraggableCourseCard course={course} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // Compact Grid View
          <div className={`grid gap-2 ${isExpanded ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {courses.map((course) => (
              <div key={course.id} className="relative group">
                <DraggableCourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
