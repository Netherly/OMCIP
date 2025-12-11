import React, { createContext, useState, useEffect, useContext } from "react";
import Background1 from "../assets/images/background_lvl1.png"
import Background2 from "../assets/images/background_lvl2.png"
import Background3 from "../assets/images/background_lvl3.png"
import Tooth1 from "../assets/images/tooth1.png"
import Tooth2 from "../assets/images/tooth2.png"
import Tooth3 from "../assets/images/tooth3.png"
import Char1 from "../assets/images/char2.webm"
import Char2 from "../assets/images/char3.webm"
import Char3 from "../assets/images/char1.webm"

export const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

// Ключи для localStorage
const LAST_ONLINE_KEY = "dental_clicker_last_online";
const AUTOCLICKER_LEVEL_KEY = "dental_clicker_autoclicker_level";
const OFFLINE_COINS_KEY = "dental_clicker_offline_coins";
const PURCHASED_UPGRADES_KEY = "dental_clicker_purchased_upgrades";
const PURCHASED_AUTOCLICKERS_KEY = "dental_clicker_purchased_autoclickers";
const DAILY_TASKS_KEY = "dental_clicker_daily_tasks";
const WEEKLY_TASKS_KEY = "dental_clicker_weekly_tasks";
const LOGIN_REWARDS_KEY = "dental_clicker_login_rewards";
const LOGIN_STREAK_KEY = "dental_clicker_login_streak";
const LAST_LOGIN_DATE_KEY = "dental_clicker_last_login_date";
const ACTIVE_BONUS_KEY = "dental_clicker_active_bonus";
const INVITED_FRIENDS_KEY = "dental_clicker_invited_friends";
const UNLOCKED_BACKGROUNDS_KEY = "dental_clicker_unlocked_backgrounds";
const UNLOCKED_TEETH_KEY = "dental_clicker_unlocked_teeth";
const UNLOCKED_CHARACTERS_KEY = "dental_clicker_unlocked_characters";
const PURCHASED_CHARACTER3_KEY = "dental_clicker_purchased_character3";

export const GameProvider = ({ children }) => {
  // Основные игровые параметры
  const [coins, setCoins] = useState(1);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(10000);
  const [maxEnergy] = useState(10000);
  const [baseCoinsPerClick, setBaseCoinsPerClick] = useState(1);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  
  // Активный бонус
  const [activeBonus, setActiveBonus] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_BONUS_KEY);
    if (saved) {
      const bonus = JSON.parse(saved);
      // Проверяем, не истек ли бонус
      if (bonus.expiresAt && bonus.expiresAt > Date.now()) {
        return bonus;
      }
    }
    return null;
  });

  const [invitedFriendsCount, setInvitedFriendsCount] = useState(() => {
    const saved = localStorage.getItem(INVITED_FRIENDS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [unlockedBackgrounds, setUnlockedBackgrounds] = useState(() => {
    const saved = localStorage.getItem(UNLOCKED_BACKGROUNDS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set([1]);
  });

  const [unlockedTeeth, setUnlockedTeeth] = useState(() => {
    const saved = localStorage.getItem(UNLOCKED_TEETH_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set([1]);
  });

  const [unlockedCharacters, setUnlockedCharacters] = useState(() => {
    const saved = localStorage.getItem(UNLOCKED_CHARACTERS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set([1]);
  });

  const [purchasedCharacter3, setPurchasedCharacter3] = useState(() => {
    const saved = localStorage.getItem(PURCHASED_CHARACTER3_KEY);
    return saved === "true";
  });
  
  // Автокликер
  const [autoClickerLevel, setAutoClickerLevel] = useState(() => {
    const saved = localStorage.getItem(AUTOCLICKER_LEVEL_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [coinsPerHour, setCoinsPerHour] = useState(0);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  
  // Опыт и прогресс
  const [expCurrent, setExpCurrent] = useState(0);
  const [expRequired, setExpRequired] = useState(100);
  
  // Статистика для заданий
  const [totalTaps, setTotalTaps] = useState(0);
  const [maxCoinsReached, setMaxCoinsReached] = useState(0);
  const [upgradesPurchased, setUpgradesPurchased] = useState(0);
  
  // Купленные апгрейды
  const [purchasedUpgrades, setPurchasedUpgrades] = useState(() => {
    const saved = localStorage.getItem(PURCHASED_UPGRADES_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [purchasedAutoClickerLevels, setPurchasedAutoClickerLevels] = useState(() => {
    const saved = localStorage.getItem(PURCHASED_AUTOCLICKERS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Визуальные элементы
  const [toothImage, setToothImage] = useState(Tooth1);
  const [background, setBackground] = useState(Background1);
  const [character, setCharacter] = useState(Char1);
  
  // Профиль пользователя
  const [userProfile, setUserProfile] = useState({
    name: "Игрок",
    photo: "/assets/images/profile-placeholder.png"
  });

  useEffect(() => {
    localStorage.setItem(INVITED_FRIENDS_KEY, invitedFriendsCount.toString());
  }, [invitedFriendsCount]);

  useEffect(() => {
    localStorage.setItem(UNLOCKED_BACKGROUNDS_KEY, JSON.stringify([...unlockedBackgrounds]));
  }, [unlockedBackgrounds]);

  useEffect(() => {
    localStorage.setItem(UNLOCKED_TEETH_KEY, JSON.stringify([...unlockedTeeth]));
  }, [unlockedTeeth]);

  useEffect(() => {
    localStorage.setItem(UNLOCKED_CHARACTERS_KEY, JSON.stringify([...unlockedCharacters]));
  }, [unlockedCharacters]);

  useEffect(() => {
    localStorage.setItem(PURCHASED_CHARACTER3_KEY, purchasedCharacter3.toString());
  }, [purchasedCharacter3]);

  // ========== СИСТЕМА БОНУСОВ ==========
  
  // Активация бонуса к тапам
  const activateTapBonus = (multiplier, durationMinutes) => {
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
    const bonus = {
      type: 'tap_multiplier',
      multiplier: multiplier,
      expiresAt: expiresAt,
      durationMinutes: durationMinutes
    };
    
    setActiveBonus(bonus);
    localStorage.setItem(ACTIVE_BONUS_KEY, JSON.stringify(bonus));
    
    // Пересчитываем coinsPerClick
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
          localStorage.removeItem(ACTIVE_BONUS_KEY);
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
  
  // Обновление coinsPerClick при изменении базового значения
  useEffect(() => {
    if (activeBonus && activeBonus.type === 'tap_multiplier') {
      setCoinsPerClick(baseCoinsPerClick * activeBonus.multiplier);
    } else {
      setCoinsPerClick(baseCoinsPerClick);
    }
  }, [baseCoinsPerClick, activeBonus]);

  // ========== СИСТЕМА ДРУЗЕЙ И РАЗБЛОКИРОВОК ==========

  const inviteFriend = () => {
    const newCount = invitedFriendsCount + 1;
    setInvitedFriendsCount(newCount);
    
    // Проверяем разблокировки при приглашении друзей
    if (newCount >= 1 && !unlockedCharacters.has(2)) {
      setUnlockedCharacters(prev => new Set([...prev, 2]));
    }
    if (newCount >= 3 && !unlockedTeeth.has(3)) {
      setUnlockedTeeth(prev => new Set([...prev, 3]));
    }
    if (newCount >= 7 && !unlockedCharacters.has(3)) {
      setUnlockedCharacters(prev => new Set([...prev, 3]));
      setPurchasedCharacter3(true);
    }
  };
  
  // ========== ЗАДАНИЯ И НАГРАДЫ ==========
  
  // Начальные задания
  const initialDailyTasks = [
    { id: 1, title: "Сделай 100 тапов", reward: 1000, completed: false, claimed: false, type: "daily" },
    { id: 2, title: "Накопи 5000 зубкоинов", reward: 2000, completed: false, claimed: false, type: "daily" },
    { id: 3, title: "Купи любой апгрейд", reward: 1500, completed: false, claimed: false, type: "daily" },
  ];

  const initialWeeklyTasks = [
    { id: 4, title: "Сыграй 7 дней без пропусков", reward: 70000, completed: false, claimed: false, type: "weekly", progress: 0, maxProgress: 7 },
    { id: 5, title: "Собери 100000 зубкоинов за неделю", reward: 50000, completed: false, claimed: false, type: "weekly", progress: 0, maxProgress: 7 },
  ];

  const loginRewardsConfig = [
    { day: 1, title: "1.000 зубкоинов", description: "Награда за первый день", type: "coins", value: 1000, claimed: false },
    { day: 2, title: "Бонус ×2 к тапам", description: "Действует 30 минут", type: "bonus", value: { multiplier: 2, duration: 30 }, claimed: false },
    { day: 3, title: "Сундук", description: "1.000–10.000 зубкоинов или бонус ×2 на 1 час", type: "chest", value: "small", claimed: false },
    { day: 4, title: "10.000 зубкоинов", description: "Награда за 4 дня подряд", type: "coins", value: 10000, claimed: false },
    { day: 5, title: "Бонус ×2 к тапам", description: "Действует 1 час", type: "bonus", value: { multiplier: 2, duration: 60 }, claimed: false },
    { day: 6, title: "Автовыполнение задания", description: "Одно ежедневное задание на выбор", type: "auto_complete", value: "daily", claimed: false },
    { day: 7, title: "Сундук", description: "10.000–20.000 зубкоинов, бонус ×2 на 3 часа или автовыполнение", type: "chest", value: "large", claimed: false },
  ];

  const loadSavedTasks = (key, initialTasks) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading tasks:", e);
    }
    return initialTasks;
  };

  const [dailyTasks, setDailyTasks] = useState(() => loadSavedTasks(DAILY_TASKS_KEY, initialDailyTasks));
  const [weeklyTasks, setWeeklyTasks] = useState(() => loadSavedTasks(WEEKLY_TASKS_KEY, initialWeeklyTasks));
  const [loginRewards, setLoginRewards] = useState(() => loadSavedTasks(LOGIN_REWARDS_KEY, loginRewardsConfig));
  const [currentStreak, setCurrentStreak] = useState(() => {
    const saved = localStorage.getItem(LOGIN_STREAK_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Проверка входа и обновление стрика
  useEffect(() => {
    const checkLoginStreak = () => {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem(LAST_LOGIN_DATE_KEY);

      if (lastLogin !== today) {
        const lastLoginDate = lastLogin ? new Date(lastLogin) : null;
        const todayDate = new Date();

        if (lastLoginDate) {
          const diffTime = todayDate - new Date(lastLogin);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Следующий день подряд
            const newStreak = currentStreak < 7 ? currentStreak + 1 : 1;
            setCurrentStreak(newStreak);
            localStorage.setItem(LOGIN_STREAK_KEY, newStreak.toString());
            
            if (newStreak === 1 && currentStreak === 7) {
              setLoginRewards(loginRewardsConfig);
              localStorage.setItem(LOGIN_REWARDS_KEY, JSON.stringify(loginRewardsConfig));
            }
          } else if (diffDays > 1) {
            // Пропуск - сброс
            setCurrentStreak(1);
            localStorage.setItem(LOGIN_STREAK_KEY, "1");
            setLoginRewards(loginRewardsConfig);
            localStorage.setItem(LOGIN_REWARDS_KEY, JSON.stringify(loginRewardsConfig));
          }
        } else {
          // Первый вход
          setCurrentStreak(1);
          localStorage.setItem(LOGIN_STREAK_KEY, "1");
        }

        localStorage.setItem(LAST_LOGIN_DATE_KEY, today);
      }
    };

    checkLoginStreak();
  }, []);

  // Сохранение заданий в localStorage
  useEffect(() => {
    localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem(WEEKLY_TASKS_KEY, JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  useEffect(() => {
    localStorage.setItem(LOGIN_REWARDS_KEY, JSON.stringify(loginRewards));
  }, [loginRewards]);

  // Проверка выполнения заданий
  useEffect(() => {
    setDailyTasks(prev => prev.map(task => {
      if (task.claimed) return task;
      
      if (task.id === 1) {
        return { ...task, completed: totalTaps >= 100 };
      }
      if (task.id === 2) {
        return { ...task, completed: maxCoinsReached >= 5000 };
      }
      if (task.id === 3) {
        return { ...task, completed: upgradesPurchased >= 1 };
      }
      if (totalTaps >= 10000 && !unlockedCharacters.has(2)) {
        setUnlockedCharacters(prev => new Set([...prev, 2]));
      }
      return task;
    }));
  }, [totalTaps, maxCoinsReached, upgradesPurchased]);

  // Обработчики для заданий
  const handleClaimTaskReward = (task) => {
    if (task.completed && !task.claimed) {
      addCoins(task.reward);
      
      if (task.type === "daily") {
        setDailyTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, claimed: true } : t
        ));
      } else {
        setWeeklyTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, claimed: true } : t
        ));
      }
      return true;
    }
    return false;
  };

  const handleClaimLoginReward = (reward) => {
    if (reward.day !== currentStreak || reward.claimed) return false;

    let rewardMessage = "";
    if (currentStreak === 7) {
      setUnlockedBackgrounds(prev => new Set([...prev, 2]));
    }
    // Обработка разных типов наград
    if (reward.type === "coins") {
      addCoins(reward.value);
      rewardMessage = `Получено ${reward.value} зубкоинов`;
    } else if (reward.type === "bonus") {
      const bonus = activateTapBonus(reward.value.multiplier, reward.value.duration);
      rewardMessage = `Активирован бонус ×${reward.value.multiplier} к тапам на ${reward.value.duration} минут`;
    } else if (reward.type === "chest") {
      // Рандомная награда из сундука
      if (reward.value === "small") {
        const random = Math.random();
        if (random < 0.7) {
          const coinsAmount = Math.floor(Math.random() * 9000) + 1000;
          addCoins(coinsAmount);
          rewardMessage = `Из сундука выпало ${coinsAmount} зубкоинов`;
        } else {
          activateTapBonus(2, 60);
          rewardMessage = "Из сундука выпал бонус ×2 к тапам на 1 час";
        }
      } else if (reward.value === "large") {
        const random = Math.random();
        if (random < 0.5) {
          const coinsAmount = Math.floor(Math.random() * 10000) + 10000;
          addCoins(coinsAmount);
          rewardMessage = `Из сундука выпало ${coinsAmount} зубкоинов`;
        } else if (random < 0.8) {
          activateTapBonus(2, 180);
          rewardMessage = "Из сундука выпал бонус ×2 к тапам на 3 часа";
        } else {
          rewardMessage = "Из сундука выпало автовыполнение еженедельного задания";
        }
      }
    } else if (reward.type === "auto_complete") {
      rewardMessage = "Доступно автовыполнение задания";
    }

    // Помечаем награду как полученную
    setLoginRewards(prev => prev.map(r => 
      r.day === reward.day ? { ...r, claimed: true } : r
    ));
    
    return { success: true, message: rewardMessage };
  };

  // ========== КОНЕЦ СЕКЦИИ ЗАДАНИЙ ==========

  // Конфигурация автокликера
  const autoClickerConfig = [
    { level: 1, coinsPerHour: 1000, cost: 10000, name: "Купить автокликер" },
    { level: 2, coinsPerHour: 1500, cost: 96000, name: "Автокликер уровень 2" },
    { level: 3, coinsPerHour: 2500, cost: 252000, name: "Автокликер уровень 3" },
    { level: 4, coinsPerHour: 4000, cost: 660000, name: "Автокликер уровень 4" },
    { level: 5, coinsPerHour: 6000, cost: 1536000, name: "Автокликер уровень 5" },
  ];

  // Максимальное время офлайн-заработка (5 часов в миллисекундах)
  const MAX_OFFLINE_HOURS = 5;
  const MAX_OFFLINE_MS = MAX_OFFLINE_HOURS * 60 * 60 * 1000;

  // Сохранение купленных апгрейдов
  useEffect(() => {
    localStorage.setItem(PURCHASED_UPGRADES_KEY, JSON.stringify([...purchasedUpgrades]));
  }, [purchasedUpgrades]);

  useEffect(() => {
    localStorage.setItem(PURCHASED_AUTOCLICKERS_KEY, JSON.stringify([...purchasedAutoClickerLevels]));
  }, [purchasedAutoClickerLevels]);

  // Установка coinsPerHour на основе уровня автокликера (суммирование всех купленных уровней)
  useEffect(() => {
    if (purchasedAutoClickerLevels.size > 0) {
      let totalCoinsPerHour = 0;
      
      purchasedAutoClickerLevels.forEach(level => {
        const config = autoClickerConfig.find(c => c.level === level);
        if (config) {
          totalCoinsPerHour += config.coinsPerHour;
        }
      });
      
      if (purchasedUpgrades.has(7)) {
        totalCoinsPerHour *= 1.5;
      }
      
      setCoinsPerHour(totalCoinsPerHour);
    } else {
      setCoinsPerHour(0);
    }
  }, [purchasedAutoClickerLevels, purchasedUpgrades]);

  // Сохранение уровня автокликера
  useEffect(() => {
    localStorage.setItem(AUTOCLICKER_LEVEL_KEY, autoClickerLevel.toString());
  }, [autoClickerLevel]);

  // Расчет офлайн заработка при запуске
  useEffect(() => {
    const calculateOfflineEarnings = () => {
      const lastOnline = localStorage.getItem(LAST_ONLINE_KEY);
      
      if (lastOnline && purchasedAutoClickerLevels.size > 0 && coinsPerHour > 0) {
        const lastOnlineTime = parseInt(lastOnline, 10);
        const now = Date.now();
        let offlineTime = now - lastOnlineTime;
        
        // Ограничиваем максимум 5 часами
        offlineTime = Math.min(offlineTime, MAX_OFFLINE_MS);
        
        const offlineHours = offlineTime / (1000 * 60 * 60);
        const earned = Math.floor(coinsPerHour * offlineHours);
        
        if (earned > 0) {
          setOfflineEarnings(earned);
        }
      }
    };

    calculateOfflineEarnings();
  }, [purchasedAutoClickerLevels, coinsPerHour]);

  // Обновление времени последнего онлайна
  useEffect(() => {
    const updateLastOnline = () => {
      localStorage.setItem(LAST_ONLINE_KEY, Date.now().toString());
    };

    updateLastOnline();
    const interval = setInterval(updateLastOnline, 60000);

    window.addEventListener('beforeunload', updateLastOnline);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        updateLastOnline();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', updateLastOnline);
    };
  }, []);

  // Отслеживание максимального количества монет
  useEffect(() => {
    if (coins > maxCoinsReached) {
      setMaxCoinsReached(coins);
    }
  }, [coins, maxCoinsReached]);

  // Пассивный доход от автокликера (каждую секунду)
  useEffect(() => {
    if (coinsPerHour <= 0) return;

    const interval = setInterval(() => {
      setCoins(prev => prev + coinsPerHour / 3600);
    }, 1000);
    return () => clearInterval(interval);
  }, [coinsPerHour]);

  // Восстановление энергии (каждую секунду на coinsPerClick, но максимум 5)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => {
        if (prev < maxEnergy) {
          const regeneration = Math.min(coinsPerClick, 5);
          return Math.min(prev + regeneration, maxEnergy);
        }
        return prev;
      });
    }, 1000); // Каждую секунду
    return () => clearInterval(interval);
  }, [maxEnergy, coinsPerClick]);

  // Обновление визуальных элементов
  const updateVisuals = (currentLevel) => {
    let toothLevel = 1;
    if (unlockedTeeth.has(3)) toothLevel = 3;
    else if (unlockedTeeth.has(2)) toothLevel = 2;
    
    let bgLevel = 1;
    if (unlockedBackgrounds.has(3)) bgLevel = 3;
    else if (unlockedBackgrounds.has(2) && unlockedTeeth.has(2)) bgLevel = 2;
    
    let charLevel = 1;
    if (unlockedCharacters.has(3)) charLevel = 3;
    else if (unlockedCharacters.has(2)) charLevel = 2;
    
    setToothImage(toothLevel === 1 ? Tooth1 : toothLevel === 2 ? Tooth2 : Tooth3);
    setBackground(bgLevel === 1 ? Background1 : bgLevel === 2 ? Background2 : Background3);
    setCharacter(charLevel === 1 ? Char1 : charLevel === 2 ? Char2 : Char3);
  };
  useEffect(() => {
    updateVisuals(level);
  }, [level, unlockedTeeth, unlockedBackgrounds, unlockedCharacters]);

  // Повышение уровня
  const upgradeLevel = (overflowExp = 0) => {
    const newLevel = level + 1;
    const newExpRequired = Math.floor(expRequired * 1.5);
    
    setLevel(newLevel);
    setExpRequired(newExpRequired);
    updateVisuals(newLevel);
    
    if (overflowExp >= newExpRequired) {
      setExpCurrent(0);
      upgradeLevel(overflowExp - newExpRequired);
    } else {
      setExpCurrent(overflowExp);
    }
  };

  // Обработка клика
  const handleClick = () => {
    // Проверяем, хватает ли энергии для клика
    if (energy >= coinsPerClick) {
      setCoins(prev => prev + coinsPerClick);
      setEnergy(prev => prev - coinsPerClick); // Тратим энергию = coinsPerClick
      setTotalTaps(prev => prev + 1);
      
      const newExp = expCurrent + coinsPerClick;
      
      if (newExp >= expRequired) {
        const overflowExp = newExp - expRequired;
        upgradeLevel(overflowExp);
      } else {
        setExpCurrent(newExp);
      }
    }
  };

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

  // Забрать офлайн заработок
  const claimOfflineEarnings = () => {
    if (offlineEarnings > 0) {
      setCoins(prev => prev + offlineEarnings);
      setOfflineEarnings(0);
      return true;
    }
    return false;
  };

  // Проверка, можно ли купить апгрейд (последовательная покупка)
  const canPurchaseUpgrade = (upgradeId) => {
    if (purchasedUpgrades.has(upgradeId)) {
      return false;
    }
    if (upgradeId === 7) {
      return purchasedAutoClickerLevels.has(5);
    }
    if (upgradeId === 5) {
      return purchasedUpgrades.has(4) && unlockedCharacters.has(2);
    }
    if (upgradeId === 1) {
      return true;
    }
    return purchasedUpgrades.has(upgradeId - 1);
  };

  // Проверка, можно ли купить автокликер (последовательная покупка)
  const canPurchaseAutoClicker = (level) => {
    if (level === 4) {
      return !purchasedAutoClickerLevels.has(level) && purchasedAutoClickerLevels.has(3) && unlockedCharacters.has(3);
    }
    if (level === 1) {
      return !purchasedAutoClickerLevels.has(level);
    }
    return !purchasedAutoClickerLevels.has(level) && purchasedAutoClickerLevels.has(level - 1);
  };

  // Покупка апгрейда кликера (только один раз, последовательно)
  const purchaseUpgrade = (upgradeId, cost, clickIncrease = 0, hourIncrease = 0) => {
    if (coins >= cost && canPurchaseUpgrade(upgradeId)) {
      setCoins(prev => prev - cost);
      if (clickIncrease > 0) {
        setBaseCoinsPerClick(prev => prev + clickIncrease);
      }
      if (hourIncrease > 0) {
        setCoinsPerHour(prev => prev + hourIncrease);
      }
      setPurchasedUpgrades(prev => new Set([...prev, upgradeId]));
      setUpgradesPurchased(prev => prev + 1);
      if (upgradeId === 2 && !unlockedTeeth.has(2)) {
        setUnlockedTeeth(prev => new Set([...prev, 2]));
      }
      if (upgradeId === 5 && !unlockedTeeth.has(3)) {
        setUnlockedTeeth(prev => new Set([...prev, 3]));
}
      return true;
    }
    return false;
  };

  // Покупка/апгрейд автокликера (только один раз каждого уровня, последовательно)
  const purchaseAutoClicker = (level, cost) => {
    if (coins >= cost && canPurchaseAutoClicker(level)) {
      setCoins(prev => prev - cost);
      setAutoClickerLevel(level);
      setPurchasedAutoClickerLevels(prev => new Set([...prev, level]));
      setUpgradesPurchased(prev => prev + 1);
      return true;
    }
    return false;
  };
  const purchaseCharacter3 = (cost) => {
    if (coins >= cost && unlockedCharacters.has(2) && !purchasedCharacter3) {
      setCoins(prev => prev - cost);
      setUnlockedCharacters(prev => new Set([...prev, 3]));
      setPurchasedCharacter3(true);
      return true;
    }
    return false;
  };

  const getUpgradeLockReason = (upgradeId) => {
    if (upgradeId === 7 && !purchasedAutoClickerLevels.has(5)) {
      return "Купите автокликер уровень 5";
    }
    if (upgradeId === 5 && !unlockedCharacters.has(2)) {
      return "Разблокируйте персонажа 2";
    }
    if (!canPurchaseUpgrade(upgradeId) && !purchasedUpgrades.has(upgradeId)) {
      return "Купите пред. апгрейд";
    }
    return null;
  };

  const getAutoClickerLockReason = (level) => {
    if (level === 4 && !unlockedCharacters.has(3)) {
      return "Разблокируйте персонажа 3";
    }
    if (!canPurchaseAutoClicker(level) && !purchasedAutoClickerLevels.has(level)) {
      return "Купите пред. уровень";
    }
    return null;
  };

    // ========== ПРОВЕРКИ ДЛЯ УВЕДОМЛЕНИЙ В ФУТЕРЕ ==========
  
  // Проверка наличия доступных наград в заданиях
  const hasAvailableTasks = () => {
    // Проверяем ежедневные задания
    const hasCompletedDaily = dailyTasks.some(task => task.completed && !task.claimed);
    
    // Проверяем еженедельные задания
    const hasCompletedWeekly = weeklyTasks.some(task => task.completed && !task.claimed);
    
    // Проверяем награды за вход
    const hasLoginReward = loginRewards.some(reward => 
      reward.day === currentStreak && !reward.claimed
    );

    return hasCompletedDaily || hasCompletedWeekly || hasLoginReward;
  };

  // Проверка наличия доступных апгрейдов
  const hasAvailableUpgrades = () => {
    // Список всех апгрейдов кликера
    const upgrades = [
      { id: 1, cost: 72000 },
      { id: 2, cost: 144000 },
      { id: 3, cost: 288000 },
      { id: 4, cost: 432000 },
      { id: 5, cost: 864000 },
      { id: 6, cost: 1568000 },
      { id: 7, cost: 2216000 }, // Специальный апгрейд (Ассистент)
    ];

    // Проверяем, есть ли доступные для покупки апгрейды кликера
    const hasAffordableUpgrade = upgrades.some(upgrade => 
      coins >= upgrade.cost && canPurchaseUpgrade(upgrade.id)
    );

    // Проверяем, есть ли доступные для покупки автокликеры
    const hasAffordableAutoClicker = autoClickerConfig.some(config =>
      coins >= config.cost && canPurchaseAutoClicker(config.level)
    );

    return hasAffordableUpgrade || hasAffordableAutoClicker;
  };

  // Проверка наличия доступных услуг
  const hasAvailableServices = () => {
    const services = [
      { cost: 50000 },
      { cost: 250000 },
      { cost: 750000 },
      { cost: 500000 },
      { cost: 50000 },
      { cost: 5000000 },
      { cost: 5000000 },
      { cost: 50000 },
      { cost: 900000 },
      { cost: 900000 },
      { cost: 1600000 },
    ];

    // Проверяем, есть ли хотя бы одна доступная услуга
    return services.some(service => coins >= service.cost);
  };

  const value = {
    coins,
    level,
    energy,
    maxEnergy,
    coinsPerClick,
    baseCoinsPerClick,
    coinsPerHour,
    expCurrent,
    expRequired,
    userProfile,
    totalTaps,
    maxCoinsReached,
    upgradesPurchased,
    toothImage,
    background,
    character,
    autoClickerLevel,
    autoClickerConfig,
    offlineEarnings,
    purchasedUpgrades,
    purchasedAutoClickerLevels,
    canPurchaseUpgrade,
    canPurchaseAutoClicker,
    handleClick,
    addCoins,
    purchaseUpgrade,
    purchaseAutoClicker,
    claimOfflineEarnings,
    upgradeLevel,
    setUserProfile,
    dailyTasks,
    weeklyTasks,
    loginRewards,
    currentStreak,
    handleClaimTaskReward,
    handleClaimLoginReward,
    activeBonus,
    activateTapBonus,
    hasAvailableTasks,
    hasAvailableUpgrades,
    hasAvailableServices,
    invitedFriendsCount,
    unlockedBackgrounds,
    unlockedTeeth,
    unlockedCharacters,
    purchasedCharacter3,
    inviteFriend,
    purchaseCharacter3,
    getUpgradeLockReason,
    getAutoClickerLockReason,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
