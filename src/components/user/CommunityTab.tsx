import React, { useState, useEffect } from "react";
import { 
  Trophy, Heart, MessageSquare, Share2, 
  Activity, Zap, Moon, Watch, PlusCircle, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";
import { useData } from "../../context/DataContext";
import { WearableIntegrationManager, WearableData } from "../../utils/WearableIntegrationManager";
import { supabase } from "../../lib/supabase";

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

const LEADERBOARD_MOCK = [
  { rank: 1, name: "Sarah K.", points: 12500, trend: "up" },
  { rank: 2, name: "Michael M.", points: 11200, trend: "up" },
  { rank: 3, name: "Alex R.", points: 10800, trend: "same" },
  { rank: 4, name: "Jessica T.", points: 9500, trend: "down" },
  { rank: 5, name: "David L.", points: 8900, trend: "up" },
];

const FEED_MOCK: Post[] = [
  {
    id: "1",
    author: "Sarah K.",
    avatar: "https://i.pravatar.cc/150?u=1",
    content: "Just hit a new PR on the deadlift! 120kg feeling light today. Thanks to Coach Mark for the programming. 🚀🔥",
    likes: 24,
    comments: 5,
    time: "2h ago"
  },
  {
    id: "2",
    author: "Alex R.",
    avatar: "https://i.pravatar.cc/150?u=2",
    content: "The Kinetic Fuel meal prep this week is insane. That teriyaki bowl is 10/10.",
    likes: 18,
    comments: 2,
    time: "5h ago"
  }
];

export default function CommunityTab() {
  const { currentUser } = useData();
  const [activeSegment, setActiveSegment] = useState<"feed" | "leaderboard" | "wearables">("feed");
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWhoopConnected, setIsWhoopConnected] = useState(false);
  const [feed, setFeed] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchSocial = async () => {
      // Fetch Feed
      let { data: feedData } = await supabase.from('social_posts').select('*');
      if (!feedData || feedData.length === 0) {
        // Seed mock
        for (const p of FEED_MOCK) {
          await supabase.from('social_posts').insert(p);
        }
        feedData = FEED_MOCK;
      }
      setFeed(feedData || []);

      // Fetch Leaderboard
      let { data: lbData } = await supabase.from('gamification_leaderboard').select('*').order('points', { ascending: false });
      if (!lbData || lbData.length === 0) {
        // Seed mock
        for (const user of LEADERBOARD_MOCK) {
          await supabase.from('gamification_leaderboard').insert(user);
        }
        lbData = LEADERBOARD_MOCK;
      }
      setLeaderboard(lbData || []);
    };
    fetchSocial();
  }, []);

  const handleSyncWearable = async () => {
    setIsSyncing(true);
    try {
      if (!isWhoopConnected) {
        await WearableIntegrationManager.connectProvider("whoop");
        setIsWhoopConnected(true);
      }
      const data = await WearableIntegrationManager.fetchLatestData("whoop");
      setWearableData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10 font-sans pb-24">
      <header className="flex flex-col gap-2 pt-6 lg:pt-10">
        <h1 className="text-3xl lg:text-4xl font-heading tracking-tight text-white uppercase italic">
          Community & Sync
        </h1>
        <p className="text-[10px] lg:text-xs text-white/40 uppercase tracking-[0.3em] font-medium">
          Global Leaderboards • Social Feed • Devices
        </p>
      </header>

      {/* Tabs */}
      <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-white/5 shadow-inner">
        <button
          onClick={() => setActiveSegment("feed")}
          className={`flex-1 py-3 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            activeSegment === "feed"
              ? "bg-white/10 text-white shadow-lg"
              : "text-white/40 hover:text-white"
          }`}
        >
          Social Feed
        </button>
        <button
          onClick={() => setActiveSegment("leaderboard")}
          className={`flex-1 py-3 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            activeSegment === "leaderboard"
              ? "bg-[#FFB800] text-black shadow-[0_0_15px_rgba(255,184,0,0.3)]"
              : "text-white/40 hover:text-white"
          }`}
        >
          Rankings
        </button>
        <button
          onClick={() => setActiveSegment("wearables")}
          className={`flex-1 py-3 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            activeSegment === "wearables"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-white/40 hover:text-white"
          }`}
        >
          Wearables
        </button>
      </div>

      {activeSegment === "feed" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          {/* Post Action */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex items-center gap-4">
            <img src={currentUser?.avatar} className="w-12 h-12 rounded-full border border-white/10" alt="Me" />
            <input 
              type="text" 
              placeholder="Share your latest victory..." 
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button className="w-10 h-10 bg-[#FFB800] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shrink-0">
              <PlusCircle size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {feed.map((post: Post) => (
              <div key={post.id} className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={post.avatar} className="w-12 h-12 rounded-full" alt={post.author} />
                  <div>
                    <h4 className="font-bold text-white text-sm">{post.author}</h4>
                    <span className="text-[10px] tracking-widest text-white/30 uppercase">{post.time}</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">{post.content}</p>
                <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                  <button className="flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors text-xs font-bold">
                    <Heart size={16} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-white/40 hover:text-blue-500 transition-colors text-xs font-bold">
                    <MessageSquare size={16} /> {post.comments}
                  </button>
                  <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold ml-auto">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeSegment === "leaderboard" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#FFB800]/20 to-transparent border border-[#FFB800]/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Trophy size={48} className="text-[#FFB800] mb-4 drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" />
            <h3 className="text-2xl font-heading uppercase italic text-white">Season 4 Alpha</h3>
            <p className="text-xs text-[#FFB800] tracking-[0.2em] font-bold mt-2">ENDS IN 14 DAYS</p>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden">
            {leaderboard.map((user, idx) => (
              <div key={idx} className={`flex items-center justify-between p-5 border-b border-white/5 last:border-0 ${idx === 0 ? 'bg-white/5' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className={`w-8 font-black text-center ${idx === 0 ? 'text-[#FFB800] text-xl' : 'text-white/40 text-sm'}`}>
                    #{user.rank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.substring(0,2).toUpperCase()}
                  </div>
                  <span className="font-bold text-white text-sm">{user.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[#FFB800] text-sm">{user.points.toLocaleString()} PT</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeSegment === "wearables" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-8 text-center flex flex-col items-center">
            <Watch size={40} className="text-blue-400 mb-4" />
            <h3 className="text-xl font-heading uppercase italic text-white mb-2">Device Integration</h3>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-6">
              Connect your Apple Health, WHOOP, or Garmin to automatically calculate your daily Recovery and Strain.
            </p>
            
            <button 
              onClick={handleSyncWearable}
              disabled={isSyncing}
              className="px-6 py-3 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSyncing ? "SYNCING DATA..." : isWhoopConnected ? "SYNC LATEST DATA" : "CONNECT WHOOP / HEALTH"}
            </button>
          </div>

          {wearableData && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
                <Heart size={20} className="text-red-500" />
                <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold">Avg Heart Rate</span>
                <span className="text-2xl font-mono text-white">{wearableData.heartRateAvg} <span className="text-xs text-white/30">BPM</span></span>
              </div>
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
                <Activity size={20} className="text-blue-400" />
                <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold">Recovery</span>
                <span className="text-2xl font-mono text-white">{wearableData.recoveryScore}%</span>
              </div>
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
                <Moon size={20} className="text-purple-400" />
                <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold">Sleep Score</span>
                <span className="text-2xl font-mono text-white">{wearableData.sleepScore}%</span>
              </div>
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
                <Zap size={20} className="text-yellow-400" />
                <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold">Strain / Cal</span>
                <span className="text-2xl font-mono text-white">{wearableData.caloriesBurned}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
