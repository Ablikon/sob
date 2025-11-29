import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  console.log('🔐 AuthLayout - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
      }}>
        <div className="loading" style={{ width: '40px', height: '40px', borderTopColor: 'white' }}></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    console.log('✅ User authenticated, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
    }}>
      <Outlet />
    </div>
  );
}
