import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase, Announcement, AttendanceRecord } from '../../lib/supabase';
import { BookOpen, Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

type MemberTab = 'home' | 'announcements' | 'upload' | 'info';

interface Props {
  onNavigate: (tab: MemberTab) => void;
}

export default function Home({ onNavigate }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [announcementsRes, attendanceRes] = await Promise.all([
      supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase.from('attendance_records').select('date'),
    ]);

    if (announcementsRes.data) {
      setAnnouncements(announcementsRes.data as Announcement[]);
    }
    if (attendanceRes.data) {
      setAttendanceDates(attendanceRes.data.map((r) => r.date));
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const calendarEvents = attendanceDates.map((date) => ({
    title: '출석',
    date,
    color: '#1e293b',
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">홈</h2>
          <p className="text-slate-500 mt-1">최신 소식과 일정을 확인하세요.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                최신 공지사항
              </h3>
              <button
                onClick={() => onNavigate('announcements')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                더보기
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {announcements.length === 0 ? (
              <p className="text-slate-400 text-center py-8">등록된 공지사항이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {announcement.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(announcement.created_at)}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-800 truncate">{announcement.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">{announcement.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5" />
              출석 일정
            </h3>
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="ko"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: '',
                }}
                events={calendarEvents}
                height="auto"
                dayMaxEvents={1}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">이번 달</h4>
                <p className="text-slate-300 text-sm">출석 {attendanceDates.length}회</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              캘린더에서 출석 일정을 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
