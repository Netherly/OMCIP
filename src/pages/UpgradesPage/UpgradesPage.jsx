import React from "react";
import "./UpgradesPage.css";
import Footer from "../../components/Footer/Footer";
import UpgradeCard from "./components/UpgradeCard";
import { useGame } from "../../context/GameContext";
import zondImg from "../../assets/images/upgrades/zond.svg"
import mirrorImg from "../../assets/images/upgrades/mirror.svg"
import gladilkaImg from "../../assets/images/upgrades/gladilka.svg"
import shpricImg from "../../assets/images/upgrades/shpric.svg"
import naborImg from "../../assets/images/upgrades/nabor.svg"
import lotokImg from "../../assets/images/upgrades/lotok.svg"
import assistantImg from "../../assets/images/upgrades/assistant.svg"
import checkImg from "../../assets/images/upgrades/check.svg"

const UpgradesPage = () => {
    const { coins, purchaseUpgrade, background } = useGame();

    const upgrades = [
        {
            id: 1,
            name: "Зонд",
            image: zondImg,
            perTap: 2,
            cost: 72000,
            clickIncrease: 2,
        },
        {
            id: 2,
            name: "Зеркало",
            image: mirrorImg,
            perTap: 3,
            cost: 144000,
            clickIncrease: 3,
        },
        {
            id: 3,
            name: "Гладилка",
            image: gladilkaImg,
            perTap: 4,
            cost: 288000,
            clickIncrease: 4,
        },
        {
            id: 4,
            name: "Шприц",
            image: shpricImg,
            perTap: 5,
            cost: 432000,
            clickIncrease: 5,
        },
        {
            id: 5,
            name: "Набор",
            image: naborImg,
            perTap: 10,
            cost: 864000,
            clickIncrease: 10,
        },
        {
            id: 6,
            name: "Лоток",
            image: lotokImg,
            perTap: 20,
            cost: 1584000,
            clickIncrease: 20,
        },
    ];

    const specialUpgrade = {
        id: 7,
        name: "Ассистент",
        image: assistantImg,
        perTap: 25,
        cost: 2216000,
        clickIncrease: 25,
        bonus: "Увеличивает автокликер в 1,5 раза",
        bonusIcon: checkImg,
    };

    const handlePurchase = (upgrade) => {
        const success = purchaseUpgrade(upgrade.cost, upgrade.clickIncrease, 0);
        if (success) {
            console.log(`Куплен апгрейд: ${upgrade.name}`);
        } else {
            console.log("Недостаточно зубкоинов!");
        }
    };

  return (
    <div
        className="upgrades-page"
        style={{ backgroundImage: `url(${background})` }}
    >
      
        <main className="upgrades-page__content">
            <h1 className="upgrades-page__title">Апгрейды</h1>
            
            <div className="upgrades-page__grid">
            {upgrades.map((upgrade) => (
                <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                canAfford={coins >= upgrade.cost}
                onPurchase={() => handlePurchase(upgrade)}
                />
            ))}
            </div>

            <div className="upgrades-page__special">
            <UpgradeCard
                upgrade={specialUpgrade}
                canAfford={coins >= specialUpgrade.cost}
                onPurchase={() => handlePurchase(specialUpgrade)}
                isSpecial={true}
            />
            </div>
      </main>

      <Footer />
    </div>
  );
};

export default UpgradesPage;