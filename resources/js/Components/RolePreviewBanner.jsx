import React from 'react';
import { router } from '@inertiajs/react';
import { Eye, X } from 'lucide-react';

export default function RolePreviewBanner({ activeRole, onExit }) {
    if (!activeRole) return null;

    const roleName = activeRole.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const handleExit = () => {
        if (onExit) {
            onExit();
        } else {
            router.post(route('switch-role.exit'));
        }
    };

    return (
        <div className="bg-gradient-to-r from-amber-500/95 via-orange-500/95 to-amber-600/95 text-white text-xs py-2 px-4 shadow-sm z-50 flex items-center justify-between sticky top-0 backdrop-blur-sm">
            <div className="flex items-center gap-2 max-w-xl truncate">
                <span className="p-1 rounded bg-black/20 text-white">
                    <Eye className="w-3.5 h-3.5 animate-pulse" />
                </span>
                <span className="font-medium">
                    Preview Mode: You are viewing this application from the <strong className="underline font-bold">{roleName}</strong> perspective.
                </span>
            </div>

            <button
                onClick={handleExit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white text-gray-900 hover:bg-gray-100 font-semibold text-[11px] shadow-xs transition cursor-pointer"
            >
                <span>Exit Preview</span>
                <X className="w-3 h-3 text-gray-500" />
            </button>
        </div>
    );
}
