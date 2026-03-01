# INZAN Athletics Platform

A premium, dual-interface fitness management system featuring a mobile-first User App and a desktop-first Admin Hub. The platform is designed with a futuristic, high-performance aesthetic, utilizing heavy glassmorphism, ambient lighting, and brutalist typography.

## Architecture

The application is a Single Page Application (SPA) built with React and Vite. It uses `react-router-dom` to separate the two main interfaces:

*   **`/` (User App):** A mobile-first interface designed for gym members. It features a bottom navigation bar and is constrained to a `max-w-md` container to simulate a mobile device on desktop browsers.
*   **`/admin` (Admin Hub):** A desktop-first dashboard designed for gym staff and management. It features a sidebar navigation and expansive data visualizations.

## Tech Stack

*   **Framework:** React 19 + Vite
*   **Routing:** React Router v7
*   **Styling:** Tailwind CSS v4
*   **Icons:** Lucide React
*   **Animations:** Motion (Framer Motion)
*   **Charts:** Recharts

## Design System & Styling Guidelines

The application follows a strict, premium aesthetic:

*   **Color Palette:**
    *   Backgrounds: `#050505`, `#0a0a0a`, `#1a1a1a`
    *   Primary Accent: `#FFB800` (Gold/Yellow)
    *   Secondary Accents: `emerald-500` (Positive/Stable), `red-500` (Negative/High Risk)
*   **Glassmorphism:** Heavy use of `bg-white/5` combined with `backdrop-blur-xl` or `backdrop-blur-2xl` for cards, modals, and navigation bars.
*   **Ambient Lighting:** Large, blurred, low-opacity radial gradients (e.g., `bg-[#FFB800]/5 blur-[120px]`) placed behind UI elements to create depth.
*   **Typography:** 
    *   Headers: `font-light tracking-tight uppercase`
    *   Labels/Subtitles: `text-[10px] tracking-widest uppercase font-bold`
*   **Borders:** Subtle `border-white/10` or `border-white/5` to define glass panels.

## Key Features Implemented

### User App (`/src/pages/UserApp.tsx`)
1.  **Home Tab:** Features an AI Recovery Coach that analyzes strain and suggests classes, a "Back Freeze" hero banner, and a live capacity ring.
2.  **Classes Tab:** Sleek class scheduling with filter toggles and immersive class cards featuring watermark text.
3.  **Kitchen Tab:** "Pre-Fuel" and "Post-Recovery" ordering system that syncs with the user's class schedule.
4.  **Profile Tab:** Includes live wearable sync ("The Zone") showing daily strain/recovery, and a gamified "Athletic Passport" badge system.
5.  **More Tab:** Consolidated list of secondary links (Trainers, Events, Rules, Contact) using glassmorphism list items.

### Admin Hub (`/src/pages/AdminHub.tsx`)
1.  **Dashboard:** Features an interactive "IoT Facility Control" heatmap. Clicking a zone opens a control panel for Temperature, Lighting, and Audio.
2.  **Members:** Includes a "Predictive Retention Engine" banner flagging high-risk users, and a detailed member table with risk level indicators.
3.  **Classes:** Features a "Dynamic Class Yield Management" AI insight card suggesting schedule optimizations based on historical attendance.
4.  **Coaches:** Includes a Recharts Scatter Plot ("Performance Matrix") comparing coach retention rates vs. average client kitchen spend.
5.  **EK Kitchen:** Features "Smart Inventory Auto-Ordering" that automatically drafts purchase orders when stock (e.g., Spinach) falls below a threshold.

## Next Steps for Development

If continuing development in Google AI Antigravity, consider the following:
1.  **Backend Integration:** The app currently uses static mock data. The next major step is to connect it to a real backend (e.g., Firebase, Supabase, or a custom Express/Node.js server) to handle real user authentication, live class bookings, and actual IoT hardware sync.
2.  **Responsive Design:** While the Admin Hub is desktop-focused and the User App is mobile-focused, ensuring graceful degradation/scaling across all device sizes (tablets, ultra-wide monitors) would be beneficial.
3.  **Accessibility:** Review color contrast ratios (especially with the glassmorphism effects) and ensure all interactive elements have proper `aria-labels` and keyboard navigation support.
