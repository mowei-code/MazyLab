import React, { useState, useEffect, useCallback } from 'react';
import type { RegistrationData } from '../types';
import { CloseIcon, TrashIcon, SpinnerIcon } from './IconComponents';

interface AdminPanelProps {
  t: (key: string) => string;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ t, onClose }) => {
  const [users, setUsers] = useState<RegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegistrationData | null>(null);
  const [formData, setFormData] = useState<RegistrationData>({ email: '', password: '', company: '', school: '', industry: '', phone: '' });
  
  const loadUsers = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem('mazylab_users') || '{}');
      const userList = Object.entries(storedUsers).map(([email, data]) => ({
        email,
        ...(data as Omit<RegistrationData, 'email'>),
      }));
      setUsers(userList);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenModal = (user: RegistrationData | null) => {
    setEditingUser(user);
    // When editing, clear the password field in the form state.
    // The form is for setting a NEW password. If left blank, the original is kept.
    setFormData(user ? { ...user, password: '' } : { email: '', password: '', company: '', school: '', industry: '', phone: '' });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    try {
        const storedUsers = JSON.parse(localStorage.getItem('mazylab_users') || '{}');
        const isEditing = !!editingUser;

        if (isEditing) {
            // Update existing user, keeping original password if not changed
            const updatedUser = { ...storedUsers[editingUser.email], ...formData };
            if (!formData.password) {
                updatedUser.password = storedUsers[editingUser.email].password;
            }
            storedUsers[editingUser.email] = updatedUser;
        } else {
            // Add new user
            if (storedUsers[formData.email]) {
                alert(t('admin_error_email_exists'));
                return;
            }
            if (!formData.password || formData.password.length < 6) {
                alert(t('auth_error_password_length'));
                return;
            }
            storedUsers[formData.email] = formData;
        }

        localStorage.setItem('mazylab_users', JSON.stringify(storedUsers));
        loadUsers();
        handleCloseModal();
    } catch (err) {
        console.error("Error saving user:", err);
        alert(t('admin_error_save'));
    }
  };
  
  const handleDeleteUser = (email: string) => {
    if (email === 'admin@mazylab.com') {
      alert(t('admin_error_delete_admin'));
      return;
    }
    if (window.confirm(t('admin_confirm_delete'))) {
        try {
            const storedUsers = JSON.parse(localStorage.getItem('mazylab_users') || '{}');
            delete storedUsers[email];
            localStorage.setItem('mazylab_users', JSON.stringify(storedUsers));
            loadUsers();
        } catch(err) {
            console.error("Error deleting user:", err);
            alert(t('admin_error_delete'));
        }
    }
  };

  const renderModal = () => (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out ${isModalOpen ? 'bg-opacity-70' : 'bg-opacity-0 pointer-events-none'}`}>
        <div className={`bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg transition-all duration-300 ease-in-out ${isModalOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">{editingUser ? t('admin_edit_user') : t('admin_add_user')}</h3>
                <button onClick={handleCloseModal} aria-label={t('close')} className="text-gray-400 hover:text-white transition-colors"><CloseIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {Object.keys(formData).map(key => (
                  <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">{t(`auth_${key}`)}</label>
                      <input 
                          type={key === 'password' ? 'password' : 'text'}
                          id={key}
                          name={key}
                          value={(formData as any)[key] || ''}
                          onChange={handleFormChange}
                          readOnly={key === 'email' && !!editingUser}
                          placeholder={key === 'password' && !!editingUser ? t('admin_password_placeholder') : ''}
                          className="w-full bg-gray-900 p-2 rounded-lg text-gray-300 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-700"
                      />
                  </div>
              ))}
              <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">{t('cancel')}</button>
                  <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{t('save')}</button>
              </div>
            </form>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 text-gray-200 font-sans p-4 sm:p-8 flex flex-col z-40">
        {renderModal()}
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
            <header className="flex justify-between items-center mb-8 flex-shrink-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{t('admin_panel_title')}</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenModal(null)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">{t('admin_add_user')}</button>
                    <button onClick={onClose} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">{t('admin_back_to_app')}</button>
                </div>
            </header>
            <main className="flex-grow bg-gray-800 p-6 rounded-2xl shadow-lg overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><SpinnerIcon className="h-12 w-12 animate-spin text-blue-500" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900">
                                <tr>
                                    {['email', 'company', 'school', 'industry', 'phone', 'actions'].map(col => (
                                        <th key={col} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t(`admin_col_${col}`)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {users.map((user) => (
                                <tr key={user.email} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.company || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.school || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.industry || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.phone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleOpenModal(user)} className="text-blue-400 hover:text-blue-300">{t('admin_edit')}</button>
                                    <button onClick={() => handleDeleteUser(user.email)} className="text-red-400 hover:text-red-300">{t('admin_delete')}</button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default AdminPanel;