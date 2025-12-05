import React from 'react';

/**
 * A reusable component for the Google G logo icon.
 * It accepts standard SVG props for customization (e.g., width, height, className).
 */
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        {...props} 
        viewBox="0 0 24 24" 
        fill="none" 
        // Use a default size if not provided via props, e.g., for Tailwind CSS
        className={props.className || "w-5 h-5"}
    >
        {/* Blue segment */}
        <path 
            d="M22.56 12.25c0-.66-.06-1.3-.17-1.92H12v3.84h5.68c-.26 1.34-1.04 2.53-2.22 3.32v2.66h3.42c2.01-1.85 3.17-4.57 3.17-7.9z" 
            fill="#4285F4"
        />
        {/* Green segment */}
        <path 
            d="M12 23c3.27 0 6.02-1.08 8.03-2.92l-3.42-2.66c-.95.63-2.18 1-3.61 1-2.79 0-5.16-1.89-6.01-4.45H2.57v2.75C4.69 21.52 8.16 23 12 23z" 
            fill="#34A853"
        />
        {/* Yellow segment */}
        <path 
            d="M5.99 14.97c-.24-.7-.38-1.44-.38-2.23s.14-1.53.38-2.23V7.76H2.57c-.98 1.95-1.57 4.17-1.57 6.48s.59 4.53 1.57 6.48l3.42-2.75c-.24-.7-.38-1.44-.38-2.23z" 
            fill="#FBBC05"
        />
        {/* Red segment */}
        <path 
            d="M12 4.19c1.47 0 2.82.5 3.88 1.41l3.05-3.04C18.02 1.5 15.27.42 12 .42c-3.84 0-7.31 1.48-9.43 3.99l3.42 2.75c.85-2.56 3.22-4.45 6.01-4.45z" 
            fill="#EA4335"
        />
    </svg>
);

export default GoogleIcon;