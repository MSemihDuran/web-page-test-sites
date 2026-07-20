import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
    const { token } = useAuth();
    const { language } = useLanguage();
    const [basketItems, setBasketItems] = useState([]);
    const [isBasketOpen, setIsBasketOpen] = useState(false);
    const [basketNotes, setBasketNotes] = useState('');
    const [basketCurrency, setBasketCurrency] = useState('TRY');
    const [basketVatRate, setBasketVatRate] = useState(20.0);

    useEffect(() => {
        const savedBasket = localStorage.getItem('apex_rfq_basket');
        if (savedBasket) {
            try {
                setBasketItems(JSON.parse(savedBasket));
            } catch (e) {
                console.error('Failed to parse basket items', e);
            }
        }
    }, []);

    const saveBasket = (newItems) => {
        setBasketItems(newItems);
        localStorage.setItem('apex_rfq_basket', JSON.stringify(newItems));
    };

    const addToBasket = (product, quantity = 1, color = null, e = null) => {
        if (e && e.stopPropagation) e.stopPropagation();

        const existsIndex = basketItems.findIndex(item => item.product.id === product.id);
        const defaultColor = color || (product.colorImages && product.colorImages.length > 0
            ? product.colorImages[0].color
            : product.color || 'Varsayılan');

        let updated;
        if (existsIndex > -1) {
            updated = [...basketItems];
            updated[existsIndex].quantity += Number(quantity);
            if (color) {
                updated[existsIndex].color = color;
            }
        } else {
            updated = [...basketItems, { product, quantity: Number(quantity), color: defaultColor }];
        }
        saveBasket(updated);
        setIsBasketOpen(true);
    };

    const removeFromBasket = (productId, e = null) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const updated = basketItems.filter(item => item.product.id !== productId);
        saveBasket(updated);
    };

    const updateBasketQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        const updated = basketItems.map(item => {
            if (item.product.id === productId) {
                return { ...item, quantity: Number(newQty) };
            }
            return item;
        });
        saveBasket(updated);
    };

    const updateBasketColor = (productId, color) => {
        const updated = basketItems.map(item => {
            if (item.product.id === productId) {
                return { ...item, color };
            }
            return item;
        });
        saveBasket(updated);
    };

    const clearBasket = () => {
        saveBasket([]);
        setBasketNotes('');
    };

    return (
        <BasketContext.Provider value={{
            basketItems,
            isBasketOpen,
            setIsBasketOpen,
            basketNotes,
            setBasketNotes,
            basketCurrency,
            setBasketCurrency,
            basketVatRate,
            setBasketVatRate,
            addToBasket,
            removeFromBasket,
            updateBasketQuantity,
            updateBasketColor,
            clearBasket,
            saveBasket
        }}>
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};
