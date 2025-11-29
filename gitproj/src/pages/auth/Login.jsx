import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    console.log('🔐 Attempting login with:', formData.username);
    
    const result = await login(formData);
    
    if (result.success) {
      console.log('✅ Login successful, waiting 100ms before redirect...');
      // Даём время для обновления состояния перед редиректом
      setTimeout(() => {
        console.log('➡️ Redirecting to dashboard...');
        navigate('/', { replace: true });
      }, 100);
    } else {
      setError(result.error?.detail || 'Ошибка входа');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</h1>
        <h2>Вход в систему</h2>
        <p className="text-gray-600">Student Project Hub</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Имя пользователя</label>
          <input
            type="text"
            className="form-input"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Пароль</label>
          <input
            type="password"
            className="form-input"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <span className="loading"></span>
          ) : (
            <>
              <LogIn size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Войти
            </>
          )}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }} className="text-gray-600">
        Нет аккаунта? <Link to="/register" style={{ fontWeight: 600 }}>Зарегистрироваться</Link>
      </p>
    </div>
  );
}
