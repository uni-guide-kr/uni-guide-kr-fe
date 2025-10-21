import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlanList } from '../components/SemesterPlan/PlanList';
import { ValidationPanel } from '../components/SemesterPlan/ValidationPanel';
import { ProgressPreview } from '../components/SemesterPlan/ProgressPreview';
import { Plus, Download, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const SemesterPlanPage: React.FC = () => {
  const {
    semesterPlans,
    currentPlan,
    setCurrentPlan,
    createPlan,
    deletePlan,
    removeCourseFromPlan,
    getCoursesByIds,
    getCourseById,
    validatePlan,
    progressSummary,
  } = useApp();

  const [newPlanDialogOpen, setNewPlanDialogOpen] = useState(false);
  const [newSemester, setNewSemester] = useState('2025-1');

  const handleCreatePlan = () => {
    createPlan(newSemester);
    setNewPlanDialogOpen(false);
  };

  const handleExportPDF = () => {
    if (!currentPlan) return;

    // Simple text export for MVP
    const courses = getCoursesByIds(currentPlan.courses);
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const issues = validatePlan(currentPlan);

    const content = `
=== UniGuide 학기 계획 ===
학기: ${currentPlan.semester}
총 학점: ${totalCredits}

과목 목록:
${courses.map((c) => `- ${c.code} ${c.name} (${c.credits}학점)`).join('\n')}

검증 결과:
${issues.length === 0 ? '문제 없음' : issues.map((i) => `- ${i.message}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uniguide-plan-${currentPlan.semester}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      semesterPlans,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uniguide-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeletePlan = () => {
    if (currentPlan && confirm(`${currentPlan.semester} 학기 계획을 삭제하시겠습니까?`)) {
      deletePlan(currentPlan.id);
    }
  };

  const currentCourses = currentPlan ? getCoursesByIds(currentPlan.courses) : [];
  const totalCredits = currentCourses.reduce((sum, c) => sum + c.credits, 0);
  const validationIssues = currentPlan ? validatePlan(currentPlan) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            학기 계획
          </h1>
          <div className="flex gap-2">
            {currentPlan && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" />
                  TXT 내보내기
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <Download className="w-4 h-4 mr-1" />
                  JSON 백업
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeletePlan}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              </>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          학기별로 수강할 과목을 계획하고 졸업 요건 충족 여부를 확인하세요
        </p>
      </div>

      {/* Plan Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="plan-selector">학기 선택</Label>
              {semesterPlans.length > 0 ? (
                <Select
                  value={currentPlan?.id || ''}
                  onValueChange={(value) => {
                    const plan = semesterPlans.find((p) => p.id === value);
                    setCurrentPlan(plan || null);
                  }}
                >
                  <SelectTrigger id="plan-selector" className="mt-2">
                    <SelectValue placeholder="학기를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.semester} 학기 ({plan.courses.length}과목)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2 text-sm text-gray-500">생성된 학기 계획이 없습니다</p>
              )}
            </div>
            <div className="pt-6">
              <Button onClick={() => setNewPlanDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                새 학기 계획
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentPlan ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PlanList
              plan={currentPlan}
              courses={currentCourses}
              onRemoveCourse={removeCourseFromPlan}
              totalCredits={totalCredits}
            />

            <ValidationPanel issues={validationIssues} getCourseById={getCourseById} />
          </div>

          <div className="space-y-6">
            {progressSummary && (
              <ProgressPreview currentProgress={progressSummary} planCredits={totalCredits} />
            )}

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="text-blue-900">💡 학점 상한 안내</div>
                  <p className="text-blue-800">
                    학기당 최대 18학점까지 신청 가능합니다.
                    {totalCredits > 18 && (
                      <span className="block mt-2">
                        현재 {totalCredits}학점으로 {totalCredits - 18}학점 초과했습니다.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-400 mb-4">학기 계획을 생성하거나 선택해주세요</p>
          <Button onClick={() => setNewPlanDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            새 학기 계획 만들기
          </Button>
        </div>
      )}

      {/* New Plan Dialog */}
      <Dialog open={newPlanDialogOpen} onOpenChange={setNewPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 학기 계획 만들기</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="semester">학기</Label>
            <Input
              id="semester"
              placeholder="예: 2025-1"
              value={newSemester}
              onChange={(e) => setNewSemester(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              형식: YYYY-1 (1학기) 또는 YYYY-2 (2학기)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPlanDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreatePlan}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
