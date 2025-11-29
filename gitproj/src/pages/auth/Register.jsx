import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.password_confirm) {
      setError('Пароли не совпадают');
      return;
    }
    
    setIsLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(JSON.stringify(result.error) || 'Ошибка регистрации');
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</h1>
        <h2>Регистрация</h2>
        <p className="text-gray-600">Student Project Hub</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Имя</label>
            <input
              type="text"
              className="form-input"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Фамилия</label>
            <input
              type="text"
              className="form-input"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Имя пользователя</label>
          <input
            type="text"
            className="form-input"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Роль</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Подтверждение</label>
            <input
              type="password"
              className="form-input"
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              required
              minLength={8}
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <span className="loading"></span>
          ) : (
            <>
              <UserPlus size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Зарегистрироваться
            </>
          )}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }} className="text-gray-600">
        Уже есть аккаунт? <Link to="/login" style={{ fontWeight: 600 }}>Войти</Link>
      </p>
    </div>
  );
}
