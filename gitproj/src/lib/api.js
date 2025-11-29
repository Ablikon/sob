import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// Создаём НОВУЮ функцию которая ВСЕГДА берёт актуальный токен
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API - БЕЗ токенов (для login/register)
export const authAPI = {
  register: (data) => axios.post('http://localhost:8001/api/register/', data),
  login: (data) => axios.post('http://localhost:8001/api/login/', data),
  logout: (refreshToken) => axios.post('http://localhost:8001/api/logout/', 
    { refresh: refreshToken },
    { headers: getAuthHeaders() }
  ),
  me: () => axios.get('http://localhost:8001/api/users/me/', 
    { headers: getAuthHeaders() }
  ),
};

// User Profile API - С токенами
export const profileAPI = {
  getAll: () => axios.get('http://localhost:8002/api/profiles/', 
    { headers: getAuthHeaders() }
  ),
  getOne: (id) => axios.get(`http://localhost:8002/api/profiles/${id}/`, 
    { headers: getAuthHeaders() }
  ),
  getMe: () => axios.get('http://localhost:8002/api/profiles/me/', 
    { headers: getAuthHeaders() }
  ),
  create: (data) => axios.post('http://localhost:8002/api/profiles/', data, 
    { headers: getAuthHeaders() }
  ),
  update: (id, data) => axios.put(`http://localhost:8002/api/profiles/${id}/`, data, 
    { headers: getAuthHeaders() }
  ),
  addSkill: (id, data) => axios.post(`http://localhost:8002/api/profiles/${id}/add_skill/`, data, 
    { headers: getAuthHeaders() }
  ),
  removeSkill: (id, skillId) => axios.delete(`http://localhost:8002/api/profiles/${id}/remove_skill/${skillId}/`, 
    { headers: getAuthHeaders() }
  ),
};

// Project API - С токенами
export const projectAPI = {
  getAll: (params) => {
    console.log('📦 projectAPI.getAll called with params:', params);
    return axios.get('http://localhost:8003/api/projects/', 
      { params, headers: getAuthHeaders() }
    );
  },
  getOne: (id) => {
    console.log('📦 projectAPI.getOne called with id:', id);
    return axios.get(`http://localhost:8003/api/projects/${id}/`, 
      { headers: getAuthHeaders() }
    );
  },
  myProjects: () => {
    console.log('📦 projectAPI.myProjects called');
    const headers = getAuthHeaders();
    console.log('📦 Headers:', headers);
    return axios.get('http://localhost:8003/api/projects/my_projects/', 
      { headers }
    );
  },
  create: (data) => axios.post('http://localhost:8003/api/projects/', data, 
    { headers: getAuthHeaders() }
  ),
  update: (id, data) => axios.put(`http://localhost:8003/api/projects/${id}/`, data, 
    { headers: getAuthHeaders() }
  ),
  delete: (id) => axios.delete(`http://localhost:8003/api/projects/${id}/`, 
    { headers: getAuthHeaders() }
  ),
  addMember: (id, data) => axios.post(`http://localhost:8003/api/projects/${id}/add_member/`, data, 
    { headers: getAuthHeaders() }
  ),
  removeMember: (id, userId) => axios.delete(`http://localhost:8003/api/projects/${id}/remove_member/${userId}/`, 
    { headers: getAuthHeaders() }
  ),
};

// Task API - С токенами
export const taskAPI = {
  getAll: (params) => {
    console.log('📋 taskAPI.getAll called with params:', params);
    return axios.get('http://localhost:8003/api/tasks/', 
      { params, headers: getAuthHeaders() }
    );
  },
  getOne: (id) => {
    console.log('📋 taskAPI.getOne called with id:', id);
    return axios.get(`http://localhost:8003/api/tasks/${id}/`, 
      { headers: getAuthHeaders() }
    );
  },
  myTasks: () => {
    console.log('📋 taskAPI.myTasks called');
    const headers = getAuthHeaders();
    console.log('📋 Headers:', headers);
    return axios.get('http://localhost:8003/api/tasks/my_tasks/', 
      { headers }
    );
  },
  create: (data) => axios.post('http://localhost:8003/api/tasks/', data, 
    { headers: getAuthHeaders() }
  ),
  update: (id, data) => axios.put(`http://localhost:8003/api/tasks/${id}/`, data, 
    { headers: getAuthHeaders() }
  ),
  delete: (id) => axios.delete(`http://localhost:8003/api/tasks/${id}/`, 
    { headers: getAuthHeaders() }
  ),
};

// Submission API - С токенами
export const submissionAPI = {
  getAll: (params) => axios.get('http://localhost:8004/api/submissions/', 
    { params, headers: getAuthHeaders() }
  ),
  getOne: (id) => axios.get(`http://localhost:8004/api/submissions/${id}/`, 
    { headers: getAuthHeaders() }
  ),
  mySubmissions: (role) => axios.get('http://localhost:8004/api/submissions/my_submissions/', 
    { params: { role }, headers: getAuthHeaders() }
  ),
  create: (data) => axios.post('http://localhost:8004/api/submissions/', data, 
    { headers: getAuthHeaders() }
  ),
  update: (id, data) => axios.put(`http://localhost:8004/api/submissions/${id}/`, data, 
    { headers: getAuthHeaders() }
  ),
  grade: (id, data) => axios.post(`http://localhost:8004/api/submissions/${id}/grade/`, data, 
    { headers: getAuthHeaders() }
  ),
  addAttachment: (id, data) => axios.post(`http://localhost:8004/api/submissions/${id}/add_attachment/`, data, 
    { headers: getAuthHeaders() }
  ),
};

// Review API - С токенами
export const reviewAPI = {
  getAll: (params) => axios.get('http://localhost:8004/api/reviews/', 
    { params, headers: getAuthHeaders() }
  ),
  create: (data) => axios.post('http://localhost:8004/api/reviews/', data, 
    { headers: getAuthHeaders() }
  ),
};

export default axios;
