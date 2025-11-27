import React, { useState, useEffect } from "react";
import "./UpgradesPage.css";
import Footer from "../../components/Footer/Footer";
import UpgradeCard from "./components/UpgradeCard";
import AutoClickerCard from "./components/AutoClickerCard";
import { useGame } from "../../context/GameContext";
import * as API from "../../utils/api";
import zondImg from "../../assets/images/upgrades/zond.svg";
import mirrorImg from "../../assets/images/upgrades/mirror.svg";
import gladilkaImg from "../../assets/images/upgrades/gladilka.svg";
import shpricImg from "../../assets/images/upgrades/shpric.svg";
import naborImg from "../../assets/images/upgrades/nabor.svg";
import lotokImg from "../../assets/images/upgrades/lotok.svg";
import assistantImg from "../../assets/images/upgrades/assistant.svg";
import checkImg from "../../assets/images/upgrades/check.svg";
import Char3 from "../../assets/images/char3.svg";

const UpgradesPage = () => {
  const [activeTab, setActiveTab] = useState("clicker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    coins, 
    purchaseUpgrade, 
    purchaseAutoClicker,
    autoClickerConfig,
    purchasedUpgrades,
    purchasedAutoClickerLevels,
    canPurchaseUpgrade,
    canPurchaseAutoClicker,
    background,
    getUpgradeLockReason,
    getAutoClickerLockReason,
    purchaseCharacter3,
    unlockedCharacters,
    purchasedCharacter3,
    // Новые свойства из GameContext
    upgrades,
    userUpgrades,
    loadingUpgrades,
  } = useGame();

  // Загружаем апгрейды с сервера при открытии страницы
  useEffect(() => {
    // Данные уже загружаются в GameContext при инициализации
    // Здесь ничего дополнительного не нужно
  }, []);

  // Загрузка данных происходит в GameContext, здесь используем только то что там загружено

  const handlePurchase = async (upgrade) => {
    try {
      await purchaseUpgrade(upgrade.id);
    } catch (err) {
      console.error("Failed to purchase upgrade:", err);
      setError(err.message);
    }
  };

  const handleAutoClickerPurchase = (config) => {
    purchaseAutoClicker(config.level, config.cost);
  };

  const regularAutoClickers = autoClickerConfig.slice(0, 4);
  const specialAutoClicker = autoClickerConfig[4];
  const handleCharacter3Purchase = () => {
    purchaseCharacter3(1000000);
  };

  // Адаптируем данные апгрейдов из API к формату компонента
  const adaptUpgradeData = (upgrade) => {
    // Получаем количество раз, которое это улучшение уже куплено (0 или 1)
    const purchaseCount = Array.isArray(userUpgrades) 
      ? userUpgrades.filter(u => u.upgrade_id === upgrade.id).length 
      : 0;
    
    // Вычисляем текущую цену: base_cost * (cost_multiplier ^ purchaseCount)
    // Если уже куплено, цена для следующей покупки (но это не допускается)
    const baseCost = parseFloat(upgrade.base_cost) || 0;
    const costMultiplier = parseFloat(upgrade.cost_multiplier) || 1;
    const currentCost = Math.floor(baseCost * Math.pow(costMultiplier, purchaseCount));
    
    const adapted = {
      id: upgrade.id,
      name: upgrade.name || upgrade.title || 'Unknown',
      image: upgrade.image || upgrade.icon || '',
      cost: currentCost,
      perTap: upgrade.base_value || upgrade.perTap || upgrade.coins_per_click || 0,
      bonus: upgrade.bonus || null,
      bonusIcon: upgrade.bonusIcon || null,
      ...upgrade // Сохраняем все остальные свойства на случай если они нужны
    };
    if (upgrades.length > 0 && upgrades[0] === upgrade) {
      console.log('[UpgradesPage] First upgrade data:', upgrade);
      console.log('[UpgradesPage] Purchase count:', purchaseCount);
      console.log('[UpgradesPage] Current cost:', currentCost);
      console.log('[UpgradesPage] First upgrade adapted:', adapted);
    }
    return adapted;
  };

  // Адаптируем список апгрейдов
  const adaptedUpgrades = upgrades.map(adaptUpgradeData);
  const specialUpgrade = adaptedUpgrades.length > 0 ? adaptedUpgrades[adaptedUpgrades.length - 1] : null;
  const regularUpgrades = adaptedUpgrades.slice(0, -1);

  return (
    <div
      className="upgrades-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <main className="upgrades-page__content">
        <h1 className="upgrades-page__title">Апгрейды</h1>
        
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
          <button
            className={`upgrades-page__tab ${activeTab === "appearance" ? "upgrades-page__tab--active" : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            Вид
          </button>
        </div>

        {activeTab === "clicker" ? (
          <>
            <div className="upgrades-page__grid">
              {regularUpgrades.map((upgrade) => {
                // Проверяем куплено ли это улучшение по upgrade_id
                const isPurchased = Array.isArray(userUpgrades) && userUpgrades.some(u => u.upgrade_id === upgrade.id);
                const canPurchase = !isPurchased; // Можно купить только если не куплено
                const canAfford = coins >= upgrade.cost;
                
                return (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    isPurchased={isPurchased}
                    canAfford={canAfford && canPurchase}
                    onPurchase={() => handlePurchase(upgrade)}
                    isLocked={!canPurchase && !isPurchased}
                    lockReason={getUpgradeLockReason(upgrade.id)}
                  />
                );
              })}
            </div>

            <div className="upgrades-page__special">
              {(() => {
                if (!specialUpgrade) return null;
                // Проверяем куплено ли это улучшение по upgrade_id
                const isPurchased = Array.isArray(userUpgrades) && userUpgrades.some(u => u.upgrade_id === specialUpgrade.id);
                const canPurchase = !isPurchased; // Можно купить только если не куплено
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
        ) : activeTab === "autoclicker" ? (
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
                    lockReason={getAutoClickerLockReason(config.level)}
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
        ) : (
          <div className="upgrades-page__special">
            <UpgradeCard
              upgrade={{
                id: character3Config.id,
                name: character3Config.name,
                image: character3Config.image,
                perTap: 0,
                cost: character3Config.cost,
              }}
              isPurchased={purchasedCharacter3}
              canAfford={coins >= character3Config.cost && unlockedCharacters.has(2) && !purchasedCharacter3}
              onPurchase={handleCharacter3Purchase}
              isSpecial={true}
              isLocked={!unlockedCharacters.has(2)}
              lockReason={!unlockedCharacters.has(2) ? "Разблокируйте персонажа 2" : null}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UpgradesPage;