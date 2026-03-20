import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Calendar as CalendarIcon, MapPin, Users, Ticket, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '../../context/BrandingContext';
import { downloadIcsFile } from '../../utils/CalendarSyncApi';

export default function EventsOffersView() {
  const { events, eventRegistrations, registerForEvent, cancelEventRegistration, currentUser } = useData();
  const { config } = useBranding();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const activeEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');

  const getRegistration = (eventId: string) => {
    return eventRegistrations.find(r => r.event_id === eventId && r.member_id === currentUser?.id);
  };

  const handleRegister = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (registrationId: string) => {
    if (confirm('Are you sure you want to cancel your registration?')) {
      try {
        await cancelEventRegistration(registrationId);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-6">
        <h3 className="text-xl font-heading text-white uppercase italic tracking-wider">
          Workshops & Events
        </h3>
        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">
          Join exclusive training and community events
        </p>
      </div>

      <div className="grid gap-4">
        {activeEvents.map((event) => {
          const registration = getRegistration(event.id);
          const isRegistered = !!registration;
          const isFull = event.max_participants > 0 && eventRegistrations.filter(r => r.event_id === event.id).length >= event.max_participants;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden"
            >
              <div
                className="h-32 bg-white/5 relative"
                style={{
                  backgroundImage: event.image_url ? `url(${event.image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!event.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <CalendarIcon size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">
                        {event.event_type}
                      </div>
                      <h4 className="text-lg font-bold text-white leading-tight">
                        {event.title}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
                    <CalendarIcon size={14} className="text-gold" />
                    <span>
                      {new Date(event.start_time).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
                      <MapPin size={14} className="text-gold" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.max_participants > 0 && (
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
                      <Users size={14} className="text-gold" />
                      <span>{eventRegistrations.filter(r => r.event_id === event.id).length} / {event.max_participants} joined</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-white/40 leading-relaxed font-bold">
                  {event.description}
                </p>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-sm font-black text-white">
                    {event.price > 0 ? `${event.price} EGP` : 'FREE'}
                  </div>

                  {isRegistered ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gold font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={12} /> Registered
                      </span>
                      <button
                        onClick={() => {
                          downloadIcsFile({
                            id: event.id,
                            title: event.title,
                            description: event.description || '',
                            location: event.location || config.name,
                            startTime: new Date(event.start_time),
                            endTime: new Date(event.end_time)
                          }, `event-${event.id}`, config.name, config.contact.email.split('@')[1]);
                        }}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        title="Add to Calendar"
                      >
                        <CalendarIcon size={14} />
                      </button>
                      <button
                        onClick={() => handleCancel(registration.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={isFull}
                      className={`px-6 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2
                        ${isFull
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-gold text-black hover:bg-white'
                        }
                      `}
                    >
                      <Ticket size={14} />
                      {isFull ? 'Sold Out' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {activeEvents.length === 0 && (
          <div className="py-20 text-center border whitespace-nowrap border-white/5 border-dashed rounded-[2rem] text-white/30">
            <p className="text-sm font-bold uppercase tracking-widest">No Upcoming Events</p>
          </div>
        )}
      </div>
    </div>
  );
}
