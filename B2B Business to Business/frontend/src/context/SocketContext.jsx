import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
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
                                {notif.type === 'NEW_QUOTE' && 'YENİ TEKLİF TALEBİ'}
                                {notif.type === 'OFFER_MADE' && 'YENİ FİYAT TEKLİFİ'}
                                {notif.type === 'STATUS_CHANGED' && 'TEKLİF DURUM GÜNCELLEMESİ'}
                                {notif.type === 'NEW_CHAT_MESSAGE' && 'YENİ MESAJ'}
                                {notif.type === 'TRACKING_UPDATED' && 'SİPARİŞ DURUMU GÜNCELLEMESİ'}
                                {!notif.type && 'BİLDİRİM'}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notif.id);
                                }}
                                className="text-slate-400 hover:text-white font-extrabold text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60 cursor-pointer"
                            >
                                Kapat
                            </button>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed text-slate-100">
                            {notif.message}
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
