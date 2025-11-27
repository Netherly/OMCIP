import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import Background1 from "../assets/images/background_lvl1.png"
import Background2 from "../assets/images/background_lvl2.png"
import Background3 from "../assets/images/background_lvl3.png"
import Tooth1 from "../assets/images/tooth1.png"
import Tooth2 from "../assets/images/tooth2.png"
import Tooth3 from "../assets/images/tooth3.png"
import Char1 from "../assets/images/char2.webm"
import Char2 from "../assets/images/char3.webm"
import Char3 from "../assets/images/char1.webm"
import * as API from "../utils/api";

export const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // ========== ОСНОВНЫЕ ИГРОВЫЕ ПАРАМЕТРЫ ==========
  // Инициализируем дефолтными значениями, сервер переинициализирует через loadGameState()
  
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(10000);
  const [baseCoinsPerClick, setBaseCoinsPerClick] = useState(1);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  
  // Опыт и прогресс (отправляется сервером)
  const [expCurrent, setExpCurrent] = useState(0);
  const [expRequired, setExpRequired] = useState(100);
  
  // Активный бонус от сервера
  const [activeBonus, setActiveBonus] = useState(null);
  
  // Визуальные элементы (отправляются сервером при разблокировке)
  const [toothImage, setToothImage] = useState(Tooth1);
  const [background, setBackground] = useState(Background1);
  const [character, setCharacter] = useState(Char1);
  
  // Профиль пользователя (загружается из Telegram WebApp)
  const [userProfile, setUserProfile] = useState({
    name: "Игрок",
    photo: "/assets/images/profile-placeholder.png"
  });

  // ========== УЛУЧШЕНИЯ И СЕРВИСЫ ==========
  // Загружаются с сервера
  
  const [upgrades, setUpgrades] = useState([]);
  const [services, setServices] = useState([]);
  const [userUpgrades, setUserUpgrades] = useState([]);
  const [userServices, setUserServices] = useState([]); // Покупленные услуги
  const [loadingUpgrades, setLoadingUpgrades] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // ========== ЗАДАЧИ ==========
  // Загружаются с сервера
  
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [loginRewards, setLoginRewards] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // ========== БАТЧИНГ КЛИКОВ ==========
  // Накопление кликов для отправки батчем на сервер каждые 150ms
  
  const clickBatchRef = useRef({ clicks: 0, timestamps: [] });
  const clickBatchTimeoutRef = useRef(null);

  // ========== СИСТЕМА БОНУСОВ ==========
  
  // Активация бонуса к тапам (множитель к coins_per_click)
  const activateTapBonus = (multiplier, durationMinutes) => {
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
    const bonus = {
      type: 'tap_multiplier',
      multiplier: multiplier,
      expiresAt: expiresAt,
      durationMinutes: durationMinutes
    };
    
    setActiveBonus(bonus);
    // Пересчитываем coinsPerClick сразу
    setCoinsPerClick(baseCoinsPerClick * multiplier);
    
    return bonus;
  };
  
  // Проверка и удаление истекших бонусов
  useEffect(() => {
    if (activeBonus && activeBonus.expiresAt) {
      const checkExpiration = () => {
        if (Date.now() >= activeBonus.expiresAt) {
          // Бонус истек
          setActiveBonus(null);
          setCoinsPerClick(baseCoinsPerClick);
        }
      };
      
      // Проверяем каждую секунду
      const interval = setInterval(checkExpiration, 1000);
      
      // Проверяем сразу
      checkExpiration();
      
      return () => clearInterval(interval);
    }
  }, [activeBonus, baseCoinsPerClick]);
  
  // Пересчитываем coinsPerClick при изменении бонуса или базового значения
  useEffect(() => {
    if (activeBonus && activeBonus.type === 'tap_multiplier') {
      setCoinsPerClick(baseCoinsPerClick * activeBonus.multiplier);
    } else {
      setCoinsPerClick(baseCoinsPerClick);
    }
  }, [baseCoinsPerClick, activeBonus]);

  // ========== ВОССТАНОВЛЕНИЕ ЭНЕРГИИ ==========
  
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => {
        if (prev < maxEnergy) {
          const regeneration = Math.min(coinsPerClick, 5);
          return Math.min(prev + regeneration, maxEnergy);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy, coinsPerClick]);

  // ========== ВИЗУАЛЬНЫЕ ЭЛЕМЕНТЫ ==========
  
  // Обновляем визуальные элементы в зависимости от уровня
  // TODO: Когда сервер будет отправлять данные о разблокировках (unlockedBackgrounds, unlockedTeeth, unlockedCharacters),
  // добавить логику для выбора правильных изображений
  
  const updateVisuals = (currentLevel) => {
    // Сейчас используем дефолтные значения
    // В будущем здесь будет логика выбора разблокированных элементов
  };

  useEffect(() => {
    updateVisuals(level);
  }, [level]);

  // Автоматически пересчитываем baseCoinsPerClick когда меняются апгрейды или юзер-апгрейды
  useEffect(() => {
    if (Array.isArray(upgrades) && Array.isArray(userUpgrades) && upgrades.length > 0 && userUpgrades.length > 0) {
      const totalCoins = calculateTotalCoinsPerClick(upgrades, userUpgrades);
      console.log('[GameContext] Auto-calculating baseCoinsPerClick from upgrades/userUpgrades:', totalCoins);
      setBaseCoinsPerClick(totalCoins);
    }
  }, [upgrades, userUpgrades]);

  // ========== ОБРАБОТКА КЛИКОВ ==========
  
  // Вычисление требуемого опыта для уровня (формула: 100 * 1.5^(level-1))
  const calculateExpRequired = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  // Вычисление опыта для текущего уровня (остаток после всех левелапов)
  const calculateExpForCurrentLevel = (totalExp, level) => {
    let expUsed = 0;
    for (let i = 1; i < level; i++) {
      expUsed += calculateExpRequired(i);
    }
    return totalExp - expUsed;
  };

  // Основной обработчик клика
  const handleClick = () => {
    // Проверяем, хватает ли энергии для клика
    if (energy >= baseCoinsPerClick) {
      // Сразу локально обновляем UI для отзывчивости (оптимистичное обновление)
      setCoins(prev => prev + baseCoinsPerClick);
      setEnergy(prev => prev - baseCoinsPerClick);
      
      // Добавляем опыт локально
      let newExp = expCurrent + baseCoinsPerClick;
      
      // Если опыт превышает требуемый, считаем скольео левелапов произойдет
      // (левел-ап на сервере, но локально покажем прогресс)
      while (newExp >= expRequired) {
        newExp = newExp - expRequired;
      }
      
      setExpCurrent(newExp);
      
      // Добавляем клик в батч для отправки на сервер
      clickBatchRef.current.clicks += 1;
      clickBatchRef.current.timestamps.push(Date.now());
      
      // Если уже есть таймаут, очищаем его
      if (clickBatchTimeoutRef.current) {
        clearTimeout(clickBatchTimeoutRef.current);
      }
      
      // Устанавливаем таймаут на отправку батча через 150ms
      clickBatchTimeoutRef.current = setTimeout(() => {
        if (clickBatchRef.current.clicks > 0) {
          const batchSize = clickBatchRef.current.clicks;
          console.log(`[GameContext] Sending batch of ${batchSize} clicks with baseCoinsPerClick: ${baseCoinsPerClick}`);
          
          // Отправляем батч кликов на сервер через WebSocket
          API.sendWebSocketMessage('game:click', {
            clicks: clickBatchRef.current.clicks,
            timestamps: clickBatchRef.current.timestamps,
            coinsPerClick: baseCoinsPerClick // Отправляем текущий бонус за клик
          });
          
          // Очищаем батч
          clickBatchRef.current = { clicks: 0, timestamps: [] };
          
          // Сервер сам отправит обновление состояния через WebSocket
          // (не запрашиваем явно, это экономит запросы к БД)
        }
      }, 150);
    }
  };

  // ========== ИНТЕГРАЦИЯ С СЕРВЕРОМ ==========
  
  // Загрузка всех доступных улучшений
  const loadUpgrades = async () => {
    try {
      setLoadingUpgrades(true);
      console.log('[GameContext] Loading upgrades from API...');
      const data = await API.getUpgrades();
      console.log('[GameContext] Upgrades loaded:', data);
      // Обработка ответа сервера - может быть в формате {data: [...]} или [...]
      let upgradesList = [];
      if (Array.isArray(data)) {
        upgradesList = data;
      } else if (data && Array.isArray(data.data)) {
        upgradesList = data.data;
      } else if (data && data.upgrades && Array.isArray(data.upgrades)) {
        upgradesList = data.upgrades;
      }
      console.log('[GameContext] Processed upgrades list:', upgradesList);
      setUpgrades(upgradesList);
    } catch (error) {
      console.error('[GameContext] Failed to load upgrades:', error);
      setUpgrades([]);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  // Загрузка всех доступных сервисов
  const loadServices = async () => {
    try {
      setLoadingServices(true);
      console.log('[GameContext] Loading services from API...');
      const data = await API.getServices();
      console.log('[GameContext] Services loaded:', data);
      // Обработка ответа сервера - может быть в формате {data: [...]} или [...]
      let servicesList = [];
      if (Array.isArray(data)) {
        servicesList = data;
      } else if (data && Array.isArray(data.data)) {
        servicesList = data.data;
      } else if (data && data.services && Array.isArray(data.services)) {
        servicesList = data.services;
      }
      console.log('[GameContext] Processed services list:', servicesList);
      setServices(servicesList);
    } catch (error) {
      console.error('[GameContext] Failed to load services:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Загрузка покупленных услуг - теперь запрашиваем свежее gameState
  const loadUserServices = async () => {
    try {
      console.log('[GameContext] Reloading user services via gameState...');
      // Просто запрашиваем свежее состояние которое включает user_services
      const gameStateData = await API.getGameState();
      if (gameStateData && gameStateData.user_services) {
        console.log('[GameContext] User services loaded from gameState:', gameStateData.user_services);
        setUserServices(gameStateData.user_services);
        return gameStateData.user_services;
      } else {
        console.log('[GameContext] No user_services in gameState');
        setUserServices([]);
        return [];
      }
    } catch (error) {
      console.error('[GameContext] Failed to load user services:', error);
      setUserServices([]);
      return [];
    }
  };

  // Загрузка улучшений пользователя
  const loadUserUpgrades = async () => {
    try {
      console.log('[GameContext] Loading user upgrades from API...');
      const data = await API.getUserUpgrades();
      console.log('[GameContext] User upgrades loaded:', data);
      // Обработка ответа сервера - может быть в формате {data: [...]} или [...]
      let userUpgradesList = [];
      if (Array.isArray(data)) {
        userUpgradesList = data;
      } else if (data && Array.isArray(data.data)) {
        userUpgradesList = data.data;
      } else if (data && data.upgrades && Array.isArray(data.upgrades)) {
        userUpgradesList = data.upgrades;
      }
      console.log('[GameContext] Processed user upgrades list:', userUpgradesList);
      setUserUpgrades(userUpgradesList);
      return userUpgradesList; // Возвращаем загруженный список
    } catch (error) {
      console.error('[GameContext] Failed to load user upgrades:', error);
      setUserUpgrades([]);
      return []; // Возвращаем пустой массив при ошибке
    }
  };

  // Загрузка ежедневных задач
  const loadDailyTasks = async () => {
    try {
      setLoadingTasks(true);
      console.log('[GameContext] Loading daily tasks from API...');
      const data = await API.getDailyTasks();
      console.log('[GameContext] Daily tasks loaded:', data);
      // Обработка ответа сервера
      let tasksList = [];
      if (Array.isArray(data)) {
        tasksList = data;
      } else if (data && Array.isArray(data.data)) {
        tasksList = data.data;
      } else if (data && data.tasks && Array.isArray(data.tasks)) {
        tasksList = data.tasks;
      }
      console.log('[GameContext] Processed daily tasks list:', tasksList);
      setDailyTasks(tasksList);
    } catch (error) {
      console.error('[GameContext] Failed to load daily tasks:', error);
      setDailyTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Загрузка еженедельных задач
  const loadWeeklyTasks = async () => {
    try {
      console.log('[GameContext] Loading weekly tasks from API...');
      const data = await API.getWeeklyTasks();
      console.log('[GameContext] Weekly tasks loaded:', data);
      // Обработка ответа сервера
      let tasksList = [];
      if (Array.isArray(data)) {
        tasksList = data;
      } else if (data && Array.isArray(data.data)) {
        tasksList = data.data;
      } else if (data && data.tasks && Array.isArray(data.tasks)) {
        tasksList = data.tasks;
      }
      console.log('[GameContext] Processed weekly tasks list:', tasksList);
      setWeeklyTasks(tasksList);
    } catch (error) {
      console.error('[GameContext] Failed to load weekly tasks:', error);
      setWeeklyTasks([]);
    }
  };

  // Загрузка награды за вход
  const loadLoginRewards = async () => {
    try {
      console.log('[GameContext] Loading login rewards from API...');
      const data = await API.getLoginRewards?.();
      if (data) {
        console.log('[GameContext] Login rewards loaded:', data);
        // Обработка ответа сервера
        let rewardsList = [];
        if (Array.isArray(data)) {
          rewardsList = data;
        } else if (data && Array.isArray(data.data)) {
          rewardsList = data.data;
        } else if (data && data.rewards && Array.isArray(data.rewards)) {
          rewardsList = data.rewards;
        }
        console.log('[GameContext] Processed login rewards list:', rewardsList);
        setLoginRewards(rewardsList);
      }
    } catch (error) {
      console.error('[GameContext] Failed to load login rewards:', error);
      // Не критично если награды не загружены
    }
  };

  // Функция для вычисления суммарного бонуса монет при клике от всех купленных апгрейдов
  const calculateTotalCoinsPerClick = (allUpgrades, allUserUpgrades) => {
    if (!Array.isArray(allUpgrades) || !Array.isArray(allUserUpgrades)) {
      return 1; // базовый бонус
    }
    
    let totalBonus = 1; // базовый бонус = 1
    
    allUserUpgrades.forEach(userUpgrade => {
      // Находим соответствующий апгрейд по upgrade_id
      const upgradeData = allUpgrades.find(u => u.id === userUpgrade.upgrade_id);
      if (upgradeData && upgradeData.base_value) {
        const bonus = parseFloat(upgradeData.base_value) || 0;
        totalBonus += bonus;
      }
    });
    
    return totalBonus;
  };

  // Загрузка состояния игры с сервера
  const loadGameState = (serverData) => {
    console.log('[GameContext] loadGameState called with:', serverData);
    
    if (serverData.user) {
      // Структура ответа с сервера: { user: {...}, ... }
      const user = serverData.user;
      if (user.coins !== undefined) setCoins(Number(user.coins));
      if (user.energy !== undefined) setEnergy(Number(user.energy));
      if (user.max_energy !== undefined) setMaxEnergy(Number(user.max_energy));
      if (user.level !== undefined) {
        setLevel(Number(user.level));
        setExpRequired(calculateExpRequired(Number(user.level)));
      }
      if (user.experience !== undefined && user.level !== undefined) {
        const expForCurrentLevel = calculateExpForCurrentLevel(Number(user.experience), Number(user.level));
        setExpCurrent(Math.max(0, expForCurrentLevel));
      }
      if (user.coins_per_click !== undefined) setCoinsPerClick(Number(user.coins_per_click));
      if (user.base_coins_per_click !== undefined) setBaseCoinsPerClick(Number(user.base_coins_per_click));
    } else {
      // Структура может быть плоская
      if (serverData.coins !== undefined) setCoins(Number(serverData.coins));
      if (serverData.energy !== undefined) setEnergy(Number(serverData.energy));
      if (serverData.max_energy !== undefined) setMaxEnergy(Number(serverData.max_energy));
      if (serverData.level !== undefined) {
        setLevel(Number(serverData.level));
        setExpRequired(calculateExpRequired(Number(serverData.level)));
      }
      if (serverData.experience !== undefined && serverData.level !== undefined) {
        const expForCurrentLevel = calculateExpForCurrentLevel(Number(serverData.experience), Number(serverData.level));
        setExpCurrent(Math.max(0, expForCurrentLevel));
      }
      if (serverData.coins_per_click !== undefined) setCoinsPerClick(Number(serverData.coins_per_click));
      if (serverData.base_coins_per_click !== undefined) setBaseCoinsPerClick(Number(serverData.base_coins_per_click));
    }
    
    // Загружаем покупленные услуги если они есть в ответе сервера
    if (serverData.user_services && Array.isArray(serverData.user_services)) {
      console.log('[GameContext] Setting user services from gameState:', serverData.user_services);
      setUserServices(serverData.user_services);
    }
    
    if (serverData.activeBoosts) setActiveBonus(serverData.activeBoosts[0] || null);
  };

  // Инициализация WebSocket соединения и слушателей
  useEffect(() => {
    const initSocket = async () => {
      // Небольшая задержка чтобы убедиться что токен загружен
      setTimeout(() => {
        console.log('[GameContext] Initializing WebSocket connection...');
        
        API.initializeWebSocket(
          (message) => {
            console.log('[GameContext] Received WebSocket message:', message);
            
            // Обрабатываем разные типы сообщений от сервера
            if (message.type === 'game:state') {
              console.log('[GameContext] Loading game state from server');
              loadGameState(message.data);
            } else if (message.type === 'energy:update') {
              console.log('[GameContext] Updating energy:', message.data);
              if (message.data.energy !== undefined) {
                setEnergy(message.data.energy);
              }
            } else if (message.type === 'game:click:result') {
              console.log('[GameContext] Click result received');
            }
          },
          (error) => {
            console.error('[GameContext] WebSocket error:', error);
          }
        );
        
        // Загружаем улучшения и сервисы после установления соединения
        loadUpgrades();
        loadServices();
        loadUserUpgrades();
        loadDailyTasks();
        loadWeeklyTasks();
        loadLoginRewards();
      }, 1000);
    };

    initSocket();

    // Cleanup при размонтировании
    return () => {
      // Отправляем оставшиеся клики перед отключением
      if (clickBatchRef.current.clicks > 0) {
        console.log(`[GameContext] Sending final batch of ${clickBatchRef.current.clicks} clicks on unmount with baseCoinsPerClick: ${baseCoinsPerClick}`);
        API.sendWebSocketMessage('game:click', {
          clicks: clickBatchRef.current.clicks,
          timestamps: clickBatchRef.current.timestamps,
          coinsPerClick: baseCoinsPerClick // Отправляем текущий бонус за клик
        });
      }
      
      // Очищаем таймаут
      if (clickBatchTimeoutRef.current) {
        clearTimeout(clickBatchTimeoutRef.current);
      }
      
      API.closeWebSocket();
    };
  }, []);

  // ========== ПРОВЕРКИ ДЛЯ УВЕДОМЛЕНИЙ В ФУТЕРЕ ==========
  
  // Проверка наличия доступных апгрейдов
  const hasAvailableUpgrades = () => {
    return upgrades && upgrades.length > 0;
  };

  // Проверка наличия доступных услуг
  const hasAvailableServices = () => {
    return services && services.length > 0;
  };

  // Проверка наличия доступных заданий
  const hasAvailableTasks = () => {
    // TODO: Когда сервер будет отправлять информацию о заданиях
    // Сейчас возвращаем false до интеграции
    return false;
  };

  // ========== ЗАГЛУШКИ ДЛЯ УДАЛЁННЫХ СВОЙСТВ ==========
  // Эти свойства удалены из GameContext в процессе очистки,
  // но компоненты их ещё используют. Добавляем заглушки.
  
  const addCoins = (amount) => {
    console.log('[GameContext] addCoins called with amount:', amount, 'type:', typeof amount);
    if (isNaN(amount)) {
      console.error('[GameContext] ERROR: amount is NaN!');
      return;
    }
    setCoins(prev => {
      // Убеждаемся что prev это число
      const prevNum = Number(prev);
      if (isNaN(prevNum)) {
        console.error('[GameContext] ERROR: prev is NaN! prev =', prev, 'type =', typeof prev);
        return prevNum;
      }
      const newCoins = Math.max(0, prevNum + amount);
      console.log('[GameContext] Coins updated: prev =', prevNum, 'amount =', amount, 'new =', newCoins);
      return newCoins;
    });
  };

  const invitedFriendsCount = 0;
  const unlockedBackgrounds = new Set([1]);
  const unlockedTeeth = new Set([1]);
  const unlockedCharacters = new Set([1]);
  const purchasedCharacter3 = false;
  
  const purchaseUpgrade = async (upgradeId) => {
    try {
      console.log('[GameContext] Purchasing upgrade:', upgradeId);
      const result = await API.purchaseUpgrade(upgradeId);
      console.log('[GameContext] Upgrade purchased:', result);
      
      // Перезагружаем список покупок пользователя и получаем обновленный список
      const updatedUserUpgrades = await loadUserUpgrades();
      
      // Считаем суммарный бонус на основе обновленного списка и текущего списка апгрейдов
      const totalCoins = calculateTotalCoinsPerClick(upgrades, updatedUserUpgrades);
      console.log('[GameContext] Setting baseCoinsPerClick to:', totalCoins);
      setBaseCoinsPerClick(totalCoins);
      
      return result;
    } catch (error) {
      console.error('[GameContext] Failed to purchase upgrade:', error);
      return false;
    }
  };

  const purchaseAutoClicker = () => false;
  
  const purchaseCharacter3 = () => false;
  
  const canPurchaseUpgrade = (upgradeId) => {
    // Проверяем, куплено ли уже это улучшение
    if (!upgradeId || !userUpgrades) return false;
    return !userUpgrades.some(u => u.id === upgradeId);
  };

  const canPurchaseAutoClicker = () => false;
  
  const getUpgradeLockReason = () => null;
  
  const getAutoClickerLockReason = () => null;
  
  const autoClickerConfig = [];
  // Безопасное создание Set из userUpgrades (проверяем что это массив)
  const purchasedUpgrades = new Set(
    Array.isArray(userUpgrades) ? userUpgrades.map(u => u.id) : []
  );
  const purchasedAutoClickerLevels = new Set();

  // ========== ЭКСПОРТ КОНТЕКСТА ==========
  
  const value = {
    // Основные параметры игры
    coins,
    level,
    energy,
    maxEnergy,
    coinsPerClick,
    baseCoinsPerClick,
    expCurrent,
    expRequired,
    
    // Визуальные элементы
    toothImage,
    background,
    character,
    userProfile,
    setUserProfile,
    
    // Система бонусов
    activeBonus,
    activateTapBonus,
    
    // Механики игры
    handleClick,
    
    // Улучшения и сервисы
    upgrades,
    services,
    userUpgrades,
    userServices,
    loadingUpgrades,
    loadingServices,
    loadUpgrades,
    loadServices,
    loadUserUpgrades,
    loadUserServices,
    
    // Задачи
    dailyTasks,
    weeklyTasks,
    loginRewards,
    loadingTasks,
    loadDailyTasks,
    loadWeeklyTasks,
    loadLoginRewards,
    
    // Проверки для UI
    hasAvailableUpgrades,
    hasAvailableServices,
    hasAvailableTasks,
    
    // Заглушки для удалённых свойств (TODO: интегрировать с сервером)
    addCoins,
    invitedFriendsCount,
    unlockedBackgrounds,
    unlockedTeeth,
    unlockedCharacters,
    purchasedCharacter3,
    purchaseUpgrade,
    purchaseAutoClicker,
    purchaseCharacter3,
    canPurchaseUpgrade,
    canPurchaseAutoClicker,
    getUpgradeLockReason,
    getAutoClickerLockReason,
    autoClickerConfig,
    purchasedUpgrades,
    purchasedAutoClickerLevels,
    
    // Утилиты
    calculateExpRequired,
    calculateExpForCurrentLevel,
    loadGameState,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
