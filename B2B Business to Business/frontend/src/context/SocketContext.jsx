import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const { language } = useLanguage();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    const playNotificationSound = () => {
        const soundEnabled = localStorage.getItem('apex_sound_alerts') !== 'false';
        if (!soundEnabled) return;

        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start();
            osc1.stop(audioCtx.currentTime + 0.4);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); 
            gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.52);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(audioCtx.currentTime + 0.12);
            osc2.stop(audioCtx.currentTime + 0.52);
        } catch (e) {
            console.error('Failed to play Web Audio notification chime:', e);
        }
    };

    useEffect(() => {
        if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const s = io(API_BASE);
        setSocket(s);

        s.emit('join_user', user.id);

        s.on('quote_notification', (data) => {
            playNotificationSound();
            const id = Date.now() + Math.random();
            setNotifications(prev => [...prev, { ...data, id }]);
            
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        });

        return () => {
            s.disconnect();
        };
    }, [token, user]);

    const renderNotificationMessage = (notif) => {
        if (notif.message) return notif.message;
        
        const args = notif.messageArgs || [];
        switch (notif.messageKey) {
            case 'notif_new_quote':
                return language === 'TR'
                    ? `${args[0]} (${args[1]}) adlı firmadan '${args[2]}' ürünü için yeni bir teklif talebi geldi!`
                    : `New quote request received from ${args[0]} (${args[1]}) for product '${args[2]}'!`;
            case 'notif_tracking_updated':
                return language === 'TR'
                    ? `'${args[0]}' siparişinizin durumu güncellendi: ${args[1]}`
                    : `Your order status for '${args[0]}' has been updated to: ${args[1]}`;
            case 'notif_offer_made':
                return language === 'TR'
                    ? `${args[0]} firması '${args[1]}' ürünü için fiyat teklifi verdi: ${args[2]} ${args[3]}`
                    : `Company ${args[0]} offered a price quote for product '${args[1]}': ${args[2]} ${args[3]}`;
            case 'notif_status_changed':
                const actionLabel = language === 'TR'
                    ? (args[2] === 'APPROVED' ? 'onayladı' : 'reddetti')
                    : (args[2] === 'APPROVED' ? 'approved' : 'rejected');
                return language === 'TR'
                    ? `${args[0]} firması '${args[1]}' ürünü için verdiğiniz fiyat teklifini ${actionLabel}!`
                    : `Company ${args[0]} has ${actionLabel} your price quote proposal for '${args[1]}'!`;
            case 'notif_new_chat_message':
                return `${args[0]}: ${args[1]}`;
            default:
                return language === 'TR' ? 'Yeni bir güncelleme var' : 'There is a new update';
        }
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
            
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        onClick={() => {
                            removeNotification(notif.id);
                            window.location.href = `/quotes/${notif.quoteId}`;
                        }}
                        className="pointer-events-auto bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/50 shadow-2xl p-4 rounded-2xl flex flex-col gap-2 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:bg-slate-950/95 active:scale-98 animate-[slideIn_0.3s_ease-out] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 animate-[progress_6s_linear_forwards] w-full"></div>
                        <div className="flex justify-between items-start gap-2 pt-1">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                                {notif.type === 'NEW_QUOTE' && (language === 'TR' ? 'YENİ TEKLİF TALEBİ' : 'NEW QUOTE REQUEST')}
                                {notif.type === 'OFFER_MADE' && (language === 'TR' ? 'YENİ FİYAT TEKLİFİ' : 'NEW PRICE OFFER')}
                                {notif.type === 'STATUS_CHANGED' && (language === 'TR' ? 'TEKLİF DURUM GÜNCELLEMESİ' : 'QUOTE STATUS UPDATE')}
                                {notif.type === 'NEW_CHAT_MESSAGE' && (language === 'TR' ? 'YENİ MESAJ' : 'NEW MESSAGE')}
                                {notif.type === 'TRACKING_UPDATED' && (language === 'TR' ? 'SİPARİŞ DURUMU GÜNCELLEMESİ' : 'ORDER TIMELINE UPDATE')}
                                {!notif.type && (language === 'TR' ? 'BİLDİRİM' : 'NOTIFICATION')}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notif.id);
                                }}
                                className="text-slate-400 hover:text-white font-extrabold text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60 cursor-pointer"
                            >
                                {language === 'TR' ? 'Kapat' : 'Close'}
                            </button>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed text-slate-100">
                            {renderNotificationMessage(notif)}
                        </p>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slideIn {
                    from {
                        transform: translateY(100%) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}} />
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
