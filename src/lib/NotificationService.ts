import { supabase } from './supabase';

export type NotificationType = 'booking' | 'cancellation' | 'reschedule' | 'reminder' | 'capacity' | 'no_show' | 'info';

interface CreateNotification {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    related_session_id?: string;
}

async function createNotification(data: CreateNotification) {
    const { error } = await supabase.from('notifications').insert(data);
    if (error) console.error('Notification error:', error);
}

export async function notifyBookingConfirmation(
    memberId: string, coachId: string, sessionId: string,
    coachName: string, memberName: string, date: string, time: string
) {
    await Promise.all([
        createNotification({
            user_id: memberId,
            title: 'Session Booked',
            message: `Your session with ${coachName} on ${date} at ${time} is confirmed.`,
            type: 'booking',
            related_session_id: sessionId,
        }),
        createNotification({
            user_id: coachId,
            title: 'New Booking',
            message: `${memberName} booked a session on ${date} at ${time}.`,
            type: 'booking',
            related_session_id: sessionId,
        }),
    ]);
}

export async function notifyCancellation(
    memberId: string, coachId: string, sessionId: string,
    coachName: string, memberName: string, date: string, time: string, cancelledBy: string
) {
    await Promise.all([
        createNotification({
            user_id: memberId,
            title: 'Session Cancelled',
            message: `Your session with ${coachName} on ${date} at ${time} has been cancelled by ${cancelledBy}.`,
            type: 'cancellation',
            related_session_id: sessionId,
        }),
        createNotification({
            user_id: coachId,
            title: 'Session Cancelled',
            message: `${memberName}'s session on ${date} at ${time} has been cancelled by ${cancelledBy}.`,
            type: 'cancellation',
            related_session_id: sessionId,
        }),
    ]);
}

export async function notifyReschedule(
    memberId: string, coachId: string, sessionId: string,
    coachName: string, memberName: string, oldDate: string, newDate: string, newTime: string
) {
    await Promise.all([
        createNotification({
            user_id: memberId,
            title: 'Session Rescheduled',
            message: `Your session with ${coachName} has been moved from ${oldDate} to ${newDate} at ${newTime}.`,
            type: 'reschedule',
            related_session_id: sessionId,
        }),
        createNotification({
            user_id: coachId,
            title: 'Session Rescheduled',
            message: `${memberName}'s session has been moved from ${oldDate} to ${newDate} at ${newTime}.`,
            type: 'reschedule',
            related_session_id: sessionId,
        }),
    ]);
}

export async function notifySessionReminder(
    memberId: string, sessionId: string,
    coachName: string, date: string, time: string
) {
    await createNotification({
        user_id: memberId,
        title: 'Session Reminder',
        message: `Reminder: You have a session with ${coachName} on ${date} at ${time}.`,
        type: 'reminder',
        related_session_id: sessionId,
    });
}

export async function notifyCapacityUpdate(
    coachId: string, date: string, time: string, booked: number, total: number
) {
    await createNotification({
        user_id: coachId,
        title: 'Slot Update',
        message: `${booked}/${total} slots booked at ${time} on ${date}.${booked >= total ? ' FULLY BOOKED.' : ''}`,
        type: 'capacity',
    });
}

export async function notifyNoShow(
    memberId: string, coachId: string, sessionId: string,
    memberName: string, date: string
) {
    await createNotification({
        user_id: coachId,
        title: 'No-Show Recorded',
        message: `${memberName} was marked as no-show for the session on ${date}. 1 session deducted.`,
        type: 'no_show',
        related_session_id: sessionId,
    });
}

export async function notifyFrontDesk(adminIds: string[], message: string, type: NotificationType = 'info') {
    await Promise.all(
        adminIds.map(id => createNotification({ user_id: id, title: 'Front Desk Alert', message, type }))
    );
}
