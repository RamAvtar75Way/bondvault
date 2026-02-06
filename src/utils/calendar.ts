import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export const createCalendarEvent = async (
    title: string,
    startDate: Date,
    notes?: string
): Promise<string | null> => {
    try {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Calendar permission is required to save reminders to your calendar.');
            return null;
        }

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

        let defaultCalendarId: string | null = null;

        if (Platform.OS === 'ios') {
            const defaultCalendar = await Calendar.getDefaultCalendarAsync();
            defaultCalendarId = defaultCalendar.id;
        } else {
            // Android: find a writable calendar
            const writableCalendar = calendars.find(c => c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR);
            defaultCalendarId = writableCalendar ? writableCalendar.id : null;
        }

        if (!defaultCalendarId) {
            // Fallback or create? For now just alert
            Alert.alert('Error', 'No writable calendar found.');
            return null;
        }

        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        const eventId = await Calendar.createEventAsync(defaultCalendarId, {
            title,
            startDate,
            endDate,
            notes,
            timeZone: 'GMT',
        });

        return eventId;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return null;
    }
};
