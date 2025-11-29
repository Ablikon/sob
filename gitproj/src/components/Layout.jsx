import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, FolderKanban, FileText, User, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-brand">
            🎓 Student Hub
          </div>
          
          <ul className="navbar-menu">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <Home size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Главная
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <FolderKanban size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Проекты
              </NavLink>
            </li>
            <li>
              <NavLink to="/submissions" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <FileText size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Сдачи
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <User size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                {user?.username}
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-secondary btn-small">
                <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Выход
              </button>
            </li>
          </ul>
        </div>
      </nav>
      
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      
      <footer style={{ backgroundColor: 'white', padding: '2rem 0', marginTop: '4rem', borderTop: '1px solid var(--gray-200)' }}>
        <div className="container text-center text-gray-600">
          <p>© 2025 Student Project Hub. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
