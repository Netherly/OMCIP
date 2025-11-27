import React, { useState } from "react";
import "./TasksPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import TaskCard from "./components/TaskCard";
import LoginRewardCard from "./components/LoginRewardCard";
import { useGame } from "../../context/GameContext";

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [notification, setNotification] = useState(null); 
  const { 
    background,
    dailyTasks,
    weeklyTasks,
    loginRewards,
    currentStreak,
    handleClaimTaskReward,
    handleClaimLoginReward,
  } = useGame();

  const currentTasks = activeTab === "daily" 
    ? dailyTasks 
    : activeTab === "weekly" 
      ? weeklyTasks 
      : loginRewards;

  const handleLoginRewardClaim = (reward) => {
    const result = handleClaimLoginReward(reward);
    if (result && result.success) {
      setNotification(result.message);
      setTimeout(() => setNotification(null), 5000);
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
            loginRewards.map((reward) => (
              <LoginRewardCard
                key={reward.day}
                reward={reward}
                canClaim={reward.day === currentStreak && !reward.claimed}
                isClaimed={reward.claimed}
                onClaim={() => handleLoginRewardClaim(reward)}
              />
            ))
          ) : (
            currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClaim={() => handleClaimTaskReward(task)}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TasksPage;