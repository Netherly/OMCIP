import React, { createContext, useState, useEffect, useContext } from "react";
import Background1 from "../assets/images/background_lvl1.svg"
import Background2 from "../assets/images/background_lvl2.svg"
import Background3 from "../assets/images/background_lvl3.svg"
import Tooth1 from "../assets/images/tooth1.svg"
import Tooth2 from "../assets/images/tooth2.svg"
import Tooth3 from "../assets/images/tooth3.svg"
import Char1 from "../assets/images/char1.svg"
import Char2 from "../assets/images/char2.svg"
import Char3 from "../assets/images/char3.svg"

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

export const GameProvider = ({ children }) => {
  // Основные игровые параметры
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(10000);
  const [maxEnergy] = useState(10000);
  const [coinsPerClick, setCoinsPerClick] = useState(10);
  
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

  // Установка coinsPerHour на основе уровня автокликера
  useEffect(() => {
    if (autoClickerLevel > 0) {
      const config = autoClickerConfig.find(c => c.level === autoClickerLevel);
      if (config) {
        setCoinsPerHour(config.coinsPerHour);
      }
    } else {
      setCoinsPerHour(0);
    }
  }, [autoClickerLevel]);

  // Сохранение уровня автокликера
  useEffect(() => {
    localStorage.setItem(AUTOCLICKER_LEVEL_KEY, autoClickerLevel.toString());
  }, [autoClickerLevel]);

  // Расчет офлайн заработка при запуске
  useEffect(() => {
    const calculateOfflineEarnings = () => {
      const lastOnline = localStorage.getItem(LAST_ONLINE_KEY);
      
      if (lastOnline && autoClickerLevel > 0) {
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
  }, [autoClickerLevel, coinsPerHour]);

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

  // Восстановление энергии
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => {
        if (prev < maxEnergy) {
          return Math.min(prev + 1, maxEnergy);
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Обновление визуальных элементов
  const updateVisuals = (currentLevel) => {
    if (currentLevel < 5) {
      setToothImage(Tooth1);
      setBackground(Background1);
      setCharacter(Char1);
    } else if (currentLevel < 10) {
      setToothImage(Tooth2);
      setBackground(Background2);
      setCharacter(Char2);
    } else {
      setToothImage(Tooth3);
      setBackground(Background3);
      setCharacter(Char3);
    }
  };

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
    if (energy >= 1) {
      setCoins(prev => prev + coinsPerClick);
      setEnergy(prev => prev - 1);
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
    // Если это первый апгрейд (id: 1), его можно купить всегда
    if (upgradeId === 1) {
      return !purchasedUpgrades.has(upgradeId);
    }
    // Для остальных апгрейдов нужно, чтобы был куплен предыдущий
    return !purchasedUpgrades.has(upgradeId) && purchasedUpgrades.has(upgradeId - 1);
  };

  // Проверка, можно ли купить автокликер (последовательная покупка)
  const canPurchaseAutoClicker = (level) => {
    // Если это первый уровень (1), его можно купить всегда
    if (level === 1) {
      return !purchasedAutoClickerLevels.has(level);
    }
    // Для остальных уровней нужно, чтобы был куплен предыдущий
    return !purchasedAutoClickerLevels.has(level) && purchasedAutoClickerLevels.has(level - 1);
  };

  // Покупка апгрейда кликера (только один раз, последовательно)
  const purchaseUpgrade = (upgradeId, cost, clickIncrease = 0, hourIncrease = 0) => {
    if (coins >= cost && canPurchaseUpgrade(upgradeId)) {
      setCoins(prev => prev - cost);
      if (clickIncrease > 0) {
        setCoinsPerClick(prev => prev + clickIncrease);
      }
      if (hourIncrease > 0) {
        setCoinsPerHour(prev => prev + hourIncrease);
      }
      setPurchasedUpgrades(prev => new Set([...prev, upgradeId]));
      setUpgradesPurchased(prev => prev + 1);
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

  const value = {
    coins,
    level,
    energy,
    maxEnergy,
    coinsPerClick,
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
    setCoinsPerClick,
    setCoinsPerHour,
    setUserProfile,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};