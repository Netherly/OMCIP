import React from "react";
import "./TaskCard.css";
import { formatNumber } from "../../../utils/formatters";
import ToothCoinImg from "../../../assets/images/upgrades/tooth.svg";
import TaskIncomplete from "../../../assets/images/tasks/incomplete.svg";
import TaskComplete from "../../../assets/images/tasks/complete.svg";

const TaskCard = ({ task, onClaim }) => {
  const isWeekly = task.type === "weekly";
  const canClaim = task.completed && !task.claimed;

  return (
    <div className={`task-card ${task.claimed ? "task-card--claimed" : task.completed ? "task-card--completed" : ""}`}>
      <div className="task-card__left">
        {isWeekly ? (
          <div className={`task-card__progress-box ${task.completed ? "task-card__progress-box--completed" : ""}`}>
            <span className="task-card__progress-text">
              <span className="task-card-current">{task.progress}</span>/{task.maxProgress}
            </span>
          </div>
        ) : (
          <div className="task-card__image-wrapper">
            <img 
              src={task.completed ? TaskComplete : TaskIncomplete}
              alt={task.completed ? "Выполнено" : "Не выполнено"}
              className="task-card__image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div class="task-card__placeholder">${task.completed ? '✓' : '○'}</div>`;
              }}
            />
          </div>
        )}
      </div>

      <div className="task-card__right">
        <div className="task-card__status">
          <div className={`task-card__status-icon ${task.completed ? "task-card__status-icon--completed" : ""}`}>
            {task.claimed ? "✓" : task.completed ? "✓" : "✕"}
          </div>
          <span className={`task-card__status-text ${task.completed ? "task-card__status-text--completed" : ""}`}>
            {task.claimed ? "Получено" : task.completed ? "Выполнено" : "Не выполнено"}
          </span>
        </div>

        <span className="task-card__title">{task.title}</span>

        <button 
          className={`task-card__reward ${!canClaim ? "task-card__reward--disabled" : ""}`}
          onClick={onClaim}
          disabled={!canClaim}
        >
          <img 
            src={ToothCoinImg} 
            alt="Coin" 
            className="task-card__reward-icon"
          />
          <span className="task-card__reward-text">
            {task.claimed ? "Получено" : formatNumber(task.reward)}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;