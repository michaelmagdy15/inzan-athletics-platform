import React from "react";
import { MessageSquare, Send } from "lucide-react";
import { Member } from "../../context/DataContext";

interface Props {
  currentUser: Member | null;
  messages: any[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  staff: Member[];
}

export default function MessagesPanel({ currentUser, messages, sendMessage, markAsRead, staff }: Props) {
  const [selectedStaffId, setSelectedStaffId] = React.useState(staff[0]?.id || "");
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    if (staff.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staff[0].id);
    }
  }, [staff, selectedStaffId]);

  const conversation = messages.filter((m: any) =>
    (m.sender_id === currentUser?.id && m.receiver_id === selectedStaffId) ||
    (m.receiver_id === currentUser?.id && m.sender_id === selectedStaffId)
  ).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedStaffId) return;
    await sendMessage(selectedStaffId, content.trim());
    setContent("");
  };

  React.useEffect(() => {
    conversation.forEach((m: any) => {
      if (m.receiver_id === currentUser?.id && !m.read_at) {
        markAsRead(m.id);
      }
    });
  }, [conversation, currentUser, markAsRead]);

  return (
    <div className="flex flex-col h-[600px] border border-white/10 rounded-3xl overflow-hidden bg-black/40">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1">Select Staff Member</label>
        <select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className="w-full mt-2 bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FFB800]/50 transition-colors uppercase tracking-widest text-xs font-bold"
        >
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-[10px] uppercase font-black tracking-widest text-center">No messages yet.<br />Start the transmission.</p>
          </div>
        ) : (
          conversation.map((msg: any) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${isMe ? 'bg-[#FFB800] text-black rounded-br-none' : 'bg-white/10 text-white rounded-bl-none border border-white/10'}`}>
                  <p className={`text-sm font-bold ${isMe ? '' : 'text-white'}`}>{msg.content}</p>
                  <p className={`text-[8px] uppercase tracking-widest mt-2 font-black opacity-60 ${isMe ? 'text-black' : 'text-white/50'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.read_at && ' • READ'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter message..."
          className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/50 transition-colors"
        />
        <button type="submit" disabled={!content.trim()} className="w-12 h-12 bg-[#FFB800] text-black rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-white active:scale-95">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
