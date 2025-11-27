// API Configuration
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get stored token
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to set token
export const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Helper function to clear token
export const clearToken = () => {
  localStorage.removeItem('auth_token');
};

// Helper to make API requests with token
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Token added to headers');
  } else {
    console.log('[API] No token found in localStorage');
  }

  console.log(`[API] ${options.method || 'GET'} ${url}`);
  console.log('[API] Headers:', headers);
  if (options.body) {
    console.log('[API] Body:', options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`[API] Response status: ${response.status}`);
  
  const data = await response.json();
  console.log('[API] Response data:', data);

  if (!response.ok) {
    console.error(`[API] Request failed with status ${response.status}`, data);
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data;
};

// ========== AUTHENTICATION ==========

/**
 * Check auth service health
 */
export const checkAuthHealth = async () => {
  try {
    console.log('[API] Checking auth service health...');
    const response = await apiRequest('/auth/health', {
      method: 'GET',
    });
    console.log('[API] Auth health check response:', response);
    return response;
  } catch (error) {
    console.error('[API] Auth health check failed:', error);
    throw error;
  }
};

/**
 * Authenticate user via Telegram
 */
export const authenticateTelegram = async (initData) => {
  try {
    console.log('[API] authenticateTelegram called');
    const payload = { initData };
    console.log('[API] Payload being sent:', payload);
    
    const response = await apiRequest('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('[API] Auth response received:', response);
    
    // Server returns 'token' not 'access_token'
    if (response.token) {
      console.log('[API] Token found in response, storing...');
      setToken(response.token);
    } else if (response.access_token) {
      console.log('[API] access_token found in response, storing...');
      setToken(response.access_token);
    } else {
      console.warn('[API] No token found in response!');
    }

    console.log('[API] Token stored successfully, returning response:', response);
    return response;
  } catch (error) {
    console.error('[API] Authentication failed:', error);
    console.error('[API] Error message:', error.message);
    throw error;
  }
};

// ========== USER ==========

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  try {
    return await apiRequest('/user/profile', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw error;
  }
};

// ========== GAME ==========

/**
 * Get game state (coins, energy, boosts, upgrades, etc.)
 */
export const getGameState = async () => {
  try {
    return await apiRequest('/game/state', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get game state:', error);
    throw error;
  }
};

/**
 * Handle click (via WebSocket if available, REST fallback)
 */
export const sendClick = async (clickData = {}) => {
  try {
    // Пытаемся отправить через WebSocket
    if (socketInstance && socketInstance.connected) {
      console.log('[API] Sending click via WebSocket');
      return new Promise((resolve, reject) => {
        socketInstance.emit('game:click', clickData || {}, (response) => {
          if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });
    } else {
      // Fallback на REST если WebSocket недоступен
      console.log('[API] WebSocket unavailable, using REST for click');
      return await apiRequest('/game/click', {
        method: 'POST',
        body: JSON.stringify(clickData || {}),
      });
    }
  } catch (error) {
    console.error('Failed to send click:', error);
    throw error;
  }
};

/**
 * Activate boost
 */
export const activateBoost = async (boostData) => {
  try {
    return await apiRequest('/game/boost/activate', {
      method: 'POST',
      body: JSON.stringify(boostData),
    });
  } catch (error) {
    console.error('Failed to activate boost:', error);
    throw error;
  }
};

// ========== UPGRADES ==========

/**
 * Get all available upgrades
 */
export const getUpgrades = async () => {
  try {
    return await apiRequest('/upgrades', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get upgrades:', error);
    throw error;
  }
};

/**
 * Get user's purchased upgrades
 */
export const getUserUpgrades = async () => {
  try {
    return await apiRequest('/upgrades/user/my-upgrades', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get user upgrades:', error);
    throw error;
  }
};

/**
 * Purchase an upgrade
 */
export const purchaseUpgrade = async (upgradeId) => {
  try {
    return await apiRequest(`/upgrades/${upgradeId}/purchase`, {
      method: 'POST',
    });
  } catch (error) {
    console.error(`Failed to purchase upgrade ${upgradeId}:`, error);
    throw error;
  }
};

/**
 * Get next recommended upgrade
 */
export const getNextUpgradeRecommendation = async () => {
  try {
    return await apiRequest('/upgrades/user/next-recommendation', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get next upgrade recommendation:', error);
    throw error;
  }
};

// ========== SERVICES ==========

/**
 * Get all available services
 */
export const getServices = async () => {
  try {
    return await apiRequest('/services', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get services:', error);
    throw error;
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (serviceId) => {
  try {
    return await apiRequest(`/services/${serviceId}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error(`Failed to get service ${serviceId}:`, error);
    throw error;
  }
};

/**
 * Check service cooldown status
 */
export const checkServiceCooldown = async (serviceId) => {
  try {
    return await apiRequest(`/services/${serviceId}/check-cooldown`, {
      method: 'GET',
    });
  } catch (error) {
    console.error(`Failed to check service cooldown ${serviceId}:`, error);
    throw error;
  }
};

/**
 * Use (activate) a service
 */
export const useService = async (serviceId) => {
  try {
    return await apiRequest(`/services/${serviceId}/use`, {
      method: 'POST',
    });
  } catch (error) {
    console.error(`Failed to use service ${serviceId}:`, error);
    throw error;
  }
};

/**
 * Get service usage history
 */
export const getServiceUsage = async (serviceId) => {
  try {
    return await apiRequest(`/services/${serviceId}/usage`, {
      method: 'GET',
    });
  } catch (error) {
    console.error(`Failed to get service usage ${serviceId}:`, error);
    throw error;
  }
};

/**
 * Purchase a service
 */
export const purchaseService = async (serviceId) => {
  try {
    return await apiRequest(`/services/${serviceId}/purchase`, {
      method: 'POST',
    });
  } catch (error) {
    console.error(`Failed to purchase service ${serviceId}:`, error);
    throw error;
  }
};

// ========== TASKS ==========

/**
 * Get all daily tasks
 */
export const getDailyTasks = async () => {
  try {
    return await apiRequest('/tasks/daily', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get daily tasks:', error);
    throw error;
  }
};

/**
 * Get all weekly tasks
 */
export const getWeeklyTasks = async () => {
  try {
    return await apiRequest('/tasks/weekly', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to get weekly tasks:', error);
    throw error;
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (taskId) => {
  try {
    return await apiRequest(`/tasks/${taskId}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error(`Failed to get task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Claim task reward
 */
export const claimTaskReward = async (taskId) => {
  try {
    return await apiRequest(`/tasks/${taskId}/claim`, {
      method: 'POST',
    });
  } catch (error) {
    console.error(`Failed to claim task reward ${taskId}:`, error);
    throw error;
  }
};

// ========== WEBSOCKET (Socket.io) ==========

let socketInstance = null;

/**
 * Initialize Socket.io connection
 */
export const initializeWebSocket = (onMessage, onError) => {
  const token = getToken();
  if (!token) {
    console.warn('No token available for WebSocket connection');
    return null;
  }

  // Определяем правильный URL для WebSocket
  let WS_URL = import.meta.env.VITE_WS_URL;
  
  if (!WS_URL) {
    // Для разработки всегда используем localhost
    // Это упрощает тестирование с ngrok
    WS_URL = 'http://localhost:3000';
    console.log('[API] Using localhost for WebSocket (development mode)');
  }

  console.log('[API] WebSocket URL:', WS_URL);

  try {
    const socket = io(WS_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[API] WebSocket connected via Socket.io, socket.id:', socket.id);
      socketInstance = socket;
      console.log('[API] socketInstance updated, connected:', socketInstance.connected);
    });

    // Слушаем начальное состояние игры
    socket.on('game:state', (message) => {
      console.log('[API] Received game:state:', message);
      if (onMessage) {
        onMessage({ type: 'game:state', data: message });
      }
    });

    // Слушаем обновления энергии
    socket.on('game:energy:update', (message) => {
      console.log('[API] Received game:energy:update:', message);
      if (onMessage) {
        onMessage({ type: 'energy:update', data: message });
      }
    });

    // Слушаем результаты кликов
    socket.on('game:click:result', (message) => {
      console.log('[API] Received game:click:result:', message);
      if (onMessage) {
        onMessage({ type: 'game:click:result', data: message });
      }
    });

    // Слушаем ошибки от сервера
    socket.on('game:error', (message) => {
      console.error('[API] Received game:error:', message);
      if (onError) {
        onError(message);
      }
    });

    socket.on('disconnect', () => {
      console.log('[API] WebSocket disconnected');
      socketInstance = null;
    });

    socket.on('error', (error) => {
      console.error('[API] WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[API] WebSocket connection error:', error);
      if (onError) {
        onError(error);
      }
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    if (onError) {
      onError(error);
    }
    return null;
  }
};

/**
 * Send message via Socket.io
 */
export const sendWebSocketMessage = (event, data) => {
  if (!socketInstance) {
    console.warn('[API] WebSocket not initialized yet');
    return false;
  }
  
  if (!socketInstance.connected) {
    console.warn(`[API] WebSocket is not connected (connected=${socketInstance.connected})`);
    return false;
  }

  try {
    console.log(`[API] Emitting ${event}:`, data);
    socketInstance.emit(event, data);
    console.log(`[API] Successfully emitted ${event}`);
    return true;
  } catch (error) {
    console.error(`[API] Failed to emit ${event}:`, error);
    return false;
  }
};

/**
 * Close Socket.io connection
 */
export const closeWebSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default {
  // Auth
  authenticateTelegram,
  getToken,
  setToken,
  clearToken,

  // User
  getUserProfile,

  // Game
  getGameState,
  sendClick,
  activateBoost,

  // Upgrades
  getUpgrades,
  getUserUpgrades,
  purchaseUpgrade,
  getNextUpgradeRecommendation,

  // Services
  getServices,
  getServiceById,
  checkServiceCooldown,
  useService,
  getServiceUsage,
  purchaseService,

  // Tasks
  getDailyTasks,
  getWeeklyTasks,
  getTaskById,
  claimTaskReward,

  // WebSocket
  initializeWebSocket,
  sendWebSocketMessage,
  closeWebSocket,
};
