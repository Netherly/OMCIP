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

// Хук для использования контекста
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Основные игровые параметры
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [coinsPerClick, setCoinsPerClick] = useState(10);
  const [coinsPerHour, setCoinsPerHour] = useState(0);
  
  // Опыт и прогресс
  const [expCurrent, setExpCurrent] = useState(0);
  const [expRequired, setExpRequired] = useState(100);
  
  // Статистика для заданий
  const [totalTaps, setTotalTaps] = useState(0);
  const [maxCoinsReached, setMaxCoinsReached] = useState(0);
  const [upgradesPurchased, setUpgradesPurchased] = useState(0);
  
  // Визуальные элементы
  const [toothImage, setToothImage] = useState(Tooth1);
  const [background, setBackground] = useState(Background1);
  const [character, setCharacter] = useState(Char1);
  
  // Профиль пользователя (заглушка)
  const [userProfile, setUserProfile] = useState({
    name: "Игрок",
    photo: "/assets/images/profile-placeholder.png"
  });

  // Отслеживание максимального количества монет
  useEffect(() => {
    if (coins > maxCoinsReached) {
      setMaxCoinsReached(coins);
    }
  }, [coins, maxCoinsReached]);

  // Пассивный доход (каждую секунду)
  useEffect(() => {
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
          return Math.min(prev + 1, maxEnergy); // +1 энергии в 10 сек
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  const handleClick = () => {
    if (energy >= coinsPerClick) {
      setCoins(prev => prev + coinsPerClick);
      setEnergy(prev => prev - 1); 
      setExpCurrent(prev => prev + coinsPerClick);
      setTotalTaps(prev => prev + 1); // Увеличиваем счетчик тапов
      
      if (expCurrent + 1 >= expRequired) {
        upgradeLevel();
      }
    }
  };

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

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

  const upgradeLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setExpCurrent(0);
    setExpRequired(prev => Math.floor(prev * 1.5)); // Увеличиваем требование на 50%
    setMaxEnergy(prev => prev + 100); // +100 к макс. энергии
    setEnergy(maxEnergy + 100); // Восстанавливаем энергию при повышении уровня
    updateVisuals(newLevel);
  };

  // Покупка апгрейда
  const purchaseUpgrade = (cost, clickIncrease = 0, hourIncrease = 0) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      if (clickIncrease > 0) {
        setCoinsPerClick(prev => prev + clickIncrease);
      }
      if (hourIncrease > 0) {
        setCoinsPerHour(prev => prev + hourIncrease);
      }
      setUpgradesPurchased(prev => prev + 1); // Увеличиваем счетчик покупок
      return true;
    }
    return false;
  };

  const value = {
    // Основные данные
    coins,
    level,
    energy,
    maxEnergy,
    coinsPerClick,
    coinsPerHour,
    expCurrent,
    expRequired,
    userProfile,
    
    // Статистика
    totalTaps,
    maxCoinsReached,
    upgradesPurchased,
    
    // Визуальные элементы
    toothImage,
    background,
    character,
    
    // Методы
    handleClick,
    addCoins,
    purchaseUpgrade,
    upgradeLevel,
    
    // Сеттеры 
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