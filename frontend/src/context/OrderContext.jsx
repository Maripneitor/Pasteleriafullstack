import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const [step, setStep] = useState(1);
    const [orderData, setOrderData] = useState({
        clientName: '',
        clientPhone: '',
        // Products (Pastel Principal)
        products: [], // { id, flavor, filling, design... } 

        // New Arrays
        complements: [], // Complex extra cakes: { personas, flavor, filling... }
        extras: [],      // Simple items: { qty, name, price }

        // Delivery
        deliveryDate: '',
        deliveryTime: '',
        isDelivery: false,
        deliveryLocation: '', // General field (legacy or simple)
        calle: '',
        colonia: '',
        referencias: '',
        shippingCost: 0,

        total: '',
        advance: '',
        applyCommission: false,
        
        // --- Nuevos Campos Especiales ---
        tipo_folio: 'Normal',
        num_pisos: 1,
        tematica: '',
        paleta_colores: '',
        tipo_cobertura: '',
        decoracion_especial: '',
        alergias: ''
    });

    const updateOrder = (data) => {
        setOrderData((prev) => {
            // Support functional updates: updateOrder(prev => ({...}))
            const newData = typeof data === 'function' ? data(prev) : data;
            return { ...prev, ...newData };
        });
    };

    const resetOrder = () => {
        setStep(1);
        setOrderData({
            clientName: '',
            clientPhone: '',
            products: [],
            complements: [],
            extras: [],
            deliveryDate: '',
            deliveryTime: '',
            isDelivery: false,
            deliveryLocation: '',
            calle: '',
            colonia: '',
            referencias: '',
            shippingCost: 0,
            total: '',
            advance: '',
            applyCommission: false,
            tipo_folio: 'Normal',
            num_pisos: 1,
            tematica: '',
            paleta_colores: '',
            tipo_cobertura: '',
            decoracion_especial: '',
            alergias: ''
        });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => (s > 1 ? s - 1 : 1));

    return (
        <OrderContext.Provider value={{ step, setStep, nextStep, prevStep, orderData, updateOrder, resetOrder }}>
            {children}
        </OrderContext.Provider>
    );
};
