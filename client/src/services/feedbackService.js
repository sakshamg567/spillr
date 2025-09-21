import { apiRequest } from './api.js';

export const feedbackService = {
  submit: async (feedbackData) => {
    try {
      return await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  },

  getPublic: async (slug) => {
    try {
      return await apiRequest(`/feedback/wall/${slug}`);
    } catch (error) {
      console.error('Get public feedback error:', error);
      throw error;
    }
  },

  getForOwner: async (wallId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/feedback/owner/${wallId}${queryString ? `?${queryString}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      console.error('Get owner feedback error:', error);
      throw error;
    }
  },

  answer: async (feedbackId, answer) => {
    try {
      return await apiRequest(`/feedback/${feedbackId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer })
      });
    } catch (error) {
      console.error('Answer feedback error:', error);
      throw error;
    }
  },

  react: async (feedbackId, emoji) => {
    try {
      return await apiRequest(`/feedback/${feedbackId}/react`, {
        method: 'POST',
        body: JSON.stringify({ emoji })
      });
    } catch (error) {
      console.error('React to feedback error:', error);
      throw error;
    }
  },

  archive: async (feedbackId, archived = true) => {
    try {
      return await apiRequest(`/feedback/${feedbackId}/archive`, {
        method: 'PATCH',
        body: JSON.stringify({ isArchived: archived })
      });
    } catch (error) {
      console.error('Archive feedback error:', error);
      throw error;
    }
  },

  validateQuestion: (question) => {
    if (!question || typeof question !== 'string') {
      return { isValid: false, error: 'Question is required' };
    }

    const trimmed = question.trim();
    
    if (trimmed.length < 3) {
      return { isValid: false, error: 'Question must be at least 3 characters' };
    }

    if (trimmed.length > 1000) {
      return { isValid: false, error: 'Question must be less than 1000 characters' };
    }

    return { isValid: true };
  },

  validateAnswer: (answer) => {
    if (!answer || typeof answer !== 'string') {
      return { isValid: false, error: 'Answer is required' };
    }

    const trimmed = answer.trim();
    
    if (trimmed.length < 1) {
      return { isValid: false, error: 'Answer cannot be empty' };
    }

    if (trimmed.length > 2000) {
      return { isValid: false, error: 'Answer must be less than 2000 characters' };
    }

    return { isValid: true };
  },

  getStats: (feedbacks) => {
    const total = feedbacks.length;
    const answered = feedbacks.filter(f => f.isAnswered).length;
    const archived = feedbacks.filter(f => f.isArchived).length;
    const active = feedbacks.filter(f => !f.isAnswered && !f.isArchived).length;
    
    const reactionStats = {};
    feedbacks.forEach(feedback => {
      if (feedback.reactions) {
        Object.entries(feedback.reactions).forEach(([emoji, count]) => {
          reactionStats[emoji] = (reactionStats[emoji] || 0) + count;
        });
      }
    });

    const topReactions = Object.entries(reactionStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emoji, count]) => ({ emoji, count }));

    return {
      total,
      answered,
      archived,
      active,
      answerRate: total > 0 ? Math.round((answered / total) * 100) : 0,
      reactionStats,
      topReactions
    };
  },

  filterFeedbacks: (feedbacks, filters) => {
    let filtered = [...feedbacks];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(f => 
        f.question.toLowerCase().includes(search) ||
        (f.answer && f.answer.toLowerCase().includes(search))
      );
    }

    if (filters.status) {
      switch (filters.status) {
        case 'active':
          filtered = filtered.filter(f => !f.isAnswered && !f.isArchived);
          break;
        case 'answered':
          filtered = filtered.filter(f => f.isAnswered && !f.isArchived);
          break;
        case 'archived':
          filtered = filtered.filter(f => f.isArchived);
          break;
      }
    }

    if (filters.hasReactions) {
      filtered = filtered.filter(f => 
        f.reactions && Object.keys(f.reactions).length > 0
      );
    }

    return filtered;
  }
};