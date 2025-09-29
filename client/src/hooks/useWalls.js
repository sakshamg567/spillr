import { useState, useCallback, useEffect } from 'react';
import { wallService } from '../services/wallService.js';

export const useWalls = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOperationPending, setIsOperationPending] = useState(false);

  const createWall = useCallback(async (wallData) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const newWall = await wallService.create(wallData);
      setWalls(prev => [...prev, newWall]);
      return newWall;
    } catch (err) {
      setError(err.message || 'Failed to create wall');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);


  const getWall = useCallback(async (slug) => {
    if (!slug) return null;
    try {
      setLoading(true);
      setError(null);
      const wall = await wallService.getBySlug(slug);
      return wall;
    } catch (err) {
      setError(err.message || 'Failed to load wall');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWallTheme = useCallback(async (slug, themeData) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const updatedWall = await wallService.updateTheme(slug, themeData);
      setWalls(prev => prev.map(wall => wall.slug === slug ? updatedWall : wall));
      return updatedWall;
    } catch (err) {
      setError(err.message || 'Failed to update theme');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  const clearError = useCallback(() => setError(null), []);

  return {
    walls,
    loading,
    error,
    createWall,
    getWall,
    updateWallTheme,
    clearError
  };
};

export const useWall = (slug) => {
  const [wall, setWall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOperationPending, setIsOperationPending] = useState(false);

  const fetchWall = useCallback(async () => {
    if (!slug || isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const wallData = await wallService.getBySlug(slug);
      setWall(wallData);
      return wallData;
    } catch (err) {
      setError(err.message || 'Failed to load wall');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [slug, isOperationPending]);

  const updateTheme = useCallback(async (themeData) => {
    if (!slug || isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const updatedWall = await wallService.updateTheme(slug, themeData);
      setWall(updatedWall);
      return updatedWall;
    } catch (err) {
      setError(err.message || 'Failed to update theme');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [slug, isOperationPending]);

  useEffect(() => {
    fetchWall();
  }, [fetchWall]);

  const clearError = useCallback(() => setError(null), []);

  return {
    wall,
    loading,
    error,
    refetch: fetchWall,
    updateTheme,
    clearError
  };
};

// ====== Wall Creation Form ======
export const useWallCreationForm = () => {
  const [formData, setFormData] = useState({ slug: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { createWall } = useWalls();

  useEffect(() => {
    setSuggestions(wallService.generateSlugSuggestions());
  }, []);

  const validateForm = () => {
    const validation = wallService.validateSlug(formData.slug);
    if (!validation.isValid) {
      setErrors({ slug: validation.error });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ slug: suggestion });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const wall = await createWall(formData);
      setFormData({ slug: '' });
      setSuggestions(wallService.generateSlugSuggestions());
      return wall;
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create wall' });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    suggestions,
    handleChange,
    handleSuggestionClick,
    handleSubmit
  };
};

export const useWallThemes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const themesData = await wallService.getAvailableThemes();
      setThemes(themesData.themes || []);
      return themesData.themes || [];
    } catch (err) {
      setError(err.message || 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const clearError = useCallback(() => setError(null), []);

  return {
    themes,
    loading,
    error,
    refetch: fetchThemes,
    clearError
  };
};

export const useCustomColors = (initialColors = {}) => {
  const [colors, setColors] = useState({
    primary: '',
    background: '',
    accent: '',
    ...initialColors
  });
  const [errors, setErrors] = useState([]);

 
  useEffect(() => {
    setColors(prev => ({
      primary: initialColors.primary || prev.primary,
      background: initialColors.background || prev.background,
      accent: initialColors.accent || prev.accent
    }));
  }, [initialColors]);

  const updateColor = useCallback((colorType, value) => {
    setColors(prev => {
      const newColors = { ...prev, [colorType]: value };
      const validation = wallService.validateCustomColors(newColors);
      setErrors(validation.errors || []);
      return newColors;
    });
  }, []);

  const resetColors = useCallback(() => {
    setColors({ primary: '', background: '', accent: '' });
    setErrors([]);
  }, []);

  const isValid = errors.length === 0;

  return {
    colors,
    errors,
    isValid,
    updateColor,
    resetColors,
    setColors
  };
};