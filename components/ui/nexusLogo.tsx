"use client";
import { useEffect, useState } from "react";

export default function NexusLogo({
  width = 200,
  height = 200,
  color = "white",
  showText = true,
  showAnimation = true,
  className = ""
}) {
  const [position, setPosition] = useState({ x: 100, y: 40 });
  const [path, setPath] = useState([
    { x: 100, y: 40 },
    { x: 150, y: 70 },
    { x: 150, y: 130 },
    { x: 100, y: 160 },
    { x: 50, y: 130 },
    { x: 50, y: 70 },
    { x: 100, y: 40 }
  ]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [nextPointIndex, setNextPointIndex] = useState(1);

  useEffect(() => {
    if (!showAnimation) return;

    const animationSpeed = 0.05;
    let animationFrameId: number;

    const animate = () => {
      setPosition(prevPos => {
        const targetPoint = path[nextPointIndex];
        const dx = targetPoint.x - prevPos.x;
        const dy = targetPoint.y - prevPos.y;

        // 计算新位置
        const newX = prevPos.x + dx * animationSpeed;
        const newY = prevPos.y + dy * animationSpeed;

        // 检查是否已经足够接近目标点
        const isCloseEnough = Math.abs(newX - targetPoint.x) < 1 && Math.abs(newY - targetPoint.y) < 1;

        if (isCloseEnough) {
          // 更新到下一个目标点
          const newNextIndex = (nextPointIndex + 1) % path.length;
          setCurrentPointIndex(nextPointIndex);
          setNextPointIndex(newNextIndex);
          return targetPoint; // 直接跳到目标点
        }

        return { x: newX, y: newY };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [path, nextPointIndex, showAnimation]);

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

      {/* 移动的点 */}
      {showAnimation && (
        <circle
          cx={position.x}
          cy={position.y}
          r="6"
          fill="#FF5000"
          filter="drop-shadow(0 0 3px #FF5000)"
        >
          <animate
            attributeName="r"
            values="6;8;6"
            dur="1.5s"
            repeatCount="indefinite"
            />
          </circle>
      )}

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