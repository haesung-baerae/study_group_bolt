import { useAuth } from '../contexts/AuthContext';
import { Hourglass, LogOut } from 'lucide-react';

export default function PendingPage() {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-6">
            <Hourglass className="w-10 h-10 text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            승인 대기 중입니다
          </h1>

          <p className="text-slate-500 mb-2">
            {profile?.name}님, 회원가입 신청이 접수되었습니다.
          </p>

          <p className="text-slate-500 mb-8">
            관리자 승인 후 서비스를 이용하실 수 있습니다.
            <br />
            승인이 완료되면 이메일로 안내드리겠습니다.
          </p>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
