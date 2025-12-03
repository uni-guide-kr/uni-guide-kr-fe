import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronRight, ChevronLeft, FileSpreadsheet, Upload, CheckCircle2, Info } from 'lucide-react';
import { UserProfile, CompletedCourse } from '../types';
import { MAJORS, ENROLLMENT_YEARS, COURSES } from '../data/mockData';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const [step, setStep] = useState(1);
  const [enrollmentYear, setEnrollmentYear] = useState<number>(2021);
  const [major, setMajor] = useState<string>('미디어학과');
  const [inputMethod, setInputMethod] = useState<'auto' | 'manual' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleInputMethodSelect = (method: 'auto' | 'manual') => {
    setInputMethod(method);
    if (method === 'manual') {
      // 수동 입력하기 선택 시 바로 완료
      onComplete({
        enrollmentYear,
        major,
        completedCourses: [],
      });
    } else {
      // 자동 입력하기 선택 시 다음 단계로
      setStep(3);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // TODO: 실제로는 파일을 파싱하여 completedCourses를 채워야 함
      // 여기서는 시연용으로 몇 개의 샘플 과목을 추가
      const sampleCourses: CompletedCourse[] = [
        { courseId: 'CS101', semester: '2021-1', credits: 3 },
        { courseId: 'MATH101', semester: '2021-1', credits: 3 },
        { courseId: 'ENG101', semester: '2021-1', credits: 3 },
        { courseId: 'PHYS101', semester: '2021-2', credits: 3 },
        { courseId: 'CS201', semester: '2022-1', credits: 3 },
      ];
      setCompletedCourses(sampleCourses);
    }
  };

  const handleFileComplete = () => {
    onComplete({
      enrollmentYear,
      major,
      completedCourses,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle>UniGuide 시작하기</DialogTitle>
          <DialogDescription>
            졸업 요건을 확인하기 위해 기본 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="enrollment-year">입학년도</Label>
                  <Select
                    value={enrollmentYear.toString()}
                    onValueChange={(value) => setEnrollmentYear(parseInt(value))}
                  >
                    <SelectTrigger id="enrollment-year" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENROLLMENT_YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}학번
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="major">주전공</Label>
                  <Select value={major} onValueChange={setMajor}>
                    <SelectTrigger id="major" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJORS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleNext}>
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-gray-600 mb-6">
                기이수 과목을 입력하면 더 정확한 졸업 진척도를 확인할 수 있습니다.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleInputMethodSelect('auto')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">자동 입력하기</h3>
                      <p className="text-sm text-gray-500">
                        성적표 파일(xls)을<br />업로드하여 자동 입력
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInputMethodSelect('manual')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">수동 입력하기</h3>
                      <p className="text-sm text-gray-500">
                        지금은 건너뛰고<br />나중에 직접 입력
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="mb-4">성적표 파일 업로드</h3>
              
              {/* 가이드 섹션 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-blue-900">학과 포털에서 성적표를 다운로드하세요</span>
                    </p>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>학과 포털 로그인</li>
                      <li>학사정보 → 성적조회 메뉴 이동</li>
                      <li>전체 성적 조회 후 'Excel 다운로드' 클릭</li>
                      <li>다운로드한 .xls 파일을 아래에 업로드</li>
                    </ol>
                  </div>
                </div>
                
                {/* 포털 스크린샷 예시 영역 */}
                <div className="mt-4 bg-white border border-gray-200 rounded p-3">
                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">학과 포털 성적표 다운로드 화면 예시</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 파일 업로드 영역 */}
              <div className="space-y-4">
                <Label>성적표 파일 선택</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-600 mb-1">파일이 업로드되었습니다</p>
                        <p className="text-sm text-gray-500">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {completedCourses.length}개의 과목이 인식되었습니다
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedFile(null);
                          setCompletedCourses([]);
                        }}
                      >
                        다시 선택
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".xls,.xlsx"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">파일을 선택하거나 드래그하세요</p>
                          <p className="text-sm text-gray-400">.xls 또는 .xlsx 파일만 가능</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button 
                onClick={handleFileComplete}
                disabled={!uploadedFile}
              >
                완료
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 pb-2">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
