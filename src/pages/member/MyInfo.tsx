import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Shield, CheckCircle } from 'lucide-react';

export default function MyInfo() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const infoItems = [
    { icon: User, label: '이름', value: profile.name },
    { icon: Mail, label: '이메일', value: profile.email },
    { icon: Shield, label: '권한', value: profile.role === 'admin' ? '관리자' : '회원' },
    {
      icon: CheckCircle,
      label: '상태',
      value: profile.status === 'approved' ? '승인됨' : profile.status === 'pending' ? '대기중' : '거절됨',
    },
    { icon: Calendar, label: '가입일', value: formatDate(profile.created_at) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">내 정보</h2>
        <p className="text-slate-500 mt-1">계정 정보를 확인하세요.</p>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 p-6 bg-slate-50 border-b border-slate-100">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-600">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{profile.name}</h3>
            <p className="text-slate-500">{profile.email}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-4">
              <item.icon className="w-5 h-5 text-slate-400" />
              <span className="text-slate-500 w-20">{item.label}</span>
              <span className="text-slate-800 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
