import React from 'react';

export default function ApplicationLogo({ className = 'w-7 h-7', ...props }) {
    return (
        <div 
            className={`rounded-lg bg-[#5B5FC7] text-white flex items-center justify-center flex-shrink-0 ${className}`} 
            {...props}
        >
            {/* Template Logo Placeholder: Easily replace this SVG/icon with your brand logo */}
            <svg 
                className="w-4 h-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <rect width="18" height="18" x="3" y="3" rx="2" />
            </svg>
        </div>
    );
}
