import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Plus, Search, Users, Calendar } from 'lucide-react';

export default function Projects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    try {
      const { data } = filter === 'my'
        ? await projectAPI.myProjects()
        : await projectAPI.getAll();
      
      console.log('📦 Projects loaded:', data);
      console.log('📦 Is array?', Array.isArray(data));
      console.log('📦 Has results?', data?.results);
      
      // DRF может вернуть объект с пагинацией {results: [...]} или просто массив
      const projectsArray = Array.isArray(data) ? data : (data?.results || []);
      console.log('📦 Setting projects:', projectsArray);
      setProjects(projectsArray);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]); // Установим пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1>Проекты</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Создать проект
        </button>
      </div>

      {/* Фильтры */}
      <div className="card mb-4">
        <div className="flex gap-2 items-center">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={20}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Поиск проектов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">Все проекты</option>
            <option value="my">Мои проекты</option>
          </select>
        </div>
      </div>

      {/* Список проектов */}
      {filteredProjects.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">Проекты не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="flex justify-between items-start mb-2">
                <h4>{project.title}</h4>
                <span className={`badge badge-${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>

              <p className="text-gray-600 mb-3" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                {project.description.substring(0, 100)}
                {project.description.length > 100 && '...'}
              </p>

              <div className="flex gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  {project.members_count}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Без дедлайна'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Модальное окно создания проекта */}
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onSuccess={loadProjects} />}
    </div>
  );
}

function CreateProjectModal({ onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner_id: user?.id || 0,
    deadline: '',
    repository_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await projectAPI.create(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Ошибка создания проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Создать проект</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Название проекта *</label>
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
            <label className="form-label">Дедлайн</label>
            <input
              type="date"
              className="form-input"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading"></span> : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    planning: 'warning',
    in_progress: 'primary',
    review: 'warning',
    completed: 'success',
    archived: 'secondary',
  };
  return colors[status] || 'primary';
}

function getStatusText(status) {
  const texts = {
    planning: 'Планирование',
    in_progress: 'В процессе',
    review: 'На проверке',
    completed: 'Завершен',
    archived: 'Архивирован',
  };
  return texts[status] || status;
}
