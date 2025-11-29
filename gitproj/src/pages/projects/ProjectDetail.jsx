import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../../lib/api';
import { ArrowLeft, Users, Calendar, GitBranch, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [id]);

  const loadProject = async () => {
    try {
      const { data } = await projectAPI.getOne(id);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      console.log('📋 Loading tasks for project:', id);
      const { data } = await taskAPI.getAll({ project_id: id });
      
      console.log('📋 Tasks response:', data);
      console.log('📋 Is array?', Array.isArray(data));
      console.log('📋 Has results?', data?.results);
      
      // Убедимся что data это массив (может быть пагинация)
      const tasksArray = Array.isArray(data) ? data : (data?.results || []);
      console.log('📋 Setting tasks:', tasksArray);
      console.log('📋 Tasks count:', tasksArray.length);
      
      setTasks(tasksArray);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]); // Установим пустой массив при ошибке
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="loading" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Проект не найден</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/projects" className="flex items-center gap-1 text-gray-600" style={{ width: 'fit-content' }}>
          <ArrowLeft size={18} />
          Назад к проектам
        </Link>
      </div>

      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-2">
              <h1 style={{ marginBottom: 0 }}>{project.title}</h1>
              <span className={`badge badge-${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Участников</p>
            <div className="flex items-center gap-1 mt-1">
              <Users size={18} />
              <span className="font-semibold">{project.members_count}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Задач</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="font-semibold">{project.tasks_count}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Дедлайн</p>
            <div className="flex items-center gap-1 mt-1">
              <Calendar size={18} />
              <span className="font-semibold">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Не указан'}
              </span>
            </div>
          </div>
          {project.repository_url && (
            <div>
              <p className="text-sm text-gray-600">Репозиторий</p>
              <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-1">
                <GitBranch size={18} />
                <span>GitHub</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Задачи */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3>Задачи</h3>
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-small">
            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Добавить задачу
          </button>
        </div>

        {!Array.isArray(tasks) || tasks.length === 0 ? (
          <p className="text-gray-600 text-center">Нет задач</p>
        ) : (
          <div className="grid grid-cols-4">
            {['todo', 'in_progress', 'review', 'done'].map((status) => {
              const statusTasks = tasks.filter((task) => task.status === status);
              return (
                <div key={status}>
                  <h5 className="mb-2">{getTaskStatusText(status)}</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {statusTasks.map((task) => (
                      <div key={task.id} className="card" style={{ padding: '1rem', marginBottom: 0 }}>
                        <div className="flex justify-between items-start mb-2">
                          <h6 style={{ marginBottom: 0 }}>{task.title}</h6>
                          <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        {task.deadline && (
                          <p className="text-sm text-gray-600">
                            <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                            {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Участники */}
      <div className="card">
        <h3 className="mb-3">Участники ({project.members_count || 0})</h3>
        {!project.members || project.members.length === 0 ? (
          <p className="text-gray-600 text-center">Нет участников</p>
        ) : (
          <div className="grid grid-cols-4">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <span>User {member.user_id}</span>
                </div>
                <span className="badge badge-primary text-sm">{member.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskModal && <CreateTaskModal projectId={id} onClose={() => setShowTaskModal(false)} onSuccess={loadTasks} />}
    </div>
  );
}

function CreateTaskModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    project: parseInt(projectId),
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('📝 Creating task with data:', formData);

    try {
      const response = await taskAPI.create(formData);
      console.log('✅ Task created:', response.data);
      console.log('🔄 Refreshing tasks list immediately...');
      
      // Сразу обновляем список задач без задержки
      await onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error creating task:', err.response?.data);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Ошибка создания задачи');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Создать задачу</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Описание</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Приоритет</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочный</option>
              </select>
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

function getPriorityColor(priority) {
  const colors = {
    low: 'success',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger',
  };
  return colors[priority] || 'primary';
}

function getPriorityText(priority) {
  const texts = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный',
  };
  return texts[priority] || priority;
}

function getTaskStatusText(status) {
  const texts = {
    todo: 'К выполнению',
    in_progress: 'В процессе',
    review: 'На проверке',
    done: 'Выполнено',
  };
  return texts[status] || status;
}
