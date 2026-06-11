import { useEffect, useState } from 'react';
import { supabase, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export default function AttendanceManager() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, '출석' | '결석'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, members]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'approved')
      .order('name');

    if (!error && data) {
      setMembers(data as Profile[]);
    }
    setLoading(false);
  };

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('date', selectedDate);

    if (!error && data) {
      const statusMap = (data as any[]).reduce<Record<string, '출석' | '결석'>>((acc, record) => {
        if (record.user_id) {
          acc[record.user_id] = record.status;
        }
        return acc;
      }, {});
      setAttendanceStatuses(statusMap);
    } else {
      setAttendanceStatuses({});
    }
  };

  const toggleAttendance = (userId: string) => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [userId]: prev[userId] === '출석' ? '결석' : '출석',
    }));
  };

  const selectAll = () => {
    setAttendanceStatuses(
      members.reduce((acc, member) => {
        acc[member.id] = '출석';
        return acc;
      }, {} as Record<string, '출석' | '결석'>)
    );
  };

  const deselectAll = () => {
    setAttendanceStatuses(
      members.reduce((acc, member) => {
        acc[member.id] = '결석';
        return acc;
      }, {} as Record<string, '출석' | '결석'>)
    );
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const records = members.map((member) => ({
      date: selectedDate,
      user_id: member.id,
      status: attendanceStatuses[member.id] || '결석',
    }));

    const { error: upsertError } = await supabase
      .from('attendance_records')
      .upsert(records, { onConflict: ['date', 'user_id'] });

    if (upsertError) {
      setMessage({ type: 'error', text: '출석 정보 저장에 실패했습니다.' });
    } else {
      setMessage({ type: 'success', text: '출석 정보가 저장되었습니다.' });
    }
    setSaving(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">출석 체크</h2>
        <p className="text-slate-500 mt-1">
          날짜별 출석 현황을 관리합니다.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            <span className="text-slate-600">{formatDate(selectedDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              전체 선택
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              전체 해제
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg mb-4 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {members.map((member) => {
            const isPresent = attendanceStatuses[member.id] === '출석';
            return (
              <button
                key={member.id}
                onClick={() => toggleAttendance(member.id)}
                className={`flex flex-col items-start gap-2 px-3 py-3 rounded-xl border transition-all text-left ${
                  isPresent
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isPresent ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className={`text-xs mt-0.5 ${isPresent ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {isPresent ? '출석' : '결석'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            출석: {members.filter((member) => attendanceStatuses[member.id] === '출석').length} / {members.length}명
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
