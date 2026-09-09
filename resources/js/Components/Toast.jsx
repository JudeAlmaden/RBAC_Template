import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─── Context ─────────────────────────────────────────────────────────── */

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

/* ─── Individual Toast ────────────────────────────────────────────────── */

const ICONS = {
    success: { Icon: CheckCircle2, color: 'text-emerald-500' },
    error:   { Icon: AlertCircle,  color: 'text-red-500' },
    warning: { Icon: AlertTriangle, color: 'text-amber-500' },
    info:    { Icon: Info,          color: 'text-[#5B5FC7]' },
};

function ToastItem({ toast, onDismiss }) {
    const { Icon, color } = ICONS[toast.type] || ICONS.info;
    const timerRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setVisible(true));

        timerRef.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.duration ?? 4000);

        return () => clearTimeout(timerRef.current);
    }, [toast.id]);

    return (
        <div
            className={`flex items-start gap-3 w-80 max-w-full bg-white dark:bg-[#1E1E26] border border-[#E8E8EC] dark:border-[#2E2E38] rounded-xl shadow-lg p-4 transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
        >
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
            <p className="flex-1 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                {toast.message}
            </p>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/* ─── Provider ────────────────────────────────────────────────────────── */

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message, type = 'info', duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const value = {
        toast,
        success: (msg, dur) => toast(msg, 'success', dur),
        error:   (msg, dur) => toast(msg, 'error',   dur),
        warning: (msg, dur) => toast(msg, 'warning',  dur),
        info:    (msg, dur) => toast(msg, 'info',     dur),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast portal — fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
