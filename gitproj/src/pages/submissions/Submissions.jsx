import { useState, useEffect } from 'react';
import { submissionAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Plus, Calendar, Star } from 'lucide-react';

export default function Submissions() {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      console.log('📤 Loading submissions, filter:', filter, 'user role:', user?.role);
      
      let data;
      if (filter === 'my') {
        const res = await submissionAPI.mySubmissions(user?.role);
        data = res.data;
        console.log('📤 My submissions response:', data);
      } else {
        const res = await submissionAPI.getAll();
        data = res.data;
        console.log('📤 All submissions response:', data);
      }
      
      console.log('📤 Is array?', Array.isArray(data));
      console.log('📤 Has results?', data?.results);
      
      // DRF может вернуть объект с пагинацией {results: [...]} или просто массив
      const submissionsArray = Array.isArray(data) ? data : (data?.results || []);
      console.log('📤 Setting submissions:', submissionsArray);
      console.log('📤 Submissions count:', submissionsArray.length);
      
      setSubmissions(submissionsArray);
    } catch (error) {
      console.error('❌ Error loading submissions:', error.response?.data || error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="loading" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Сдачи работ</h1>
        {user?.role === 'student' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Сдать работу
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="card mb-4">
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">Все сдачи</option>
          <option value="my">Мои сдачи</option>
        </select>
      </div>

      {/* Список сдач */}
      {submissions.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">Сдачи не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {submissions.map((submission) => (
            <div key={submission.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div style={{ flex: 1 }}>
                  <h4 className="mb-1">{submission.title}</h4>
                  <p className="text-sm text-gray-600">Проект ID: {submission.project_id}</p>
                </div>
                <span 
                  className={`badge badge-${getSubmissionStatusColor(submission.status)}`}
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'currentColor',
                      display: 'inline-block'
                    }}
                  />
                  {getSubmissionStatusText(submission.status)}
                </span>
              </div>

              <p className="text-gray-600 mb-3" style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {submission.description}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {submission.repository_url && (
                  <a 
                    href={submission.repository_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-small"
                    style={{ textAlign: 'center' }}
                  >
                    📦 Репозиторий
                  </a>
                )}
                {submission.demo_url && (
                  <a 
                    href={submission.demo_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-small"
                    style={{ textAlign: 'center' }}
                  >
                    🚀 Демо
                  </a>
                )}
              </div>

              <div className="flex justify-between items-center" style={{ 
                padding: '0.75rem',
                background: 'var(--gray-50)',
                borderRadius: 'var(--border-radius)'
              }}>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {new Date(submission.submitted_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {submission.grade !== null && (
                  <div 
                    className="flex items-center gap-2"
                    style={{
                      background: 'white',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--border-radius)',
                      border: '2px solid var(--warning)'
                    }}
                  >
                    <Star size={18} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                    <span className="font-semibold" style={{ fontSize: '1.1rem' }}>
                      {submission.grade} / {submission.max_grade}
                    </span>
                    {submission.grade_percentage && (
                      <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                        {submission.grade_percentage}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {user?.role === 'teacher' && submission.status === 'pending' && (
                <button
                  onClick={() => setSelectedSubmission(submission)}
                  className="btn btn-primary btn-small mt-3"
                  style={{ width: '100%' }}
                >
                  📝 Оценить работу
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && <CreateSubmissionModal onClose={() => setShowModal(false)} onSuccess={loadSubmissions} />}
      {selectedSubmission && (
        <GradeSubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={loadSubmissions}
        />
      )}
    </div>
  );
}

function CreateSubmissionModal({ onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    project_id: '',
    student_id: user?.id || 0,
    title: '',
    description: '',
    repository_url: '',
    demo_url: '',
    documentation_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('📤 Creating submission with data:', formData);

    try {
      const response = await submissionAPI.create(formData);
      console.log('✅ Submission created:', response.data);
      console.log('🔄 Refreshing submissions list...');
      
      await onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error creating submission:', err.response?.data);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Ошибка создания сдачи');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Сдать работу</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ID Проекта *</label>
            <input
              type="number"
              className="form-input"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) || '' })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Название *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание *</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL репозитория</label>
            <input
              type="url"
              className="form-input"
              value={formData.repository_url}
              onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL демо</label>
            <input
              type="url"
              className="form-input"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading"></span> : 'Сдать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeSubmissionModal({ submission, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    grade: '',
    status: 'approved',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submissionAPI.grade(submission.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Ошибка оценки работы');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Оценить работу</h3>
          <p className="text-gray-600">{submission.title}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Оценка *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max={submission.max_grade}
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Статус *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="approved">Принято</option>
                <option value="rejected">Отклонено</option>
                <option value="revision">Требует доработки</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Комментарий</label>
            <textarea
              className="form-textarea"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Оставьте отзыв для студента..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading"></span> : 'Сохранить оценку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getSubmissionStatusColor(status) {
  const colors = {
    pending: 'warning',
    reviewing: 'primary',
    approved: 'success',
    rejected: 'danger',
    revision: 'warning',
  };
  return colors[status] || 'primary';
}

function getSubmissionStatusText(status) {
  const texts = {
    pending: 'Ожидает проверки',
    reviewing: 'На проверке',
    approved: 'Принято',
    rejected: 'Отклонено',
    revision: 'Требует доработки',
  };
  return texts[status] || status;
}
