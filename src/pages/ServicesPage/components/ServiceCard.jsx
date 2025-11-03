import React from "react";
import "./ServiceCard.css";
import { formatNumber } from "../../../utils/formatters";
import ToothCoinImg from "../../../assets/images/upgrades/tooth.svg";

const ServiceCard = ({ service, canAfford, onPurchase }) => {
  return (
    <div className="service-card">
      <div className="service-card__image-wrapper">
        <img 
          src={service.image} 
          alt={service.title}
          className="service-card__image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div class="service-card__placeholder">🎁</div>';
          }}
        />
      </div>

      <div className="service-card__content">
        <p className="service-card__description">
          {service.title}
        </p>

        <button 
          className={`service-card__button ${!canAfford ? "service-card__button--disabled" : ""}`}
          onClick={onPurchase}
          disabled={!canAfford}
        >
          <img 
            src={ToothCoinImg} 
            alt="Coin" 
            className="service-card__button-icon"
          />
          <span className="service-card__button-text">
            {formatNumber(service.cost)}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;