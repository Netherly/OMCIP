import React, { useEffect, useState } from "react";
import "./LoadingPage.css";
import toothAnimation from "../../assets/images/tooth.webm";
import { 
  preloadCriticalImages, 
  preloadImportantImages,
  preloadAdditionalImages 
} from "../../utils/preloadImages";
import * as API from "../../utils/api";
import { useGame } from "../../context/GameContext";
import { useTelegram } from "../../context/TelegramContext";

const LoadingPage = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const { loadGameState } = useGame();
  const { isAuthenticated, authError } = useTelegram();

  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      try {
        console.log('[LoadingPage] Starting resource loading...');
        
        // 0. ⏳ ЖДЁМ пока авторизация завершится
        console.log('[LoadingPage] Waiting for authentication to complete...');
        if (!isAuthenticated) {
          console.log('[LoadingPage] Still authenticating, waiting...');
          // Даем небольшую задержку и ждем в цикле
          await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (isAuthenticated) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            // Таймаут на 15 секунд максимум
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve();
            }, 15000);
          });
        }
        console.log('[LoadingPage] Authentication completed, proceeding with resource loading...');
        
        if (authError) {
          console.warn('[LoadingPage] Auth error detected:', authError);
          setLoadError(`Authentication error: ${authError}`);
        }
        
        // Получаем разблокированные уровни из localStorage
        const unlockedBackgrounds = new Set(
          JSON.parse(localStorage.getItem("dental_clicker_unlocked_backgrounds") || "[1]")
        );
        const unlockedTeeth = new Set(
          JSON.parse(localStorage.getItem("dental_clicker_unlocked_teeth") || "[1]")
        );
        const unlockedCharacters = new Set(
          JSON.parse(localStorage.getItem("dental_clicker_unlocked_characters") || "[1]")
        );

        // 1. Быстро показываем начальный прогресс
        console.log('[LoadingPage] Setting initial progress to 10%');
        setProgress(10);

        // 2. Загружаем ТОЛЬКО критичные изображения с учетом разблокированных уровней
        console.log('[LoadingPage] Preloading critical images...');
        await preloadCriticalImages(
          (loadProgress) => {
            if (isMounted) {
              // От 10% до 35%
              setProgress(10 + loadProgress * 25);
            }
          },
          unlockedBackgrounds,
          unlockedTeeth,
          unlockedCharacters
        );

        // 2.5 Загружаем профиль и игровое состояние
        if (isMounted) {
          console.log('[LoadingPage] Progress 35%, loading game data from server...');
          setProgress(35);
        }

        try {
          console.log('[LoadingPage] Calling API.getUserProfile()...');
          const userProfile = await API.getUserProfile();
          console.log('[LoadingPage] User profile loaded:', userProfile);
          
          console.log('[LoadingPage] Calling API.getGameState()...');
          const gameState = await API.getGameState();
          console.log('[LoadingPage] Game state loaded:', gameState);

          if (isMounted) {
            console.log('[LoadingPage] Setting progress to 60%, hydrating GameContext...');
            setProgress(60);
            
            // Загружаем данные в GameContext
            loadGameState({
              coins: gameState.user.coins,
              energy: gameState.user.energy,
              level: gameState.user.level,
              experience: gameState.user.experience,
              activeBoosts: gameState.activeBoosts || [],
              upgrades: gameState.upgrades || { list: [], damageBoost: 0, total: 0 },
            });
            console.log('[LoadingPage] GameContext hydrated successfully');
          }
        } catch (error) {
          console.error("[LoadingPage] Failed to load game data from server:", error);
          console.error('[LoadingPage] Error details:', {
            message: error.message,
            stack: error.stack,
          });
          // Продолжаем с локальными данными если ошибка
          if (isMounted) {
            setProgress(60);
          }
        }

        // 3. Финальная анимация до 100%
        if (isMounted) {
          console.log('[LoadingPage] Setting progress to 100%');
          setProgress(100);
          
          // 4. Ждём немного для плавности и запускаем приложение
          setTimeout(() => {
            if (isMounted && onLoaded) {
              console.log('[LoadingPage] Loading complete, calling onLoaded callback');
              onLoaded();
              
              // 5. ПОСЛЕ запуска приложения загружаем остальное в фоне
              setTimeout(() => {
                console.log('[LoadingPage] Preloading additional images in background');
                preloadImportantImages(
                  unlockedBackgrounds,
                  unlockedTeeth,
                  unlockedCharacters
                ).then(() => {
                  // Когда важные загрузились, загружаем дополнительные
                  console.log('[LoadingPage] Important images loaded, preloading additional images');
                  preloadAdditionalImages();
                });
              }, 1000);
            }
          }, 300);
        }
      } catch (error) {
        console.error("Loading error:", error);
        // Даже при ошибке запускаем приложение
        if (isMounted && onLoaded) {
          onLoaded();
        }
      }
    };

    loadResources();

    return () => {
      isMounted = false;
    };
  }, [onLoaded, isAuthenticated, authError]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <video 
          src={toothAnimation} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="tooth-animation"
        />

        <div className="circular-loader">
          <svg className="progress-ring" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(29, 254, 254, 1)" />
                <stop offset="100%" stopColor="rgba(17, 130, 152, 1)" />
              </linearGradient>
            </defs>
            <circle
              className="progress-ring__circle-bg"
              cx="60"
              cy="60"
              r="54"
              strokeWidth="6"
            />
            <circle
              className="progress-ring__circle"
              cx="60"
              cy="60"
              r="54"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={2 * Math.PI * 54 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
          </svg>
          <div className="loader-text headline1">{Math.floor(progress)}%</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;