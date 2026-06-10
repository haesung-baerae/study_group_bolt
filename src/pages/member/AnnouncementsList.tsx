import { useEffect, useState } from 'react';
import { supabase, Announcement } from '../../lib/supabase';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data as Announcement[]);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">공지사항</h2>
        <p className="text-slate-500 mt-1">관리자가 작성한 공지사항을 확인하세요.</p>
      </div>

      {selectedAnnouncement ? (
        <div className="bg-white rounded-xl p-6">
          <button
            onClick={() => setSelectedAnnouncement(null)}
            className="text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            ← 목록으로 돌아가기
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              {selectedAnnouncement.category}
            </span>
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(selectedAnnouncement.created_at)}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            {selectedAnnouncement.title}
          </h3>
          <p className="text-slate-600 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <button
              key={announcement.id}
              onClick={() => setSelectedAnnouncement(announcement)}
              className="w-full bg-white rounded-xl p-5 text-left hover:shadow-md transition-all border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {announcement.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(announcement.created_at)}
                </span>
              </div>
              <h4 className="font-medium text-slate-800">{announcement.title}</h4>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{announcement.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
