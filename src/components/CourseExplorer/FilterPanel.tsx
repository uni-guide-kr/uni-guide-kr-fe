import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { X, Star, Briefcase, BookOpen } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    onlyAvailable: boolean;
    categories: string[];
    credits: number[];
  };
  onFilterChange: (filters: {
    onlyAvailable: boolean;
    categories: string[];
    credits: number[];
  }) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleCredit = (credit: number) => {
    const newCredits = filters.credits.includes(credit)
      ? filters.credits.filter((c) => c !== credit)
      : [...filters.credits, credit];
    onFilterChange({ ...filters, credits: newCredits });
  };

  const toggleAvailability = () => {
    onFilterChange({ ...filters, onlyAvailable: !filters.onlyAvailable });
  };

  const clearFilters = () => {
    onFilterChange({
      onlyAvailable: true,
      categories: [],
      credits: [],
    });
  };

  const hasActiveFilters =
    !filters.onlyAvailable ||
    filters.categories.length > 0 ||
    filters.credits.length > 0;

  const workloadLabels = ['', '하', '중', '상'];

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
        {/* Availability Filter - Top most, checked by default */}
        <div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="only-available"
              checked={filters.onlyAvailable}
              onCheckedChange={toggleAvailability}
            />
            <label
              htmlFor="only-available"
              className="text-sm cursor-pointer select-none flex-1"
            >
              이수 가능한 과목만 보기
            </label>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <Label className="mb-3 block">이수 구분</Label>
          <div className="space-y-2">
            {[
              { value: 'major-required', label: '전공필수' },
              { value: 'major-elective', label: '전공선택' },
              { value: 'university-required', label: '대학필수' },
              { value: 'department-required', label: '학과필수' },
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
      </CardContent>
    </Card>
  );
};