import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { projectAPI, submissionAPI, taskAPI } from '../lib/api';
import { FolderKanban, FileText, CheckSquare, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    projects: 0,
    submissions: 0,
    tasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [projectsRes, tasksRes, submissionsRes] = await Promise.all([
        projectAPI.myProjects(),
        taskAPI.myTasks(),
        submissionAPI.mySubmissions(user?.role),
      ]);

      // Убедимся что все данные это массивы
      const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const submissions = Array.isArray(submissionsRes.data) ? submissionsRes.data : [];

      setStats({
        projects: projects.length,
        tasks: tasks.length,
        submissions: submissions.length,
      });

      setRecentProjects(projects.slice(0, 5));
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Устанавливаем дефолтные значения при ошибке
      setStats({ projects: 0, tasks: 0, submissions: 0 });
      setRecentProjects([]);
      setRecentTasks([]);
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
        <h1>Панель управления</h1>
        <p className="text-gray-600">
          Добро пожаловать, {user?.first_name || user?.username}!
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 mb-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Мои проекты</p>
              <h2 className="mt-1">{stats.projects}</h2>
            </div>
            <FolderKanban size={40} style={{ color: 'var(--primary-600)' }} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Мои задачи</p>
              <h2 className="mt-1">{stats.tasks}</h2>
            </div>
            <CheckSquare size={40} style={{ color: 'var(--success)' }} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Сдачи работ</p>
              <h2 className="mt-1">{stats.submissions}</h2>
            </div>
            <FileText size={40} style={{ color: 'var(--warning)' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Последние проекты */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3>Последние проекты</h3>
              <Link to="/projects" className="text-primary text-sm">
                Все проекты →
              </Link>
            </div>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-gray-600 text-center">Нет проектов</p>
          ) : (
            <div>
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  style={{
                    display: 'block',
                    padding: '1rem',
                    borderBottom: '1px solid var(--gray-200)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gray-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="mb-1">{project.title}</h5>
                      <p className="text-sm text-gray-600">
                        {project.members_count} участников • {project.tasks_count} задач
                      </p>
                    </div>
                    <span className={`badge badge-${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Последние задачи */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3>Мои задачи</h3>
              <Link to="/projects" className="text-primary text-sm">
                Все задачи →
              </Link>
            </div>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-gray-600 text-center">Нет задач</p>
          ) : (
            <div>
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--gray-200)',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div style={{ flex: 1 }}>
                      <h5 className="mb-1">{task.title}</h5>
                      <p className="text-sm text-gray-600">
                        {task.deadline ? `Дедлайн: ${new Date(task.deadline).toLocaleDateString()}` : 'Без дедлайна'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </span>
                      <span className={`badge badge-${getTaskStatusColor(task.status)}`}>
                        {getTaskStatusText(task.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

function getTaskStatusColor(status) {
  const colors = {
    todo: 'warning',
    in_progress: 'primary',
    review: 'warning',
    done: 'success',
  };
  return colors[status] || 'primary';
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
