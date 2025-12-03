import React from 'react';
import { Course } from '../../types';
import { Card } from '../ui/card';
import { Clock } from 'lucide-react';

interface WeeklyTimetableProps {
  courses: Course[];
}

const DAYS = ['월', '화', '수', '목', '금'];
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => i + 9); // 9시부터 18시까지

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({ courses }) => {
  // 시간표에 표시할 과목들 (schedule 정보가 있는 과목만)
  const scheduledCourses = courses.filter(course => course.schedule && course.schedule.length > 0);

  // 각 시간대별로 과목 매핑
  const getCourseAtSlot = (day: number, hour: number) => {
    return scheduledCourses.filter(course => {
      return course.schedule?.some(slot => 
        slot.day === day && hour >= slot.startTime && hour < slot.endTime
      );
    });
  };

  // 과목이 해당 슬롯에서 시작하는지 확인
  const isCourseStartSlot = (course: Course, day: number, hour: number) => {
    return course.schedule?.some(slot => 
      slot.day === day && slot.startTime === hour
    );
  };

  // 과목의 해당 슬롯에서의 길이 계산
  const getCourseDuration = (course: Course, day: number, hour: number) => {
    const slot = course.schedule?.find(s => s.day === day && s.startTime === hour);
    return slot ? slot.endTime - slot.startTime : 1;
  };

  // 과목의 강의실 정보 가져오기
  const getCourseRoom = (course: Course, day: number) => {
    const slot = course.schedule?.find(s => s.day === day);
    return slot?.room;
  };

  if (scheduledCourses.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">이번 학기 시간표가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">커리큘럼 구성에서 과목을 추가해보세요</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          2025-2학기 시간표
        </h3>
      </div>
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-14 p-2 border bg-gray-50 text-xs text-gray-600"></th>
              {DAYS.map(day => (
                <th key={day} className="p-2 border bg-gray-50 text-sm w-1/5">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(hour => (
              <tr key={hour} className="h-16">
                <td className="border bg-gray-50 p-1 text-center text-xs text-gray-600 align-middle w-14">
                  <div className="text-xs leading-tight">{hour}:00</div>
                </td>
                {DAYS.map((_, dayIndex) => {
                  const coursesAtSlot = getCourseAtSlot(dayIndex, hour);
                  
                  if (coursesAtSlot.length === 0) {
                    return <td key={dayIndex} className="border bg-white h-16"></td>;
                  }

                  // 첫 번째 과목만 표시 (겹치는 경우)
                  const course = coursesAtSlot[0];
                  
                  // 시작 슬롯이 아니면 빈 셀 (rowspan으로 처리됨)
                  if (!isCourseStartSlot(course, dayIndex, hour)) {
                    return null;
                  }

                  const duration = getCourseDuration(course, dayIndex, hour);
                  const room = getCourseRoom(course, dayIndex);

                  return (
                    <td
                      key={dayIndex}
                      rowSpan={Math.ceil(duration)}
                      className="border p-2 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer align-top"
                      style={{ height: `${duration * 64}px` }}
                    >
                      <div className="text-xs overflow-hidden h-full flex flex-col">
                        <div className="font-medium text-blue-900 mb-1 line-clamp-2">
                          {course.name}
                        </div>
                        <div className="text-[10px] text-blue-700 space-y-0.5">
                          <div className="truncate">{course.code}</div>
                          {room && (
                            <div className="truncate text-blue-600">{room}</div>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};