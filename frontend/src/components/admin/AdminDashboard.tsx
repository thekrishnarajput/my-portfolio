import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProjectsManager from './ProjectsManager';
import SkillsManager from './SkillsManager';
import VisitorsManager from './VisitorsManager';
import HomepageConfigManager from './HomepageConfigManager';
import ContactManager from './ContactManager';
import { FaSignOutAlt, FaFolderOpen, FaCode, FaUsers, FaHome, FaEnvelope } from 'react-icons/fa';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'visitors' | 'homepage' | 'contact'>('projects');

  const tabs = [
    { id: 'projects' as const, label: 'Projects', icon: <FaFolderOpen /> },
    { id: 'skills' as const, label: 'Skills', icon: <FaCode /> },
    { id: 'visitors' as const, label: 'Visitors', icon: <FaUsers /> },
    { id: 'homepage' as const, label: 'Homepage Config', icon: <FaHome /> },
    { id: 'contact' as const, label: 'Messages', icon: <FaEnvelope /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 md:pt-28 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your portfolio content
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'skills' && <SkillsManager />}
          {activeTab === 'visitors' && <VisitorsManager />}
          {activeTab === 'homepage' && <HomepageConfigManager />}
          {activeTab === 'contact' && <ContactManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
