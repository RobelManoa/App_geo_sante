import React from "react";
import { IconType } from "react-icons/lib";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface StatCardProps {
  title: string;
  value: number | string;
  color?: string;
  trend?: number;
  trendLabel?: string;
  percentage?: number;
}

export default function StatCard({
  title,
  value,
  color = "primary",
  trend,
  trendLabel,
  percentage,
}: StatCardProps) {
  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
      secondary: "text-secondary",
    };
    return colorMap[color] || "text-primary";
  };

  const getBgColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-info",
      secondary: "bg-secondary",
    };
    return colorMap[color] || "bg-primary";
  };

  return (
    <div className="stat-card">
      <div className="stat-icon">
        {/* <Icon className={`icon ${getColorClass(color)}`} /> */}
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p className="stat-title">{title}</p>
        
        {(trend !== undefined || percentage !== undefined) && (
          <div className="stat-metrics">
            {trend !== undefined && (
              <div className={`trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                <span>{Math.abs(trend)}%</span>
                {trendLabel && <span className="trend-label">{trendLabel}</span>}
              </div>
            )}
            
            {percentage !== undefined && (
              <div className="percentage">
                <span>{percentage}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
