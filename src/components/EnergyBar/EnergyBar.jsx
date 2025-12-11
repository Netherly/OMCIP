import React from "react";
import "./EnergyBar.css";

const EnergyBar = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isFull = percentage >= 100;
  const isCurrentFull = current >= max;

  return (
    <div className="energy-bar">
      {/* Текст МАКС - показываем только если энергия полная */}
      {isCurrentFull && (
        <div className="energy-bar__max-label">
          <span className="energy-bar__max-text">МАКС</span>
          <span className="energy-bar__max-value">{Math.floor(current)}</span>
        </div>
      )}
      
      {/* Текущее значение энергии - показываем если не полная */}
      {!isCurrentFull && (
        <div className="energy-bar__max-label">
          <span className="energy-bar__current-value">{Math.floor(current)}</span>
        </div>
      )}

      {/* Контейнер энергии */}
      <div className="energy-bar__container">
        <div className="energy-bar__inner">
          {/* Заполнение энергии */}
          <div 
            className={`energy-bar__fill ${isFull ? 'energy-bar__fill--full' : ''}`}
            style={{ height: `${percentage}%` }}
          >
            {/* Тень внутри */}
            {percentage > 10 && (
              <div className="energy-bar__shadow" />
            )}

            {/* Пузырики */}
            {percentage > 20 && (
              <>
                <div className="energy-bar__bubble energy-bar__bubble--1" />
                <div className="energy-bar__bubble energy-bar__bubble--2" />
                <div className="energy-bar__bubble energy-bar__bubble--3" />
              </>
            )}
          </div>
        </div>

        {/* Текущее значение энергии (опционально) */}
        {/* <div className="energy-bar__current">
          {Math.floor(current)}
        </div> */}
      </div>
    </div>
  );
};

export default EnergyBar;