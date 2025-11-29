import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { profileAPI } from '../lib/api';
import { User, Mail, Briefcase, GraduationCap, Github, Linkedin, MessageCircle, Plus } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await profileAPI.getMe();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Profile not found:', error);
      // Автоматически создаём профиль если его нет
      if (error.response?.status === 404) {
        try {
          const newProfileData = {
            user_id: user?.id,
            bio: '',
            university: '',
            faculty: '',
            course: null,
            github: '',
            linkedin: '',
            telegram: '',
          };
          
          const { data: createdProfile } = await profileAPI.create(newProfileData);
          setProfile(createdProfile);
          setFormData(createdProfile);
        } catch (createError) {
          console.error('Error creating profile:', createError);
          setProfile(null);
          setFormData({
            user_id: user?.id,
            bio: '',
            university: '',
            faculty: '',
            course: '',
            github: '',
            linkedin: '',
            telegram: '',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (profile) {
        await profileAPI.update(profile.id, formData);
      } else {
        await profileAPI.create(formData);
      }
      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
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
      <h1 className="mb-4">Мой профиль</h1>

      <div className="grid grid-cols-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center mb-4">
            <h3>Основная информация</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-primary btn-small">
                Редактировать
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setFormData(profile || {}); }} className="btn btn-secondary btn-small">
                  Отмена
                </button>
                <button onClick={handleSave} className="btn btn-primary btn-small">
                  Сохранить
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={40} style={{ color: 'var(--primary-600)' }} />
            </div>
            <div>
              <h4 className="mb-1">{user?.first_name} {user?.last_name}</h4>
              <p className="text-gray-600">{user?.username}</p>
              <p className="text-sm">
                <span className="badge badge-primary">{user?.role === 'student' ? 'Студент' : 'Преподаватель'}</span>
              </p>
            </div>
          </div>

          {editing ? (
            <div>
              <div className="form-group">
                <label className="form-label">О себе</label>
                <textarea
                  className="form-textarea"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Расскажите о себе..."
                />
              </div>

              {user?.role === 'student' && (
                <>
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Университет</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.university || ''}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Факультет</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.faculty || ''}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Курс</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        max="6"
                        value={formData.course || ''}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Группа</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.group || ''}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">GitHub</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.github || ''}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telegram</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.telegram || ''}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>
          ) : (
            <div>
              {profile?.bio && (
                <div className="mb-4">
                  <h5 className="mb-2">О себе</h5>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              {user?.role === 'student' && (profile?.university || profile?.faculty) && (
                <div className="mb-4">
                  <h5 className="mb-2 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Образование
                  </h5>
                  <p className="text-gray-600">
                    {profile.university} {profile.faculty && `• ${profile.faculty}`}
                    {profile.course && ` • ${profile.course} курс`}
                    {profile.group && ` • Группа ${profile.group}`}
                  </p>
                </div>
              )}

              {(profile?.github || profile?.linkedin || profile?.telegram) && (
                <div className="mb-4">
                  <h5 className="mb-2">Контакты</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Github size={18} />
                        GitHub
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Linkedin size={18} />
                        LinkedIn
                      </a>
                    )}
                    {profile.telegram && (
                      <p className="flex items-center gap-2">
                        <MessageCircle size={18} />
                        {profile.telegram}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h5>Навыки</h5>
              {!editing && (
                <button className="btn btn-primary btn-small">
                  <Plus size={14} />
                </button>
              )}
            </div>

            {profile?.skills && profile.skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.skills.map((skill) => (
                  <span key={skill.id} className={`badge badge-primary`}>
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Навыки не добавлены</p>
            )}
          </div>

          <div className="card">
            <h5 className="mb-3">Статистика</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p className="text-sm text-gray-600">Создан</p>
                <p className="font-semibold">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
