import React from "react";
import {
  Bell,
  Users,
  Calendar,
  FileText,
  MoreHorizontal,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MoreTab() {
  const navigate = useNavigate();
  return (
    <div className="p-6 pt-12 flex flex-col gap-8">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-light tracking-tight">Settings</h2>
        <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell size={18} />
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <MoreItem
          icon={<Users size={20} />}
          label="Trainers"
          onClick={() => navigate("/p/trainers")}
        />
        <MoreItem
          icon={<Calendar size={20} />}
          label="Events & Offers"
          onClick={() => navigate("/p/events-offers")}
        />
        <MoreItem
          icon={<FileText size={20} />}
          label="Blogs"
          onClick={() => navigate("/p/blogs")}
        />
        <MoreItem
          icon={<MoreHorizontal size={20} />}
          label="Gallery"
          onClick={() => navigate("/p/gallery")}
        />
        <div className="h-px bg-white/10 my-2 mx-4" />
        <MoreItem
          icon={<Shield size={20} />}
          label="About INZAN"
          onClick={() => navigate("/p/about")}
        />
        <MoreItem
          icon={<Users size={20} />}
          label="Rules & Regulations"
          onClick={() => navigate("/p/rules")}
        />
        <div className="h-px bg-white/10 my-2 mx-4" />
        <MoreItem
          icon={<Users size={20} />}
          label="Contact Us"
          onClick={() => navigate("/p/contact")}
        />
        <div className="mt-8 pt-8 border-t border-white/5 text-center opacity-20">
          <p className="text-[10px] uppercase tracking-widest font-black">
            Created by Michael Mitry
          </p>
        </div>
      </div>
    </div>
  );
}

function MoreItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FFB800] transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </div>
      <ArrowRight
        size={16}
        className="text-gray-600 group-hover:text-white transition-colors"
      />
    </div>
  );
}
