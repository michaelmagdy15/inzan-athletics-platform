import { branding } from "../branding";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

export const generateIcsContent = (
  event: CalendarEvent,
  brandName: string = branding.name,
  domain: string = branding.contact.email.split('@')[1] || 'inzanathletics.com'
): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${brandName}//Booking System//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `UID:${event.id}@${domain}`,
    `CREATED:${formatDate(new Date())}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LAST-MODIFIED:${formatDate(new Date())}`,
    `LOCATION:${event.location}`,
    `SEQUENCE:0`,
    'STATUS:CONFIRMED',
    `SUMMARY:${event.title}`,
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\\r\\n');
};

export const downloadIcsFile = (
  event: CalendarEvent,
  filename: string,
  brandName?: string,
  domain?: string
) => {
  const icsContent = generateIcsContent(event, brandName, domain);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
