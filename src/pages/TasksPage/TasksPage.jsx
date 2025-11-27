import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import TaskCard from "./components/TaskCard";
import LoginRewardCard from "./components/LoginRewardCard";
import { useGame } from "../../context/GameContext";
import * as API from "../../utils/api";

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  
  const { 
    background,
    dailyTasks,
    weeklyTasks,
    loginRewards,
    loadingTasks,
    addCoins,
  } = useGame();

  // Загружаем задачи с сервера при открытии страницы
  useEffect(() => {
    // Данные уже загружаются в GameContext при инициализации
  }, []);

  // Загрузка данных происходит в GameContext

  // Адаптируем данные задач из API к формату компонента
  const adaptTaskData = (task) => {
    return {
      id: task.id,
      title: task.title || task.name || 'Unknown',
      reward: task.reward || 0,
      type: task.type || 'daily',
      completed: task.completed || false,
      claimed: task.claimed || false,
      progress: task.progress || 0,
      maxProgress: task.maxProgress || task.max_progress || 100,
      description: task.description || '',
      ...task // Сохраняем все остальные свойства на случай если они нужны
    };
  };

  // Адаптируем список задач
  const adaptedDailyTasks = dailyTasks.map(adaptTaskData);
  const adaptedWeeklyTasks = weeklyTasks.map(adaptTaskData);

  // Адаптируем награды за вход
  const adaptLoginRewardData = (reward) => {
    return {
      day: reward.day || reward.id || 1,
      title: reward.title || `День ${reward.day || reward.id}`,
      description: reward.description || '',
      amount: reward.amount || reward.reward || 0,
      claimed: reward.claimed || false,
      ...reward // Сохраняем все остальные свойства на случай если они нужны
    };
  };

  const adaptedLoginRewards = loginRewards.map(adaptLoginRewardData);

  const currentTasks = activeTab === "daily" 
    ? adaptedDailyTasks
    : activeTab === "weekly" 
      ? adaptedWeeklyTasks
      : adaptedLoginRewards;

  const handleTaskClaim = async (task) => {
    try {
      const response = await API.claimTaskReward(task.id);
      if (response.success) {
        addCoins(response.data.reward || 0);
        setNotification(`Получено ${response.data.reward} монет!`);
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      console.error("Failed to claim task reward:", err);
      setError(err.message);
    }
  };

  const handleLoginRewardClaim = (reward) => {
    try {
      setNotification(`Получена награда за день ${reward.day}!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error("Failed to claim login reward:", err);
      setError(err.message);
    }
  };

  return (
    <div 
      className="tasks-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
      
      {notification && (
        <div className="tasks-page__notification">
          {notification}
        </div>
      )}
      
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
          <button
            className={`tasks-page__tab ${activeTab === "login" ? "tasks-page__tab--active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Вход
          </button>
        </div>

        <div className="tasks-page__list">
          {activeTab === "login" ? (
            adaptedLoginRewards && adaptedLoginRewards.length > 0 ? (
              adaptedLoginRewards.map((reward) => (
                <LoginRewardCard
                  key={reward.day}
                  reward={reward}
                  canClaim={!reward.claimed}
                  isClaimed={reward.claimed}
                  onClaim={() => handleLoginRewardClaim(reward)}
                />
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>Нет доступных наград</div>
            )
          ) : currentTasks && currentTasks.length > 0 ? (
            currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClaim={() => handleTaskClaim(task)}
              />
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>Нет доступных задач</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TasksPage;