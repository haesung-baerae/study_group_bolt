import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ApprovalList from './ApprovalList';
import AnnouncementManager from './AnnouncementManager';
import AttendanceManager from './AttendanceManager';
import { Users, FileText, CalendarCheck, LogOut, BookOpen } from 'lucide-react';

type AdminTab = 'approval' | 'announcements' | 'attendance';

export default function AdminLayout() {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('approval');

  const tabs = [
    { id: 'approval' as const, label: '가입 승인', icon: Users },
    { id: 'announcements' as const, label: '공지사항 작성', icon: FileText },
    { id: 'attendance' as const, label: '출석 체크', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">스터디 모임</h1>
              <p className="text-xs text-slate-400">관리자</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium">
              {profile?.name?.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-700">{profile?.name}</span>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeTab === 'approval' && <ApprovalList />}
        {activeTab === 'announcements' && <AnnouncementManager />}
        {activeTab === 'attendance' && <AttendanceManager />}
      </main>
    </div>
  );
}
