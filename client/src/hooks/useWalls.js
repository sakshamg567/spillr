import { useState, useCallback, useEffect } from 'react';
import { wallService } from '../services/wallService.js';

export const useWalls = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createWall = useCallback(async (wallData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newWall = await wallService.create(wallData);
      setWalls(prev => [...prev, newWall]);
      
      return newWall;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWall = useCallback(async (slug) => {
    try {
      setLoading(true);
      setError(null);
      
      const wall = await wallService.getBySlug(slug);
      return wall;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWallTheme = useCallback(async (slug, themeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedWall = await wallService.updateTheme(slug, themeData);
      
      setWalls(prev => prev.map(wall => 
        wall.slug === slug ? updatedWall : wall
      ));
      
      return updatedWall;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const fetchWall = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const wallData = await wallService.getBySlug(slug);
      setWall(wallData);
      
      return wallData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const updateTheme = useCallback(async (themeData) => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedWall = await wallService.updateTheme(slug, themeData);
      setWall(updatedWall);
      
      return updatedWall;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchWall();
  }, [fetchWall]);

  return {
    wall,
    loading,
    error,
    refetch: fetchWall,
    updateTheme,
    clearError: () => setError(null)
  };
};

export const useWallCreationForm = () => {
  const [formData, setFormData] = useState({
    slug: ''
  });
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
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ slug: suggestion });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const wall = await createWall(formData);
      
      setFormData({ slug: '' });
      setSuggestions(wallService.generateSlugSuggestions());
      
      return wall;
    } catch (error) {
      setErrors({ submit: error.message });
      throw error;
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
      setThemes(themesData.themes);
      
      return themesData.themes;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return {
    themes,
    loading,
    error,
    refetch: fetchThemes
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

  const updateColor = useCallback((colorType, value) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }));
    
    const validation = wallService.validateCustomColors({
      ...colors,
      [colorType]: value
    });
    setErrors(validation.errors);
  }, [colors]);

  const resetColors = useCallback(() => {
    setColors({
      primary: '',
      background: '',
      accent: ''
    });
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