import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import TaskCard from "./components/TaskCard";
import { useGame } from "../../context/GameContext";

// Ключи для localStorage
const DAILY_TASKS_KEY = "dental_clicker_daily_tasks";
const WEEKLY_TASKS_KEY = "dental_clicker_weekly_tasks";
const LAST_RESET_KEY = "dental_clicker_last_reset";

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState("daily"); 
  const { 
    coins, 
    addCoins, 
    background, 
    totalTaps, 
    maxCoinsReached, 
    upgradesPurchased 
  } = useGame();

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

  // Загрузка сохраненных данных из localStorage
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

  // Сохранение в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(dailyTasks));
    } catch (e) {
      console.error("Error saving daily tasks:", e);
    }
  }, [dailyTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(WEEKLY_TASKS_KEY, JSON.stringify(weeklyTasks));
    } catch (e) {
      console.error("Error saving weekly tasks:", e);
    }
  }, [weeklyTasks]);

  // Проверка выполнения заданий
  useEffect(() => {
    setDailyTasks(prev => prev.map(task => {
      // Не меняем если уже claimed
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
      return task;
    }));
  }, [totalTaps, maxCoinsReached, upgradesPurchased]);

  const handleClaimReward = (task) => {
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
      
      console.log(`Получена награда: ${task.reward} зубкоинов`);
    }
  };

  const currentTasks = activeTab === "daily" ? dailyTasks : weeklyTasks;

  return (
    <div 
      className="tasks-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
      
      <main className="tasks-page__content">
        <div className="tasks-page__tabs">
          <button
            className={`tasks-page__tab ${activeTab === "daily" ? "tasks-page__tab--active" : ""}`}
            onClick={() => setActiveTab("daily")}
          >
            Ежедневные
          </button>
          <button
            className={`tasks-page__tab ${activeTab === "weekly" ? "tasks-page__tab--active" : ""}`}
            onClick={() => setActiveTab("weekly")}
          >
            Еженедельные
          </button>
        </div>

        <div className="tasks-page__list">
          {currentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClaim={() => handleClaimReward(task)}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TasksPage;