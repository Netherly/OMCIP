import React, { useState, useRef, useCallback, useEffect } from "react";
import "./ToothClicker.css";
import { useGame } from "../../../context/GameContext";
import { useTelegram } from "../../../context/TelegramContext";
import { formatNumber } from "../../../utils/formatters";
import * as API from "../../../utils/api";

const ToothClicker = () => {
  const { handleClick, baseCoinsPerClick, energy, toothImage } = useGame();
  const { hapticFeedback } = useTelegram();
  const [clicks, setClicks] = useState([]);
  const [isPressed, setIsPressed] = useState(false);
  const [syncError, setSyncError] = useState(null);
  
  // Защита от автокликера
  const tapTimestamps = useRef([]);
  const MAX_TAPS_PER_SECOND = 10;

  // Проверка лимита тапов
  const canTap = useCallback(() => {
    const now = Date.now();
    // Удаляем тапы старше 1 секунды
    tapTimestamps.current = tapTimestamps.current.filter(
      timestamp => now - timestamp < 1000
    );
    
    // Проверяем лимит
    if (tapTimestamps.current.length >= MAX_TAPS_PER_SECOND) {
      return false;
    }
    
    // Добавляем текущий тап
    tapTimestamps.current.push(now);
    return true;
  }, []);

  // Обработка одного тапа
  const processTap = useCallback((x, y) => {
    if (energy <= 0 || !canTap()) {
      return;
    }

    const clickId = Date.now() + Math.random();
    setClicks(prev => [...prev, { id: clickId, x, y, coins: baseCoinsPerClick }]);

    setTimeout(() => {
      setClicks(prev => prev.filter(click => click.id !== clickId));
    }, 1000);

    hapticFeedback?.("light");
    handleClick();

    // Отправляем клик на сервер (асинхронно, не блокируя UI)
    API.sendClick()
      .catch(err => {
        console.error("Failed to sync click with server:", err);
        setSyncError("Ошибка синхронизации клика");
        setTimeout(() => setSyncError(null), 3000);
      });
  }, [energy, baseCoinsPerClick, canTap, hapticFeedback, handleClick]);

  // Обработка touch событий (мультитач)
  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    
    if (energy <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    
    Array.from(e.changedTouches).forEach(touch => {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      processTap(x, y);
    });

    setIsPressed(true);
  }, [energy, processTap]);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    setIsPressed(false);
  }, []);

  // Обработка клика мышью (для десктопа)
  const onMouseClick = useCallback((e) => {
    if (e.pointerType === 'touch') return;
    
    if (energy <= 0 || !canTap()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    processTap(x, y);
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
  }, [energy, canTap, processTap]);

  return (
    <div className="tooth-clicker">
      <div
        className={`tooth-clicker__tooth ${isPressed ? "tooth-clicker__tooth--pressed" : ""} ${
          energy <= 0 ? "tooth-clicker__tooth--disabled" : ""
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onClick={onMouseClick}
      >
        <img 
          src={toothImage} 
          alt="Tooth" 
          className="tooth-clicker__image"
          draggable="false"
        />

        {clicks.map(click => (
          <div
            key={click.id}
            className="tooth-clicker__coin-effect"
            style={{
              left: `${click.x}px`,
              top: `${click.y}px`,
            }}
          >
            +{formatNumber(click.coins)}
          </div>
        ))}
      </div>

      {energy <= 0 && (
        <div className="tooth-clicker__no-energy">
          Энергия восстанавливается...
        </div>
      )}
    </div>
  );
};

export default ToothClicker;