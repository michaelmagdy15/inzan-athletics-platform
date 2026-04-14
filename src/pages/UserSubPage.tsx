import React, { useState, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";
import { useData } from "../context/DataContext";
import { useBranding } from "../context/BrandingContext";
import { motion } from "framer-motion";

// Modular Subpages
import QRScannerView from "../components/user/subpages/QRScannerView";
import FreezeRequestView from "../components/user/subpages/FreezeRequestView";
import DailyScheduleView from "../components/user/subpages/DailyScheduleView";
import MembershipPackagesView from "../components/user/subpages/MembershipPackagesView";
import NutritionView from "../components/user/subpages/NutritionView";
import InvitationsView from "../components/user/subpages/InvitationsView";
import AttendanceLogsView from "../components/user/subpages/AttendanceLogsView";

// Lazy-loaded Panels
import MessagesPanel from "../components/user/MessagesPanel";
import WorkoutsPanel from "../components/user/WorkoutsPanel";

const ContentLibraryView = lazy(() => import('../components/user/ContentLibraryView'));
const EventsOffersView = lazy(() => import('../components/user/EventsOffersView'));

export default function UserSubPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { config } = useBranding();
  const { 
    currentUser, 
    classes, 
    registerAttendance, 
    membershipTiers, 
    checkoutPay, 
    invitations, 
    createInvitation, 
    packageOfferings, 
    attendanceLogs, 
    submitFreezeRequest, 
    freezeRequests, 
    workouts, 
    logWorkout, 
    nutritionAssessments, 
    messages, 
    sendMessage, 
    markAsRead, 
    members 
  } = useData();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSimulateScan = async () => {
    if (!currentUser) return;
    try {
      await registerAttendance(currentUser.code);
      setScanStatus("success");
      setTimeout(() => setScanStatus("idle"), 3000);
    } catch (err: any) {
      setScanStatus("error");
      setTimeout(() => setScanStatus("idle"), 3000);
    }
  };

  const renderContent = () => {
    switch (pageId) {
      case "qr-scanner":
        return (
          <QRScannerView 
            currentUser={currentUser} 
            config={config} 
            scanStatus={scanStatus} 
            handleSimulateScan={handleSimulateScan} 
          />
        );

      case "request-freeze":
        return (
          <FreezeRequestView 
            currentUser={currentUser} 
            submitFreezeRequest={submitFreezeRequest} 
            freezeRequests={freezeRequests} 
          />
        );

      case "daily-schedule":
        return <DailyScheduleView classes={classes} />;

      case "packages":
        return (
          <MembershipPackagesView 
            currentUser={currentUser}
            membershipTiers={membershipTiers}
            packageOfferings={packageOfferings}
            checkoutPay={checkoutPay}
            promoCodeInput={promoCodeInput}
            setPromoCodeInput={setPromoCodeInput}
          />
        );

      case "nutrition":
        return <NutritionView currentUser={currentUser} nutritionAssessments={nutritionAssessments} />;

      case "invitations":
        return (
          <InvitationsView 
            currentUser={currentUser} 
            invitations={invitations} 
            createInvitation={createInvitation} 
          />
        );

      case "attendance":
        return <AttendanceLogsView currentUser={currentUser} attendanceLogs={attendanceLogs} />;

      case "messages":
        return (
          <MessagesPanel 
            currentUser={currentUser} 
            messages={messages} 
            sendMessage={sendMessage} 
            markAsRead={markAsRead} 
            staff={members.filter((m: any) => m.role === 'admin' || m.role === 'coach' || m.role === 'nutritionist')} 
          />
        );

      case "workouts":
        return <WorkoutsPanel workouts={workouts.filter((w: any) => w.member_id === currentUser?.id)} logWorkout={logWorkout} />;

      case "library":
        return (
          <Suspense fallback={<div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#FFB800] border-t-transparent mx-auto rounded-full" /></div>}>
            <ContentLibraryView />
          </Suspense>
        );

      case "events-offers":
        return (
          <Suspense fallback={<div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#FFB800] border-t-transparent mx-auto rounded-full" /></div>}>
            <EventsOffersView />
          </Suspense>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
            <Info size={40} className="text-gray-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Protocol data pending initialization.
            </p>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "qr-scanner": "Identity Portal",
      "request-freeze": "Protocol Freeze",
      "daily-schedule": "Temporal Matrix",
      packages: "Service Units",
      nutrition: "Kinetic Fuel",
      attendance: "Session Logs",
      billing: "Financial Ledger",
      trainers: "Unit Instructors",
      "events-offers": "Special Ops",
      about: "Facility Origin",
      contact: "Direct Uplink",
      notifications: "Comms Feed",
      invitations: "Guest Access",
      workouts: "Physical Logs",
      messages: "Direct Comms",
      library: "Content Library",
    };
    return titles[pageId || ""] || "Unknown Protocol";
  };

  return (
    <div className="h-[100dvh] bg-[#050505] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="flex items-center gap-4 p-6 pt-12 relative z-10 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-heading uppercase tracking-tight text-white">
            {getPageTitle()}
          </h2>
          <p className="text-[8px] text-[#FFB800] font-black uppercase tracking-[0.3em] italic">
            Sub-Protocol Active
          </p>
        </div>
      </header>

      <main className="content-fit p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden min-h-[500px]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}
