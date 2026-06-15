export function DroneIcon({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <polygon
                points="12,2 4,9 7,9 7,15 9,15 9,11 15,11 15,15 17,15 17,9 20,9"
                fill="#3b82f6"
                opacity="0.9"
            />
            <rect x="10" y="15" width="4" height="6" fill="#3b82f6" opacity="0.7" />
            <line
                x1="7"
                y1="18"
                x2="17"
                y2="18"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.5"
            />
            <circle cx="12" cy="6" r="1.5" fill="#93c5fd" />
        </svg>
    );
}
