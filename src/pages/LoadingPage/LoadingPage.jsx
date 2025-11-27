import React, { useEffect, useState } from "react";
import "./LoadingPage.css";
import toothAnimation from "../../assets/images/tooth.webm";
import { 
  preloadCriticalImages, 
  preloadImportantImages,
  preloadAdditionalImages 
} from "../../utils/preloadImages";

const LoadingPage = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      try {
        // 0. Получаем разблокированные уровни из localStorage
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
        setProgress(10);

        // 2. Загружаем ТОЛЬКО критичные изображения с учетом разблокированных уровней
        await preloadCriticalImages(
          (loadProgress) => {
            if (isMounted) {
              // От 10% до 90%
              setProgress(10 + loadProgress * 80);
            }
          },
          unlockedBackgrounds,
          unlockedTeeth,
          unlockedCharacters
        );

        // 3. Финальная анимация до 100%
        if (isMounted) {
          setProgress(100);
          
          // 4. Ждём немного для плавности и запускаем приложение
          setTimeout(() => {
            if (isMounted && onLoaded) {
              onLoaded();
              
              // 5. ПОСЛЕ запуска приложения загружаем остальное в фоне
              setTimeout(() => {
                preloadImportantImages(
                  unlockedBackgrounds,
                  unlockedTeeth,
                  unlockedCharacters
                ).then(() => {
                  // Когда важные загрузились, загружаем дополнительные
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
  }, [onLoaded]);

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