import React from "react";
import { motion } from "motion/react";

export default React.memo(function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li
      className="flex flex-col items-center gap-1.5 cursor-pointer relative group w-14"
      onClick={onClick}
    >
      <div
        className={`transition-all duration-300 relative z-10 ${isActive ? "text-[#FFB800] scale-110" : "text-gray-500 group-hover:text-gray-300"}`}
      >
        {icon}
      </div>
      <span
        className={`text-[9px] font-medium tracking-wider transition-colors duration-300 ${isActive ? "text-[#FFB800]" : "text-gray-500 group-hover:text-gray-300"}`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-5 w-1 h-1 bg-[#FFB800] rounded-full shadow-[0_0_10px_#FFB800]"
        />
      )}
    </li>
  );
});
