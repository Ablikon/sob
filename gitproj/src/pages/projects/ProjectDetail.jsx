import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, Users, Calendar, GitBranch, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
      
      const tasksArray = Array.isArray(data) ? data : (data?.results || []);
      console.log('📋 Setting tasks:', tasksArray);
      console.log('📋 Tasks count:', tasksArray.length);
      setTasks(tasksArray);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Удалить эту задачу?')) return;
    try {
      await taskAPI.delete(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Ошибка удаления задачи');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found');
        return;
      }

      const updatedTaskData = {
        project: task.project,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: newStatus,
        assignee_id: task.assignee_id || null,
        deadline: task.deadline || '',
      };

      console.log('🔄 Updating task status:', taskId, 'to', newStatus);
      console.log('📝 Sending data:', updatedTaskData);

      await taskAPI.update(taskId, updatedTaskData);
      console.log('✅ Task status updated successfully');
      
      await loadTasks();
    } catch (error) {
      console.error('❌ Error updating task status:', error.response?.data);
      alert('Ошибка обновления статуса: ' + JSON.stringify(error.response?.data));
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
          <h3>Задачи ({tasks.length})</h3>
          <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn btn-primary btn-small">
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
                  <div className="flex justify-between items-center mb-2">
                    <h5 style={{ marginBottom: 0 }}>{getTaskStatusText(status)}</h5>
                    <span className="badge badge-secondary text-sm">{statusTasks.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
                    {statusTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
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
      {showTaskModal && (
        <TaskModal
          projectId={id}
          task={editingTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSuccess={loadTasks}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="card"
      style={{ 
        padding: '1rem', 
        marginBottom: 0, 
        cursor: 'pointer', 
        position: 'relative',
        transition: 'var(--transition)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    >
      <div className="flex justify-between items-start mb-2">
        <h6 style={{ marginBottom: 0, flex: 1, cursor: 'pointer' }} onClick={() => onEdit(task)}>
          {task.title}
        </h6>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <span className={`badge badge-${getPriorityColor(task.priority)}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
            {getPriorityText(task.priority)}
          </span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              ⋮
            </button>
            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: 'white',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 10,
                  minWidth: '150px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Edit size={14} />
                  Редактировать
                </button>
                <div style={{ borderTop: '1px solid var(--gray-200)' }}>
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    Переместить в:
                  </div>
                  {['todo', 'in_progress', 'review', 'done'].filter(s => s !== task.status).map(status => (
                    <button
                      key={status}
                      onClick={() => { onStatusChange(task.id, status); setShowMenu(false); }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      {getTaskStatusText(status)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { onDelete(task.id); setShowMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--danger)',
                    borderTop: '1px solid var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Trash2 size={14} />
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-2" style={{ lineHeight: '1.4' }}>
          {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center">
        {task.assignee_id && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users size={14} />
            <span>User {task.assignee_id}</span>
          </div>
        )}
        {task.deadline && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({ projectId, task, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    project: parseInt(projectId),
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    assignee_id: task?.assignee_id || '',
    deadline: task?.deadline || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      project: parseInt(formData.project),
      title: formData.title,
      description: formData.description || '',
      priority: formData.priority,
      status: formData.status,
      assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
      deadline: formData.deadline || '',
    };

    console.log(task ? '📝 Updating task:' : '📝 Creating task:', submitData);

    try {
      if (task) {
        await taskAPI.update(task.id, submitData);
        console.log('✅ Task updated');
      } else {
        const response = await taskAPI.create(submitData);
        console.log('✅ Task created:', response.data);
      }
      
      await onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error saving task:', err.response?.data);
      const errorMsg = err.response?.data?.detail || 
                      JSON.stringify(err.response?.data) || 
                      'Ошибка сохранения задачи';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Редактировать задачу' : 'Создать задачу'}</h3>
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
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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
                <option value="low">🟢 Низкий</option>
                <option value="medium">🔵 Средний</option>
                <option value="high">🟡 Высокий</option>
                <option value="urgent">🔴 Срочный</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Статус</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="todo">📝 К выполнению</option>
                <option value="in_progress">🔄 В процессе</option>
                <option value="review">👀 На проверке</option>
                <option value="done">✅ Выполнено</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Ответственный (User ID)</label>
              <input
                type="number"
                className="form-input"
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                placeholder="Оставьте пустым если не назначен"
              />
              <small className="text-gray-600 text-sm">Ваш ID: {user?.id}</small>
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
              {loading ? <span className="loading"></span> : (task ? 'Сохранить' : 'Создать')}
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
