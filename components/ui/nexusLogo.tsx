export default function NexusLogo({
  width = 200,
  height = 200,
  color = "white",
  showText = true,
  className = ""
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 主要连接结构 - 六边形 */}
      <path
        d="M100,40 L150,70 L150,130 L100,160 L50,130 L50,70 Z"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />

      {/* 内部连接线 */}
      <line x1="100" y1="40" x2="100" y2="160" stroke={color} strokeWidth="2" />
      <line x1="50" y1="70" x2="150" y2="130" stroke={color} strokeWidth="2" />
      <line x1="50" y1="130" x2="150" y2="70" stroke={color} strokeWidth="2" />

      {/* 节点 */}
      <circle cx="100" cy="40" r="6" fill={color} />
      <circle cx="150" cy="70" r="6" fill={color} />
      <circle cx="150" cy="130" r="6" fill={color} />
      <circle cx="100" cy="160" r="6" fill={color} />
      <circle cx="50" cy="130" r="6" fill={color} />
      <circle cx="50" cy="70" r="6" fill={color} />

      {/* 中心节点 - 稍大一些 */}
      <circle cx="100" cy="100" r="10" fill={color} />

      {/* 文字 - 可选 */}
      {showText && (
        <text
          x="100"
          y="190"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontSize="20"
          fontWeight="300"
          letterSpacing="3"
          textAnchor="middle"
          fill={color}
        >
          NEXUS
        </text>
      )}
    </svg>
  );
}