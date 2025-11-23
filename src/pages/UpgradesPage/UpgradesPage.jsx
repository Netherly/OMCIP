import React, { useState } from "react";
import "./UpgradesPage.css";
import Footer from "../../components/Footer/Footer";
import UpgradeCard from "./components/UpgradeCard";
import AutoClickerCard from "./components/AutoClickerCard";
import { useGame } from "../../context/GameContext";
import zondImg from "../../assets/images/upgrades/zond.svg";
import mirrorImg from "../../assets/images/upgrades/mirror.svg";
import gladilkaImg from "../../assets/images/upgrades/gladilka.svg";
import shpricImg from "../../assets/images/upgrades/shpric.svg";
import naborImg from "../../assets/images/upgrades/nabor.svg";
import lotokImg from "../../assets/images/upgrades/lotok.svg";
import assistantImg from "../../assets/images/upgrades/assistant.svg";
import checkImg from "../../assets/images/upgrades/check.svg";

const UpgradesPage = () => {
  const [activeTab, setActiveTab] = useState("clicker");
  const { 
    coins, 
    purchaseUpgrade, 
    purchaseAutoClicker,
    autoClickerConfig,
    purchasedUpgrades,
    purchasedAutoClickerLevels,
    canPurchaseUpgrade,
    canPurchaseAutoClicker,
    background 
  } = useGame();

  const upgrades = [
    { id: 1, name: "Зонд", image: zondImg, perTap: 2, cost: 72000, clickIncrease: 2 },
    { id: 2, name: "Зеркало", image: mirrorImg, perTap: 3, cost: 144000, clickIncrease: 3 },
    { id: 3, name: "Гладилка", image: gladilkaImg, perTap: 4, cost: 288000, clickIncrease: 4 },
    { id: 4, name: "Шприц", image: shpricImg, perTap: 5, cost: 432000, clickIncrease: 5 },
    { id: 5, name: "Набор", image: naborImg, perTap: 10, cost: 864000, clickIncrease: 10 },
    { id: 6, name: "Лоток", image: lotokImg, perTap: 20, cost: 1568000, clickIncrease: 20 },
  ];

  const specialUpgrade = {
    id: 5,
    name: "Ассистент",
    image: assistantImg,
    perTap: 25,
    cost: 2216000,
    clickIncrease: 25,
    bonus: "Увеличивает автокликер в 1,5 раза",
    bonusIcon: checkImg,
  };

  const handlePurchase = (upgrade) => {
    purchaseUpgrade(upgrade.id, upgrade.cost, upgrade.clickIncrease);
  };

  const handleAutoClickerPurchase = (config) => {
    purchaseAutoClicker(config.level, config.cost);
  };

  // Разделяем автокликеры на обычные (первые 4) и специальный (5-й)
  const regularAutoClickers = autoClickerConfig.slice(0, 4);
  const specialAutoClicker = autoClickerConfig[4];

  return (
    <div
      className="upgrades-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <main className="upgrades-page__content">
        <h1 className="upgrades-page__title">Апгрейды</h1>
        
        {/* Переключатель вкладок */}
        <div className="upgrades-page__tabs">
          <button
            className={`upgrades-page__tab ${activeTab === "clicker" ? "upgrades-page__tab--active" : ""}`}
            onClick={() => setActiveTab("clicker")}
          >
            Кликер
          </button>
          <button
            className={`upgrades-page__tab ${activeTab === "autoclicker" ? "upgrades-page__tab--active" : ""}`}
            onClick={() => setActiveTab("autoclicker")}
          >
            Автокликер
          </button>
        </div>

        {activeTab === "clicker" ? (
          <>
            <div className="upgrades-page__grid">
              {upgrades.map((upgrade) => {
                const isPurchased = purchasedUpgrades.has(upgrade.id);
                const canPurchase = canPurchaseUpgrade(upgrade.id);
                const canAfford = coins >= upgrade.cost;
                
                return (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    isPurchased={isPurchased}
                    canAfford={canAfford && canPurchase}
                    onPurchase={() => handlePurchase(upgrade)}
                    isLocked={!canPurchase && !isPurchased}
                  />
                );
              })}
            </div>

            <div className="upgrades-page__special">
              {(() => {
                const isPurchased = purchasedUpgrades.has(specialUpgrade.id);
                const canPurchase = canPurchaseUpgrade(specialUpgrade.id);
                const canAfford = coins >= specialUpgrade.cost;
                
                return (
                  <UpgradeCard
                    upgrade={specialUpgrade}
                    isPurchased={isPurchased}
                    canAfford={canAfford && canPurchase}
                    onPurchase={() => handlePurchase(specialUpgrade)}
                    isSpecial={true}
                    isLocked={!canPurchase && !isPurchased}
                  />
                );
              })()}
            </div>
          </>
        ) : (
          <>
            <div className="upgrades-page__grid">
              {regularAutoClickers.map((config) => {
                const isPurchased = purchasedAutoClickerLevels.has(config.level);
                const canPurchase = canPurchaseAutoClicker(config.level);
                const canAfford = coins >= config.cost;
                
                return (
                  <AutoClickerCard
                    key={config.level}
                    config={config}
                    isPurchased={isPurchased}
                    canAfford={canAfford && canPurchase}
                    onPurchase={() => handleAutoClickerPurchase(config)}
                    isLocked={!canPurchase && !isPurchased}
                  />
                );
              })}
            </div>

            <div className="upgrades-page__special">
              {(() => {
                const isPurchased = purchasedAutoClickerLevels.has(specialAutoClicker.level);
                const canPurchase = canPurchaseAutoClicker(specialAutoClicker.level);
                const canAfford = coins >= specialAutoClicker.cost;
                
                return (
                  <AutoClickerCard
                    config={specialAutoClicker}
                    isPurchased={isPurchased}
                    canAfford={canAfford && canPurchase}
                    onPurchase={() => handleAutoClickerPurchase(specialAutoClicker)}
                    isSpecial={true}
                    isLocked={!canPurchase && !isPurchased}
                  />
                );
              })()}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UpgradesPage;