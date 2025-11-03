import React, { useEffect, useState } from "react";
import "./LoadingPage.css";
import toothAnimation from "../../assets/images/broke_tooth.svg"; 

const LoadingPage = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onLoaded && onLoaded(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onLoaded]);

    return (
        <div className="loading-container">
            <div className="loading-content">
            <img src={toothAnimation} alt="tooth loading" className="tooth-animation" />

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
                />
                </svg>
                <div className="loader-text headline1">{progress}%</div>
            </div>
            </div>
        </div>
    );
};

export default LoadingPage;