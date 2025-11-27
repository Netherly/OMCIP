import React, { useState, useEffect } from "react";
import "./ServicesPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ServiceCard from "./components/ServiceCard";
import { useGame } from "../../context/GameContext";
import * as API from "../../utils/api";

import Discount10 from "../../assets/images/services/discount-10.svg";
import Discount20 from "../../assets/images/services/discount-20.svg";
import Discount30 from "../../assets/images/services/discount-30.svg";
import Cleaning from "../../assets/images/services/cleaning.svg";
import Consultation from "../../assets/images/services/consultation.svg";
import Implant from "../../assets/images/services/implant.svg";
import Crown from "../../assets/images/services/crown.svg";
import Scanner from "../../assets/images/services/scanner.svg";
import Tomography from "../../assets/images/services/tomography.svg";
import Certificate3000 from "../../assets/images/services/certificate-3000.svg";
import Certificate5000 from "../../assets/images/services/certificate-5000.svg";

const ServicesPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cooldownStatus, setCooldownStatus] = useState({});
    
    const { 
        coins, 
        addCoins, 
        background, 
        invitedFriendsCount,
        unlockedBackgrounds,
        // Новые свойства из GameContext
        services,
        userServices,
        loadingServices,
        loadUserServices,
    } = useGame();

    // Загружаем услуги с сервера при открытии страницы
    useEffect(() => {
        // Данные уже загружаются в GameContext при инициализации
        // Здесь ничего дополнительного не нужно
    }, []);

    // Загрузка данных происходит в GameContext, здесь используем только то что там загружено

    // Адаптируем данные сервисов из API к формату компонента
    const adaptServiceData = (service) => {
        // Парсим стоимость из cost_coins (приходит строкой)
        let cost = parseFloat(service.cost_coins);
        if (isNaN(cost)) {
            cost = parseFloat(service.cost);
        }
        if (isNaN(cost)) {
            cost = 0;
        }
        
        // Проверяем куплена ли услуга
        const isPurchased = Array.isArray(userServices) && 
            userServices.some(u => u.service_id === service.id);
        
        const adapted = {
            id: service.id,
            title: service.title || service.name || 'Unknown',
            image: service.image || service.icon || '',
            cost: cost,
            description: service.description || '',
            discount_percent: service.discount_percent || 0,
            cooldown_days: service.cooldown_days || 0,
            isPurchased: isPurchased,
            requiresBackground: service.requiresBackground || service.requires_background || null,
            ...service // Сохраняем все остальные свойства на случай если они нужны
        };
        if (services.length > 0 && services[0] === service) {
            console.log('[ServicesPage] First service data:', service);
            console.log('[ServicesPage] First service adapted:', adapted);
        }
        return adapted;
    };

    // Адаптируем список сервисов
    const adaptedServices = services.map(adaptServiceData);

    const handlePurchase = async (service) => {
        try {
            // Убеждаемся что cost это число
            const cost = Number(service.cost);
            if (isNaN(cost)) {
                console.error('Invalid service cost:', service.cost);
                setError('Ошибка: неправильная стоимость услуги');
                return;
            }
            
            console.log('[ServicesPage] Purchasing service:', service.id, 'Cost:', cost);
            const response = await API.purchaseService(service.id);
            console.log('[ServicesPage] Purchase response:', response);
            
            if (response.success) {
                console.log(`Куплена услуга: ${service.title}, стоимость: ${cost}`);
                addCoins(-cost);
                
                // Перезагружаем список покупленных услуг
                await loadUserServices();
            }
        } catch (err) {
            console.error("Failed to purchase service:", err);
            setError(err.message);
        }
    };

    return (
        <div 
            className="services-page"
            style={{ backgroundImage: `url(${background})` }}
        >
            <Header />
            
            <main className="services-page__content">
                <div className="services-page__list">
                    {adaptedServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            canAfford={coins >= (service.cost || 0) && !service.isPurchased}
                            onPurchase={() => handlePurchase(service)}
                            invitedFriendsCount={invitedFriendsCount}
                            isLocked={false}
                            isPurchased={service.isPurchased}
                            unlockedBackgrounds={unlockedBackgrounds}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ServicesPage;