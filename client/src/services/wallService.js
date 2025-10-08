import { apiRequest } from "./api.js";

export const wallService = {
    create: async (wallData) => {
        try{
            return await apiRequest('/api/wall',{
                method: 'POST',
                body: JSON.stringify(wallData)
            });
        }catch(error){
            console.error('Create wall error:',error);
            throw error;
        }
    },

   getBySlug: async (slug) => {
    try {
      return await apiRequest(`/api/wall/${slug}`);
    } catch (error) {
      console.error('Get wall error:', error);
      throw error;
    }
  },

  updateTheme: async (slug, themeData) => {
    try {
      return await apiRequest(`/api/wall/${slug}/theme`, {
        method: 'PATCH',
        body: JSON.stringify(themeData)
      });
    } catch (error) {
      console.error('Update wall theme error:', error);
      throw error;
    }
  },

  getAvailableThemes: async () => {
    try {
      return await apiRequest('/api/wall/themes/available');
    } catch (error) {
      console.error('Get themes error:', error);
      throw error;
    }
  },

  validateSlug: (slug) => {
    if (!slug || typeof slug !== 'string') {
      return { isValid: false, error: 'Slug is required' };
    }

    const trimmed = slug.trim();
    
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Slug must be at least 2 characters' };
    }

    if (trimmed.length > 50) {
      return { isValid: false, error: 'Slug must be less than 50 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { isValid: false, error: 'Slug can only contain letters, numbers, hyphens, and underscores' };
    }

    return { isValid: true };
  },

  generateSlugSuggestions: (baseName = '') => {
    const base = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const adjectives = ['cool', 'awesome', 'smart', 'quick', 'bright', 'fresh'];
    const nouns = ['feedback', 'wall', 'space', 'zone', 'hub', 'box'];
    
    const suggestions = [];
    
    if (base) {
      suggestions.push(base);
      suggestions.push(`${base}-${Math.floor(Math.random() * 1000)}`);
    }
    
    for (let i = 0; i < 3; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      suggestions.push(`${adj}-${noun}`);
    }
    
    return suggestions;
  },

  validateCustomColors: (colors) => {
    const errors = [];
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (colors.primary && !hexRegex.test(colors.primary)) {
      errors.push('Primary color must be a valid hex color');
    }

    if (colors.background && !hexRegex.test(colors.background)) {
      errors.push('Background color must be a valid hex color');
    }

    if (colors.accent && !hexRegex.test(colors.accent)) {
      errors.push('Accent color must be a valid hex color');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};