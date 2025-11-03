import React from "react";
import "./CharacterPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useGame } from "../../context/GameContext";

import InstagramIcon from "../../assets/images/socials/instagram.svg";
import TelegramIcon from "../../assets/images/socials/telegram.svg";
import VkIcon from "../../assets/images/socials/vk.svg";

const CharacterPage = () => {
  const { background, character } = useGame();

  const socialLinks = [
    { 
      name: "Instagram", 
      icon: InstagramIcon, 
      url: "https://instagram.com" 
    },
    { 
      name: "Telegram", 
      icon: TelegramIcon,
      url: "https://telegram.org" 
    },
    { 
      name: "VK", 
      icon: VkIcon,
      url: "https://vk.com" 
    },
  ];

  return (
    <div
      className="character-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />

      <main className="character-page__content">
        <div className="character-page__image-container">
          <img 
            src={character} 
            alt="Character" 
            className="character-page__image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="character-page__shadow"></div>
        </div>

        <div className="character-page__socials">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="character-page__social-link"
            >
              <img 
                src={social.icon} 
                alt={social.name}
                className="character-page__social-icon"
              />
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CharacterPage;