/**
 * DroneWatch — heading compass rose.
 *
 * Static dial with a needle rotated to the drone's heading (0 = north).
 */

export function Compass({ heading }: { heading: number }) {
    return (
        <svg viewBox="0 0 80 80" width="78" height="78">
            <circle
                cx="40"
                cy="40"
                r="37"
                fill="#06080d"
                stroke="#1e2330"
                strokeWidth="1"
            />
            <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#1a2240"
                strokeWidth="0.5"
            />

            <g stroke="#3a4d70" strokeWidth="1.2">
                <line x1="40" y1="5" x2="40" y2="12" />
                <line x1="75" y1="40" x2="68" y2="40" />
                <line x1="40" y1="75" x2="40" y2="68" />
                <line x1="5" y1="40" x2="12" y2="40" />
            </g>

            <text
                x="40"
                y="4"
                textAnchor="middle"
                dominantBaseline="hanging"
                fill="#3b82f6"
                fontSize="7.5"
                fontFamily="JetBrains Mono"
                fontWeight="700"
            >
                N
            </text>
            <text
                x="77"
                y="43"
                textAnchor="middle"
                fill="#3a4d70"
                fontSize="7"
                fontFamily="JetBrains Mono"
            >
                E
            </text>
            <text
                x="40"
                y="79"
                textAnchor="middle"
                fill="#3a4d70"
                fontSize="7"
                fontFamily="JetBrains Mono"
            >
                S
            </text>
            <text
                x="3"
                y="43"
                textAnchor="middle"
                fill="#3a4d70"
                fontSize="7"
                fontFamily="JetBrains Mono"
            >
                W
            </text>

            <g transform={`rotate(${heading}, 40, 40)`}>
                <polygon points="40,11 36.5,40 43.5,40" fill="#3b82f6" opacity="0.9" />
                <polygon points="40,68 36.5,40 43.5,40" fill="#1e2840" />
            </g>

            <circle
                cx="40"
                cy="40"
                r="4"
                fill="#06080d"
                stroke="#3b82f6"
                strokeWidth="1.2"
            />
            <circle cx="40" cy="40" r="1.5" fill="#3b82f6" />
        </svg>
    );
}
