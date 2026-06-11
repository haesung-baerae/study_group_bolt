import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { supabase, AttendanceRecord, Profile } from '../../lib/supabase';
import { AlertCircle, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface MemberStats {
  id: string;
  name: string;
  presentCount: number;
}

interface MonthlyStats {
  month: string;
  rate: number;
}

export default function AttendanceStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallRate, setOverallRate] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [memberData, setMemberData] = useState<MemberStats[]>([]);
  const [totalStudySessions, setTotalStudySessions] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profilesRes, attendanceRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('status', 'approved'),
        supabase.from('attendance_records').select('date, user_id, status'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (attendanceRes.error) throw attendanceRes.error;

      const profiles = (profilesRes.data ?? []) as Profile[];
      const attendance = (attendanceRes.data ?? []) as AttendanceRecord[];

      const sessionDates = new Set(attendance.map((record) => record.date));
      const totalSessions = sessionDates.size;
      const present = attendance.filter((record) => record.status === '출석').length;
      const totalRecords = attendance.length;
      const overallPercentage =
        totalRecords > 0 ? (present / totalRecords) * 100 : 0;

      setTotalStudySessions(totalSessions);
      setPresentCount(present);
      setTotalMembers(profiles.length);
      setOverallRate(Math.round(overallPercentage * 10) / 10);

      const monthlyMap = new Map<string, { present: number; total: number }>();

      attendance.forEach((record) => {
        const [, month] = record.date.split('-');
        const monthKey = `${parseInt(month, 10)}월`;

        const stats = monthlyMap.get(monthKey) ?? { present: 0, total: 0 };
        stats.total++;
        if (record.status === '출석') {
          stats.present++;
        }
        monthlyMap.set(monthKey, stats);
      });

      const monthlyStats: MonthlyStats[] = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
        .map(([month, stats]) => ({
          month,
          rate:
            stats.total > 0
              ? Math.round((stats.present / stats.total) * 1000) / 10
              : 0,
        }));

      setMonthlyData(monthlyStats);

      const memberStatsMap = new Map<string, { name: string; presentCount: number }>();

      profiles.forEach((profile) => {
        memberStatsMap.set(profile.id, { name: profile.name, presentCount: 0 });
      });

      attendance.forEach((record) => {
        if (record.status === '출석' && memberStatsMap.has(record.user_id)) {
          memberStatsMap.get(record.user_id)!.presentCount++;
        }
      });

      const memberStats: MemberStats[] = Array.from(memberStatsMap.entries())
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.presentCount - a.presentCount);

      setMemberData(memberStats);
    } catch (fetchError) {
      console.error('출석 통계 조회 실패:', fetchError);
      setError('출석 통계를 불러오지 못했습니다. 출석 데이터가 저장되어 있는지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">출석 통계</h2>
        </div>
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

  const monthlyChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: '출석률 (%)',
        data: monthlyData.map((d) => d.rate),
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: '#0d9488',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const memberChartData = {
    labels: memberData.map((m) => m.name),
    datasets: [
      {
        label: '출석 횟수',
        data: memberData.map((m) => m.presentCount),
        backgroundColor: [
          '#0d9488',
          '#0891b2',
          '#7c3aed',
          '#d946ef',
          '#f97316',
          '#eab308',
        ],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">출석 통계</h2>
        <p className="text-slate-500 mt-1">
          출석 현황 분석 및 통계를 확인합니다.
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-8 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-emerald-100 text-sm font-medium mb-2">전체 출석률</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">{overallRate}%</span>
              <span className="text-emerald-100">
                ({presentCount} / {totalStudySessions > 0 ? totalMembers * totalStudySessions : 0}회)
              </span>
            </div>
            <p className="text-emerald-100 text-sm mt-2">
              스터디 {totalStudySessions}회 · 승인 회원 {totalMembers}명
            </p>
          </div>
          <TrendingUp className="w-16 h-16 text-emerald-100" />
        </div>
      </div>

      {totalStudySessions === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-slate-500">
          아직 저장된 출석 기록이 없습니다. 출석 체크 메뉴에서 먼저 출석을 저장해주세요.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">월별 출석률</h3>
            {monthlyData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">표시할 월별 데이터가 없습니다.</p>
            ) : (
              <div className="h-80">
                <Line
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: (value) => `${value}%`,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">멤버별 출석 횟수</h3>
            {memberData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">표시할 멤버 데이터가 없습니다.</p>
            ) : (
              <div className="h-80">
                <Bar
                  data={memberChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
