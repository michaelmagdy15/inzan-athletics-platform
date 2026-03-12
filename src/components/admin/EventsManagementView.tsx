import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Plus, Trash2, Calendar as CalendarIcon, MapPin, Users, Ticket, X } from "lucide-react";

export default function EventsManagementView() {
  const { events, eventRegistrations, createEvent, deleteEvent } = useData();
  const [isAddingMode, setIsAddingMode] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"workshop" | "seminar" | "competition" | "social">("workshop");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    
    await createEvent({
      title,
      description,
      event_type: eventType,
      start_time: startTime,
      end_time: endTime,
      location,
      max_participants: maxParticipants ? parseInt(maxParticipants) : 0,
      price: price ? parseFloat(price) : 0,
      image_url: imageUrl,
      status: "upcoming"
    });

    setIsAddingMode(false);
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setMaxParticipants("");
    setPrice("");
    setImageUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading text-white uppercase tracking-wider">Events & Workshops</h2>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mt-1">Manage scheduled facility events</p>
        </div>
        <button
          onClick={() => setIsAddingMode(true)}
          className="bg-gold text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus size={16} /> Create Event
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
          <h3 className="text-lg font-heading text-white uppercase tracking-wider mb-6">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Event Title</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Summer Lift-Off"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Type</label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors uppercase tracking-widest font-bold"
                >
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="social">Social Event</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details about the event..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors color-scheme-dark"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors color-scheme-dark"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(e.target.value)}
                  placeholder="0 = unlimited"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Price (EGP)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0 = free"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Location</label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Main Floor"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black pl-1">Cover Image URL</label>
                <input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-gold text-black px-8 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-colors"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event) => {
          const registeredUsers = eventRegistrations.filter(r => r.event_id === event.id);
          
          return (
            <div key={event.id} className="glass-card rounded-[2rem] border border-white/5 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-64 h-48 md:h-auto bg-black/40 relative shrink-0">
                {event.image_url ? (
                  <img src={event.image_url} alt="" className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <CalendarIcon size={40} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase text-black
                    ${event.status === 'upcoming' ? 'bg-gold' : 
                      event.status === 'ongoing' ? 'bg-blue-400' :
                      event.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                    }
                  `}>
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">{event.event_type}</div>
                      <h4 className="text-xl font-bold text-white leading-tight">{event.title}</h4>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this event?')) deleteEvent(event.id);
                      }}
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-white/40 mb-4 line-clamp-2 md:pr-12">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-white/30" />
                    <span className="text-xs text-white/60 font-bold uppercase tracking-wider">
                      {new Date(event.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-white/30" />
                    <span className="text-xs text-white/60 font-bold uppercase tracking-wider truncate">
                      {event.location || 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-white/30" />
                    <span className="text-xs text-white/60 font-bold uppercase tracking-wider">
                      {event.price > 0 ? `${event.price} EGP` : 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gold" />
                    <span className="text-xs text-white font-black uppercase tracking-wider">
                      {registeredUsers.length} / {event.max_participants > 0 ? event.max_participants : 'unlimited'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="py-20 text-center border whitespace-nowrap border-white/5 border-dashed rounded-[2rem] text-white/30">
            <p className="text-sm font-bold uppercase tracking-widest">No Events Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
