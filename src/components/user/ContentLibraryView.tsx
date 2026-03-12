import React, { useState } from "react";
import { Play, FileText, Lock, Search, RefreshCw, X, Tag, UserCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../../context/DataContext";

export default function ContentLibraryView() {
  const { libraryContent, currentUser } = useData();
  const [activeTab, setActiveTab] = useState<"all" | "video" | "article" | "document">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const isPremiumUser = currentUser?.membershipStatus === "active";

  const filteredContent = libraryContent.filter((item) => {
    const typeMatch = activeTab === "all" || item.content_type === activeTab;
    const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && searchMatch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Play size={20} />;
      case "article": return <FileText size={20} />;
      case "document": return <FileText size={20} />;
      default: return <Play size={20} />;
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            Inzan Library
          </h2>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Exclusive Content & Resources
          </p>
        </div>
        
        <div className="flex-1 max-w-sm relative group overflow-hidden w-full">
          <Search
            className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-14 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all shadow-inner uppercase tracking-widest font-bold"
          />
        </div>
      </div>

      <div className="flex border-b border-white/5 pb-px gap-6 font-bold overflow-x-auto scrollbar-hide">
        {["all", "video", "article", "document"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 relative ${
              activeTab === tab ? "text-gold" : "text-white/30 hover:text-white"
            }`}
          >
            {tab === "document" ? "Guides" : tab}
            {activeTab === tab && (
              <motion.div
                layoutId="libraryTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContent.map((item) => {
          const isLocked = item.is_premium && !isPremiumUser;
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              onClick={() => !isLocked && setSelectedItem(item)}
              className={`glass-card rounded-[2rem] border border-white/5 overflow-hidden flex flex-col group transition-all duration-500 relative ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-gold/30'}`}
            >
              <div className="h-40 bg-black/40 relative overflow-hidden">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:text-gold/20 transition-colors">
                    {getIcon(item.content_type)}
                  </div>
                )}
                
                <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white">
                  {getIcon(item.content_type)}
                </div>

                {item.is_premium && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gold/90 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5 shadow-lg">
                    Premium {isLocked && <Lock size={10} />}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-heading text-white mb-2 group-hover:text-gold transition-colors">{item.title}</h3>
                <p className="text-[10px] text-white/40 leading-relaxed font-bold line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  {item.author_name && (
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">By {item.author_name}</span>
                  )}
                  {item.tags?.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-[9px] text-gold/60 uppercase tracking-widest font-black border border-gold/20 px-2 py-1 rounded-md">
                        {item.tags[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold mb-4 border border-gold/30">
                    <Lock size={20} />
                  </div>
                  <p className="text-white font-heading text-lg mb-2">Premium Member Access</p>
                  <p className="text-[9px] text-white/50 tracking-widest uppercase font-bold">Upgrade your membership to unlock this content</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      
      {filteredContent.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <RefreshCw className="text-white/10 mb-4" size={48} />
          <h3 className="text-white font-heading text-xl mb-2">No Content Found</h3>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">
            Check back later for new resources
          </p>
        </div>
      )}

      {/* Content Viewer Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] rounded-[2rem] lg:rounded-[3rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden relative"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
              >
                <X size={20} className="text-white/50" />
              </button>

              <div className="h-48 md:h-64 bg-black relative border-b border-white/5 shrink-0">
                {selectedItem.thumbnail_url ? (
                  <img src={selectedItem.thumbnail_url} alt="" className="w-full h-full object-cover opacity-40" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-transparent">
                    {getIcon(selectedItem.content_type)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {selectedItem.content_type === "video" && (
                     <div className="w-16 h-16 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-2xl backdrop-blur-md">
                        <Play size={24} className="ml-1" />
                     </div>
                  )}
                </div>
              </div>

              <div className="p-6 md:p-10 overflow-y-auto scrollbar-hide flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] text-white/50 font-black uppercase tracking-widest flex items-center gap-2">
                    {getIcon(selectedItem.content_type)}
                    {selectedItem.content_type}
                  </div>
                  {selectedItem.is_premium && (
                    <div className="px-3 py-1 bg-gold/10 rounded-full border border-gold/20 text-[9px] text-gold font-black uppercase tracking-widest flex items-center gap-1.5">
                      Premium <Lock size={10} />
                    </div>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-heading text-white mb-4 uppercase">{selectedItem.title}</h2>
                
                <div className="flex items-center gap-4 border-y border-white/5 py-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-white font-bold">{selectedItem.author_name || "Inzan Coach"}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">
                      {new Date(selectedItem.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none mb-8 text-sm text-white/70 font-medium leading-relaxed">
                  <p>{selectedItem.description}</p>
                  
                  {/* Mock content rendering */}
                  <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-white/40 mb-4 font-bold text-center">Content Viewer Placeholder</p>
                    <div className="w-full h-12 bg-black/40 rounded-xl flex items-center justify-between px-6 border border-white/5 group hover:border-gold/30 cursor-pointer transition-colors">
                      <span className="text-xs font-bold text-white group-hover:text-gold transition-colors break-all line-clamp-1">{selectedItem.url}</span>
                      <ChevronRight size={16} className="text-white/30" />
                    </div>
                  </div>
                </div>

                {selectedItem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag: string, i: number) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] text-white/40 font-black uppercase tracking-widest">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
