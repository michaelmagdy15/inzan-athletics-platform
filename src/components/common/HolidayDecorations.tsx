import React from "react";
import { useData } from "../../context/DataContext";
import { motion } from "framer-motion";
import { Ghost, Moon, Snowflake, Star, Trees, Flower2 } from "lucide-react";

export default function HolidayDecorations() {
    const { settings } = useData();

    if (settings.theme === "default") return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[0]">
            {settings.theme === "halloween" && <HalloweenDecor />}
            {settings.theme === "christmas" && <ChristmasDecor />}
            {settings.theme === "ramadan" && <RamadanDecor />}
            {settings.theme === "easter" && <EasterDecor />}
        </div>
    );
}

function HalloweenDecor() {
    return (
        <>
            <DecorationItem icon={<Ghost size={32} />} x="10%" y="15%" delay={0} />
            <DecorationItem icon={<Ghost size={24} />} x="85%" y="25%" delay={2} />
            <DecorationItem icon={<Ghost size={20} />} x="25%" y="75%" delay={4} />
        </>
    );
}

function ChristmasDecor() {
    return (
        <>
            <DecorationItem icon={<Snowflake size={32} />} x="15%" y="10%" delay={0} pulse />
            <DecorationItem icon={<Snowflake size={24} />} x="75%" y="40%" delay={1} pulse />
            <DecorationItem icon={<Trees size={40} />} x="5%" y="85%" delay={2} />
            <DecorationItem icon={<Snowflake size={20} />} x="90%" y="70%" delay={3} pulse />
        </>
    );
}

function RamadanDecor() {
    return (
        <>
            <DecorationItem icon={<Moon size={48} />} x="85%" y="10%" delay={0} />
            <DecorationItem icon={<Star size={16} />} x="75%" y="15%" delay={1} pulse />
            <DecorationItem icon={<Star size={12} />} x="92%" y="25%" delay={1.5} pulse />
            <DecorationItem icon={<Star size={14} />} x="80%" y="30%" delay={2} pulse />
        </>
    );
}

function EasterDecor() {
    return (
        <>
            <DecorationItem icon={<Flower2 size={32} />} x="10%" y="80%" delay={0} />
            <DecorationItem icon={<Flower2 size={24} />} x="20%" y="85%" delay={1} />
            <DecorationItem icon={<Flower2 size={28} />} x="85%" y="82%" delay={2} />
        </>
    );
}

function DecorationItem({ icon, x, y, delay = 0, pulse = false }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: pulse ? [1, 1.2, 1] : 1,
                y: [0, -20, 0]
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
            }}
            style={{ left: x, top: y }}
            className="absolute text-gold/20"
        >
            {icon}
        </motion.div>
    );
}
