import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { X, Star } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    categories: string[];
    areas: string[];
    credits: number[];
    semesters: string[];
    ratings: number[];
    workloads: string[];
  };
  onFilterChange: (filters: {
    categories: string[];
    areas: string[];
    credits: number[];
    semesters: string[];
    ratings: number[];
    workloads: string[];
  }) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleArea = (area: string) => {
    const newAreas = filters.areas.includes(area)
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area];
    onFilterChange({ ...filters, areas: newAreas });
  };

  const toggleCredit = (credit: number) => {
    const newCredits = filters.credits.includes(credit)
      ? filters.credits.filter((c) => c !== credit)
      : [...filters.credits, credit];
    onFilterChange({ ...filters, credits: newCredits });
  };

  const toggleSemester = (semester: string) => {
    const newSemesters = filters.semesters.includes(semester)
      ? filters.semesters.filter((s) => s !== semester)
      : [...filters.semesters, semester];
    onFilterChange({ ...filters, semesters: newSemesters });
  };

  const toggleRating = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter((r) => r !== rating)
      : [...filters.ratings, rating];
    onFilterChange({ ...filters, ratings: newRatings });
  };

  const toggleWorkload = (workload: string) => {
    const newWorkloads = filters.workloads.includes(workload)
      ? filters.workloads.filter((w) => w !== workload)
      : [...filters.workloads, workload];
    onFilterChange({ ...filters, workloads: newWorkloads });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      areas: [],
      credits: [],
      semesters: [],
      ratings: [],
      workloads: [],
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.areas.length > 0 ||
    filters.credits.length > 0 ||
    filters.semesters.length > 0 ||
    filters.ratings.length > 0 ||
    filters.workloads.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">필터</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="mb-3 block">과목 구분</Label>
          <div className="space-y-2">
            {[
              { value: 'major-required', label: '전공필수' },
              { value: 'major-elective', label: '전공선택' },
              { value: 'general-required', label: '교양필수' },
              { value: 'general-elective', label: '교양선택' },
            ].map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={category.value}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={() => toggleCategory(category.value)}
                />
                <label
                  htmlFor={category.value}
                  className="text-sm cursor-pointer select-none"
                >
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Area Filter (for general education) */}
        <div>
          <Label className="mb-3 block">교양 영역</Label>
          <div className="space-y-2">
            {[
              { value: 'humanities', label: '인문' },
              { value: 'social-science', label: '사회' },
              { value: 'natural-science', label: '자연' },
              { value: 'arts', label: '예체능' },
              { value: 'language', label: '언어' },
              { value: 'writing', label: '글쓰기' },
            ].map((area) => (
              <div key={area.value} className="flex items-center space-x-2">
                <Checkbox
                  id={area.value}
                  checked={filters.areas.includes(area.value)}
                  onCheckedChange={() => toggleArea(area.value)}
                />
                <label htmlFor={area.value} className="text-sm cursor-pointer select-none">
                  {area.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Credits Filter */}
        <div>
          <Label className="mb-3 block">학점</Label>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((credit) => (
              <div key={credit} className="flex items-center space-x-2">
                <Checkbox
                  id={`credit-${credit}`}
                  checked={filters.credits.includes(credit)}
                  onCheckedChange={() => toggleCredit(credit)}
                />
                <label htmlFor={`credit-${credit}`} className="text-sm cursor-pointer select-none">
                  {credit}학점
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Semester Filter */}
        <div>
          <Label className="mb-3 block">개설 학기</Label>
          <div className="space-y-2">
            {[
              { value: 'spring', label: '1학기' },
              { value: 'fall', label: '2학기' },
              { value: 'both', label: '1·2학기' },
            ].map((semester) => (
              <div key={semester.value} className="flex items-center space-x-2">
                <Checkbox
                  id={semester.value}
                  checked={filters.semesters.includes(semester.value)}
                  onCheckedChange={() => toggleSemester(semester.value)}
                />
                <label htmlFor={semester.value} className="text-sm cursor-pointer select-none">
                  {semester.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <Label className="mb-3 block">강의평 별점</Label>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1, 0].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratings.includes(rating)}
                  onCheckedChange={() => toggleRating(rating)}
                />
                <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer select-none flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {rating}점 이상
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Filter */}
        <div>
          <Label className="mb-3 block">과제량</Label>
          <div className="space-y-2">
            {[
              { value: 'low', label: '하' },
              { value: 'medium', label: '중' },
              { value: 'high', label: '상' },
            ].map((workload) => (
              <div key={workload.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`workload-${workload.value}`}
                  checked={filters.workloads.includes(workload.value)}
                  onCheckedChange={() => toggleWorkload(workload.value)}
                />
                <label htmlFor={`workload-${workload.value}`} className="text-sm cursor-pointer select-none">
                  {workload.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
