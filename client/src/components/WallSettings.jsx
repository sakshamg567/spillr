import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWall, useWallThemes, useCustomColors } from '../hooks/useWalls';
import { 
  Palette, 
  Link, 
  Settings, 
  Save, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  ArrowLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const WallSettings = () => {
  const { wallId } = useParams();
  const navigate = useNavigate();
  const { wall, loading, updateTheme } = useWall(wallId);
  const { themes, loading: themesLoading } = useWallThemes();
  const { colors, errors: colorErrors, isValid, updateColor, setColors } = useCustomColors(wall?.customColors);

  const [activeTab, setActiveTab] = useState('appearance');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (wall) setSelectedTheme(wall.theme || 'default');
  }, [wall]);

  const wallUrl = wall ? `${window.location.origin}/wall/${wall.slug}` : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(wallUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleSaveTheme = async () => {
    try {
      setSaveLoading(true);
      await updateTheme({ theme: selectedTheme, customColors: colors });
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteWall = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/wall/${wall.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Wall deleted successfully');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete wall');
      }
    } catch (error) {
      console.error('Wall deletion error:', error);
      alert('Failed to delete wall');
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'sharing', label: 'Sharing', icon: Link },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  const themePresets = [
    { id: 'default', name: 'Default', colors: { primary: '#000000', background: '#ffffff', accent: '#3b82f6' } },
    { id: 'dark', name: 'Dark', colors: { primary: '#ffffff', background: '#1f2937', accent: '#60a5fa' } },
    { id: 'ocean', name: 'Ocean', colors: { primary: '#0ea5e9', background: '#f0f9ff', accent: '#0284c7' } },
    { id: 'forest', name: 'Forest', colors: { primary: '#059669', background: '#f0fdf4', accent: '#10b981' } },
    { id: 'sunset', name: 'Sunset', colors: { primary: '#ea580c', background: '#fff7ed', accent: '#fb923c' } },
    { id: 'minimal', name: 'Minimal', colors: { primary: '#374151', background: '#f9fafb', accent: '#6b7280' } }
  ];

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    if (theme !== 'custom') {
      setColors({ primary: '', background: '', accent: '' });
    }
  };

  if (loading || themesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading wall settings...</p>
        </div>
      </div>
    );
  }

  if (!wall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wall not found</h1>
          <p className="text-gray-600">The wall you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div className="pl-4 border-l">
              <h1 className="text-3xl font-bold text-gray-900">Wall Settings</h1>
              <p className="text-gray-600">Customize your feedback wall: {wall.slug}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={wallUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
            <button onClick={handleSaveTheme} disabled={saveLoading || (!isValid && selectedTheme === 'custom')} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg disabled:bg-gray-400">
              <Save className="w-4 h-4" />
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white p-4 rounded-lg border space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg ${activeTab === id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-2">Choose a Theme</h2>
                <p className="text-gray-600 mb-4">Select a pre-built theme or create your own</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themePresets.map(theme => (
                    <button key={theme.id} onClick={() => handleThemeSelect(theme.id)} className={`p-4 border-2 rounded-lg ${selectedTheme === theme.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex gap-1 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.background }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                      </div>
                      <p className="text-sm font-medium">{theme.name}</p>
                    </button>
                  ))}
                  <button onClick={() => handleThemeSelect('custom')} className={`p-4 border-2 rounded-lg ${selectedTheme === 'custom' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-center mb-2">
                      <Palette className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">Custom</p>
                  </button>
                </div>

                {/* Custom Colors */}
                {selectedTheme === 'custom' && (
                  <div className="mt-6 border-t pt-6 space-y-4">
                    <h3 className="text-lg font-medium">Custom Colors</h3>
                    {colorErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                        {colorErrors.map((err, i) => <p key={i}>{err}</p>)}
                      </div>
                    )}
                    <div className="grid md:grid-cols-3 gap-4">
                      {['primary','background','accent'].map(key => (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)} Color</label>
                          <div className="flex gap-2">
                            <input type="color" value={colors[key] || '#000000'} onChange={e => updateColor(key, e.target.value)} className="w-12 h-10 rounded-lg border cursor-pointer"/>
                            <input type="text" value={colors[key] || ''} onChange={e => updateColor(key, e.target.value)} placeholder="#000000" className="flex-1 px-3 py-2 border rounded-lg"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other tabs (Sharing, Advanced) would be implemented here similarly */}
        </div>
      </div>
    </div>
  );
};

export default WallSettings;
