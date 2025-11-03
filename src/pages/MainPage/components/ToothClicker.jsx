import React, { useState } from "react";
import "./ToothClicker.css";
import { useGame } from "../../../context/GameContext";
import { useTelegram } from "../../../context/TelegramContext";
import { formatNumber } from "../../../utils/formatters";

const ToothClicker = () => {
  const { handleClick, coinsPerClick, energy, toothImage } = useGame();
  const { hapticFeedback } = useTelegram();
  const [clicks, setClicks] = useState([]);
  const [isPressed, setIsPressed] = useState(false);

  const onToothClick = (e) => {
    if (energy <= 0) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickId = Date.now() + Math.random();
    setClicks(prev => [...prev, { id: clickId, x, y, coins: coinsPerClick }]);

    setTimeout(() => {
      setClicks(prev => prev.filter(click => click.id !== clickId));
    }, 1000);

    hapticFeedback?.("light");

    handleClick();

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
  };

  return (
    <div className="tooth-clicker">
      <div
        className={`tooth-clicker__tooth ${isPressed ? "tooth-clicker__tooth--pressed" : ""} ${
          energy <= 0 ? "tooth-clicker__tooth--disabled" : ""
        }`}
        onClick={onToothClick}
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