import { useEffect, useState } from 'react';
import { supabase, StudyPost } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Plus, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function StudyPosts() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<StudyPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('기타');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('study_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as StudyPost[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from('study_posts').insert({
      title,
      content,
      topic,
      author_id: profile.id,
    });

    if (error) {
      setMessage({ type: 'error', text: '글 등록에 실패했습니다.' });
    } else {
      setMessage({ type: 'success', text: '글이 등록되었습니다.' });
      setTitle('');
      setContent('');
      setTopic('기타');
      setShowForm(false);
      fetchPosts();
    }
    setSaving(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isMyPost = (post: StudyPost) => post.author_id === profile?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">스터디 내용 올리기</h2>
          <p className="text-slate-500 mt-1">스터디 내용을 공유하고 기록하세요.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 글 작성
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">새 글 작성</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  주제
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                >
                  <option value="개발">개발</option>
                  <option value="디자인">디자인</option>
                  <option value="기획">기획</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="글 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
                  placeholder="스터디 내용을 입력하세요"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">등록된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl p-5 border ${
                isMyPost(post) ? 'border-slate-200' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {post.topic}
                </span>
                <span className="text-xs text-slate-400">{formatDate(post.created_at)}</span>
                {isMyPost(post) && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                    내 글
                  </span>
                )}
              </div>
              <h4 className="font-medium text-slate-800">{post.title}</h4>
              <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap line-clamp-3">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
