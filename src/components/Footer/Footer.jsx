import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Footer.css";

import serviceImg from "../../assets/images/service.svg";
import upgradeImg from "../../assets/images/upgrade.svg";
import mainImg from "../../assets/images/main.svg";
import taskImg from "../../assets/images/task.svg";
import characterImg from "../../assets/images/character.svg";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "services", label: "Услуги", icon: serviceImg, path: "/services" },
    { id: "upgrades", label: "Апгрейды", icon: upgradeImg, path: "/upgrades" },
    { id: "home", label: "", icon: mainImg, path: "/" },
    { id: "tasks", label: "Задания", icon: taskImg, path: "/tasks" },
    { id: "character", label: "Персонаж", icon: characterImg, path: "/character" },
  ];

  return (
    <footer className="footer">
      <nav className="footer-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              className={`footer-item ${isActive ? "footer-item-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <img
                src={item.icon}
                alt={item.label}
                className={`footer-icon ${isActive ? "footer-icon-active" : ""}`}
              />
              <span className="footer-label">{item?.label || ""}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
