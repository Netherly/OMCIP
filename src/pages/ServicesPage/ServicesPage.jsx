import React from "react";
import "./ServicesPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ServiceCard from "./components/ServiceCard";
import { useGame } from "../../context/GameContext";

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
    const { coins, addCoins, background } = useGame();

    const services = [
        {
            id: 1,
            title: "Скидка 10% на любую услугу клиники",
            image: Discount10,
            cost: 50000,
        },
        {
            id: 2,
            title: "Скидка 20% на любую услугу клиники",
            image: Discount20,
            cost: 250000,
        },
        {
            id: 3,
            title: "Скидка 30% на любую услугу клиники",
            image: Discount30,
            cost: 750000,
        },
        {
            id: 4,
            title: "Бесплатная чистка зубов",
            image: Cleaning,
            cost: 500000,
        },
        {
            id: 5,
            title: "Бесплатная консультация с врачом + снимки + план лечения",
            image: Consultation,
            cost: 50000,
        },
        {
            id: 6,
            title: "Имплант в подарок",
            image: Implant,
            cost: 5000000,
        },
        {
            id: 7,
            title: "Коронка из диоксида циркония в подарок",
            image: Crown,
            cost: 5000000,
        },
        {
            id: 8,
            title: "Обследование на внутриротовом сканере Sirona + стоматология",
            image: Scanner,
            cost: 50000,
        },
        {
            id: 9,
            title: "Компьютерная томография",
            image: Tomography,
            cost: 900000,
        },
        {
            id: 10,
            title: "Сертификат на 3000 рублей",
            image: Certificate3000,
            cost: 900000,
        },
        {
            id: 11,
            title: "Сертификат на 5000 рублей",
            image: Certificate5000,
            cost: 1600000,
        },
    ];

    const handlePurchase = (service) => {
        if (coins >= service.cost) {
            addCoins(-service.cost);
            console.log(`Куплена услуга: ${service.title}`);
        } else {
            console.log("Недостаточно зубкоинов!");
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
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            canAfford={coins >= service.cost}
                            onPurchase={() => handlePurchase(service)}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ServicesPage;