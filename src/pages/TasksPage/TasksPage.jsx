import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import TaskCard from "./components/TaskCard";
import { useGame } from "../../context/GameContext";

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

  const [dailyTasks, setDailyTasks] = useState([
    {
      id: 1,
      title: "Сделай 100 тапов",
      reward: 1000,
      completed: false,
      claimed: false,
      type: "daily",
    },
    {
      id: 2,
      title: "Накопи 5000 зубкоинов",
      reward: 2000,
      completed: false,
      claimed: false,
      type: "daily",
    },
    {
      id: 3,
      title: "Купи любой апгрейд",
      reward: 1500,
      completed: false,
      claimed: false,
      type: "daily",
    },
  ]);

  const [weeklyTasks, setWeeklyTasks] = useState([
    {
      id: 4,
      title: "Сыграй 7 дней без пропусков",
      reward: 70000,
      completed: false,
      claimed: false,
      type: "weekly",
      progress: 0,
      maxProgress: 7,
    },
    {
      id: 5,
      title: "Собери 100000 зубкоинов за неделю",
      reward: 50000,
      completed: false,
      claimed: false,
      type: "weekly",
      progress: 0,
      maxProgress: 7,
    },
  ]);

  // Проверяем выполнение заданий
  useEffect(() => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === 1 && !task.claimed) {
        return { ...task, completed: totalTaps >= 100 };
      }
      if (task.id === 2 && !task.claimed) {
        return { ...task, completed: maxCoinsReached >= 5000 };
      }
      if (task.id === 3 && !task.claimed) {
        return { ...task, completed: upgradesPurchased >= 1 };
      }
      return task;
    }));
  }, [totalTaps, maxCoinsReached, upgradesPurchased]);

  const handleClaimReward = (task) => {
    if (task.completed && !task.claimed) {
      addCoins(task.reward);
      
      // Помечаем задание как полученное
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