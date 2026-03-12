import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Plus, Trash2, Link, Video, FileText, Tag, Lock, X } from "lucide-react";

export default function LibraryManagementView() {
  const { libraryContent, addContent, deleteContent } = useData();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"video" | "article" | "document">("video");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    
    await addContent({
      title,
      description,
      content_type: contentType,
      url,
      thumbnail_url: thumbnailUrl,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      is_premium: isPremium
    });

    setIsAddingMode(false);
    setTitle("");
    setDescription("");
    setUrl("");
    setThumbnailUrl("");
    setTagsInput("");
    setIsPremium(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video size={16} />;
      case "article": return <FileText size={16} />;
      case "document": return <FileText size={16} />;
      default: return <Link size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading text-white uppercase tracking-wider">Library Management</h2>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mt-1">Manage training content and resources</p>
        </div>
        <button
          onClick={() => setIsAddingMode(true)}
          className="bg-gold text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus size={16} /> Add Content
        </button>
      </div>

      {isAddingMode && (
        <div className="glass-card p-6 rounded-3xl border border-white/5 relative">
          <button 
            onClick={() => setIsAddingMode(false)}
            className="absolute top-6 right-6 text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-heading text-white uppercase tracking-wider mb-6">Create New Resource</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Title</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Deadlift Form"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Type</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors uppercase tracking-widest font-bold"
                >
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="document">Document</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of the content..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Content URL</label>
                <input
                  required
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Thumbnail URL (Optional)</label>
                <input
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex-1 mr-4">
                <input
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="Tags (comma separated, e.g. Form, Beginner)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-4 py-3 rounded-xl mx-4">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={e => setIsPremium(e.target.checked)}
                  className="accent-gold w-4 h-4 rounded"
                />
                <span className="text-[10px] text-white uppercase tracking-widest font-black flex items-center gap-1"><Lock size={12}/> Premium</span>
              </label>

              <button
                type="submit"
                className="bg-gold text-black px-8 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {libraryContent.map((item) => (
          <div key={item.id} className="glass-card rounded-[2rem] border border-white/5 overflow-hidden flex flex-col group">
            <div className="h-32 bg-black/40 relative">
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  {getIcon(item.content_type)}
                </div>
              )}
              <div className="absolute top-4 left-4 p-1.5 bg-black/60 rounded-lg text-white/50">
                {getIcon(item.content_type)}
              </div>
              {item.is_premium && (
                <div className="absolute top-4 right-4 bg-gold px-2 py-1 rounded text-[9px] font-black uppercase text-black flex items-center gap-1">
                  Premium <Lock size={10} />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="text-white font-bold leading-tight mb-2 pr-6">{item.title}</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-bold line-clamp-2 mb-4 flex-1">
                {item.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                  <Tag size={10} /> {item.tags?.[0] || "No Tags"}
                </span>
                
                <button
                  onClick={() => deleteContent(item.id)}
                  className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {libraryContent.length === 0 && (
          <div className="col-span-full py-20 text-center border whitespace-nowrap border-white/5 border-dashed rounded-[2rem] text-white/30">
            <p className="text-sm font-bold uppercase tracking-widest">No Library Content Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
