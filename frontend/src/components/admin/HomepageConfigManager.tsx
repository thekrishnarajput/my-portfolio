import { useState, useEffect } from 'react';
import { homepageConfigAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { IHomepageConfig } from '../../types/homepageConfig';
import { FaSave, FaEdit, FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaPalette } from 'react-icons/fa';

const HomepageConfigManager = () => {
  const [config, setConfig] = useState<IHomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { showFromResponse, showError } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await homepageConfigAPI.getActive();
      setConfig(response.data.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      // Prepare update data - exclude MongoDB internal fields
      const { _id, createdAt, updatedAt, ...updateData } = config;
      const response = await homepageConfigAPI.update(_id, updateData);
      setConfig(response.data.data);
      showFromResponse(response);
      setActiveSection(null);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionId: 'hero' | 'about' | 'projects' | 'skills' | 'contact') => {
    if (!config) return;
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [sectionId]: {
          ...config.sections[sectionId],
          enabled: !config.sections[sectionId].enabled,
        },
      },
    });
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!config) return;
    const order = [...config.order];
    const index = order.indexOf(sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [order[index], order[index - 1]] = [order[index - 1], order[index]];
    } else if (direction === 'down' && index < order.length - 1) {
      [order[index], order[index + 1]] = [order[index + 1], order[index]];
    }

    setConfig({ ...config, order });
  };

  const updateSection = (sectionId: 'hero' | 'about' | 'projects' | 'skills' | 'contact', data: any) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [sectionId]: {
          ...config.sections[sectionId],
          ...data,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No configuration found</p>
      </div>
    );
  }

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    about: 'About Section',
    projects: 'Projects Section',
    skills: 'Skills Section',
    contact: 'Contact Section',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Homepage Configuration</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage homepage sections, content, and display order
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Section Order & Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Section Order & Visibility</h3>
        <div className="space-y-3">
          {/* Branding Row */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex flex-col gap-1 w-6 items-center justify-center">
                {/* Icon aligned with order icons position */}
                <FaPalette className="text-primary-600 dark:text-primary-400 w-4 h-4" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                Branding
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Logo: {config.branding?.logo ? '✓ Configured' : 'Not set'}</span>
                <span>Favicon: {config.branding?.favicon ? '✓ Configured' : 'Not set'}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveSection(activeSection === 'branding' ? null : 'branding')}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              title="Edit Branding"
            >
              <FaEdit />
            </button>
          </div>

          {/* Section Rows */}
          {config.order.map((sectionId, index) => {
            const section = config.sections[sectionId as keyof typeof config.sections];
            if (!section) return null;

            return (
              <div
                key={sectionId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col gap-1 w-6">
                    <button
                      onClick={() => moveSection(sectionId, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => moveSection(sectionId, 'down')}
                      disabled={index === config.order.length - 1}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sectionLabels[sectionId] || sectionId}
                  </span>
                  <button
                    onClick={() => toggleSection(sectionId as 'hero' | 'about' | 'projects' | 'skills' | 'contact')}
                    className="flex items-center gap-2 text-sm"
                  >
                    {section.enabled ? (
                      <>
                        <FaToggleOn className="w-6 h-6 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Enabled</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-500">Disabled</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setActiveSection(activeSection === sectionId ? null : sectionId)}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  title={`Edit ${sectionLabels[sectionId] || sectionId}`}
                >
                  <FaEdit />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Editors */}
      {activeSection === 'branding' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Edit Branding
          </h3>
          <BrandingEditor
            config={config.branding || {}}
            onChange={(data) => {
              if (!config) return;
              setConfig({ ...config, branding: data });
            }}
          />
        </div>
      )}
      {activeSection && config.sections[activeSection as keyof typeof config.sections] && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Edit {sectionLabels[activeSection] || activeSection}
          </h3>
          {activeSection === 'hero' && (
            <HeroEditor
              config={config.sections.hero}
              onChange={(data) => updateSection('hero', data)}
            />
          )}
          {activeSection === 'about' && (
            <AboutEditor
              config={config.sections.about}
              onChange={(data) => updateSection('about', data)}
            />
          )}
          {activeSection === 'projects' && (
            <ProjectsEditor
              config={config.sections.projects}
              onChange={(data) => updateSection('projects', data)}
            />
          )}
          {activeSection === 'skills' && (
            <SkillsEditor
              config={config.sections.skills}
              onChange={(data) => updateSection('skills', data)}
            />
          )}
          {activeSection === 'contact' && (
            <ContactEditor
              config={config.sections.contact}
              onChange={(data) => updateSection('contact', data)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Section Editor Components
const HeroEditor = ({ config, onChange }: { config: any; onChange: (data: any) => void }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Badge
        </label>
        <input
          type="text"
          value={config.badge || ''}
          onChange={(e) => onChange({ ...config, badge: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="<SoftwareEngineer />"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Button</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={config.primaryButton?.text || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  primaryButton: { ...config.primaryButton, text: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="View Projects"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Link
            </label>
            <input
              type="text"
              value={config.primaryButton?.href || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  primaryButton: { ...config.primaryButton, href: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#projects"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Open in New Tab
          </label>
          <select
            value={config.primaryButton?.target || '_self'}
            onChange={(e) =>
              onChange({
                ...config,
                primaryButton: {
                  ...config.primaryButton,
                  target: e.target.value as '_self' | '_blank',
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="_self">Same Tab</option>
            <option value="_blank">New Tab</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Secondary Button</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={config.secondaryButton?.text || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  secondaryButton: { ...config.secondaryButton, text: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Get In Touch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Link
            </label>
            <input
              type="text"
              value={config.secondaryButton?.href || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  secondaryButton: { ...config.secondaryButton, href: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#contact"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Open in New Tab
          </label>
          <select
            value={config.secondaryButton?.target || '_self'}
            onChange={(e) =>
              onChange({
                ...config,
                secondaryButton: {
                  ...config.secondaryButton,
                  target: e.target.value as '_self' | '_blank',
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="_self">Same Tab</option>
            <option value="_blank">New Tab</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="text"
            value={config.socialLinks?.github || ''}
            onChange={(e) =>
              onChange({
                ...config,
                socialLinks: { ...config.socialLinks, github: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://github.com/username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn URL
          </label>
          <input
            type="text"
            value={config.socialLinks?.linkedin || ''}
            onChange={(e) =>
              onChange({
                ...config,
                socialLinks: { ...config.socialLinks, linkedin: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://www.linkedin.com/in/username"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email (for social links)
        </label>
        <input
          type="email"
          value={config.socialLinks?.email || ''}
          onChange={(e) =>
            onChange({
              ...config,
              socialLinks: { ...config.socialLinks, email: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="your.email@example.com"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showScrollIndicator"
          checked={config.showScrollIndicator !== false}
          onChange={(e) => onChange({ ...config, showScrollIndicator: e.target.checked })}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="showScrollIndicator" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Show Scroll Indicator
        </label>
      </div>
    </div>
  );
};

const AboutEditor = ({ config, onChange }: { config: any; onChange: (data: any) => void }) => {
  const [features, setFeatures] = useState(config.features || []);

  useEffect(() => {
    setFeatures(config.features || []);
  }, [config.features]);

  const updateFeatures = (newFeatures: any[]) => {
    setFeatures(newFeatures);
    onChange({ ...config, features: newFeatures });
  };

  const addFeature = () => {
    const newFeature = { title: '', description: '', icon: '' };
    updateFeatures([...features, newFeature]);
  };

  const removeFeature = (index: number) => {
    updateFeatures(features.filter((_: any, i: number) => i !== index));
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const updated = features.map((feature: any, i: number) =>
      i === index ? { ...feature, [field]: value } : feature
    );
    updateFeatures(updated);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Basic Information
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={config.subtitle || ''}
            onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Optional subtitle text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={config.description || ''}
            onChange={(e) => onChange({ ...config, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Professional Summary
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary Title
          </label>
          <input
            type="text"
            value={config.professionalSummary?.title || ''}
            onChange={(e) =>
              onChange({
                ...config,
                professionalSummary: {
                  ...config.professionalSummary,
                  title: e.target.value,
                  content: config.professionalSummary?.content || '',
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Professional Summary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary Content
          </label>
          <textarea
            value={config.professionalSummary?.content || ''}
            onChange={(e) =>
              onChange({
                ...config,
                professionalSummary: {
                  ...config.professionalSummary,
                  title: config.professionalSummary?.title || '',
                  content: e.target.value,
                },
              })
            }
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your professional summary..."
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Features</h4>
          <button
            onClick={addFeature}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <FaPlus /> Add Feature
          </button>
        </div>
        {features.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No features added. Click "Add Feature" to add one.
          </p>
        ) : (
          <div className="space-y-4">
            {features.map((feature: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Feature {index + 1}
                  </span>
                  <button
                    onClick={() => removeFeature(index)}
                    className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Icon (optional - icon identifier or URL)
                    </label>
                    <input
                      type="text"
                      value={feature.icon || ''}
                      onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Icon name or URL"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Feature title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={feature.description || ''}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Feature description"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience & Education */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Experience */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Experience
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Title
            </label>
            <input
              type="text"
              value={config.experience?.title || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  experience: {
                    ...config.experience,
                    title: e.target.value,
                    content: config.experience?.content || '',
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Experience"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Content
            </label>
            <textarea
              value={config.experience?.content || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  experience: {
                    ...config.experience,
                    title: config.experience?.title || '',
                    content: e.target.value,
                  },
                })
              }
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your experience details..."
            />
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Education
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education Title
            </label>
            <input
              type="text"
              value={config.education?.title || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  education: {
                    ...config.education,
                    title: e.target.value,
                    content: config.education?.content || '',
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Education"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education Content
            </label>
            <textarea
              value={config.education?.content || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  education: {
                    ...config.education,
                    title: config.education?.title || '',
                    content: e.target.value,
                  },
                })
              }
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your education details..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsEditor = ({ config, onChange }: { config: any; onChange: (data: any) => void }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Optional subtitle text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
    </div>
  );
};

const SkillsEditor = ({ config, onChange }: { config: any; onChange: (data: any) => void }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Optional subtitle text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
    </div>
  );
};

const ContactEditor = ({ config, onChange }: { config: any; onChange: (data: any) => void }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Optional subtitle text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={config.email || ''}
          onChange={(e) => onChange({ ...config, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="your.email@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          LinkedIn URL
        </label>
        <input
          type="text"
          value={config.linkedinUrl || ''}
          onChange={(e) => onChange({ ...config, linkedinUrl: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="https://www.linkedin.com/in/yourprofile"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showLinkedInFollowers"
          checked={config.showLinkedInFollowers !== false}
          onChange={(e) => onChange({ ...config, showLinkedInFollowers: e.target.checked })}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="showLinkedInFollowers" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Show LinkedIn Followers Count
        </label>
      </div>
    </div>
  );
};

const BrandingEditor = ({ config, onChange }: { config: any; onChange: (data: any) => void }) => {
  const handleImageUpload = (type: 'logo' | 'favicon', file: File | null) => {
    if (!file) {
      onChange({ ...config, [type]: '' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({ ...config, [type]: reader.result as string });
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo
        </label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload('logo', e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Upload an image file (PNG, JPG, SVG) or enter a URL. Max size: 2MB
          </div>
          {config.logo && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <img
                  src={config.logo}
                  alt="Logo preview"
                  className="max-h-32 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <button
                onClick={() => handleImageUpload('logo', null)}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove Logo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logo URL Input (Alternative) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo URL (Alternative to upload)
        </label>
        <input
          type="text"
          value={config.logo && !config.logo.startsWith('data:') ? config.logo : ''}
          onChange={(e) => onChange({ ...config, logo: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="https://example.com/logo.png"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter a URL to use an external logo image
        </div>
      </div>

      {/* Favicon Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Favicon
        </label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload('favicon', e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Upload a favicon (ICO, PNG) - Recommended size: 32x32 or 16x16. Max size: 2MB
          </div>
          {config.favicon && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <img
                  src={config.favicon}
                  alt="Favicon preview"
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <button
                onClick={() => handleImageUpload('favicon', null)}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove Favicon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Favicon URL Input (Alternative) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Favicon URL (Alternative to upload)
        </label>
        <input
          type="text"
          value={config.favicon && !config.favicon.startsWith('data:') ? config.favicon : ''}
          onChange={(e) => onChange({ ...config, favicon: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="https://example.com/favicon.ico"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter a URL to use an external favicon
        </div>
      </div>
    </div>
  );
};

export default HomepageConfigManager;
