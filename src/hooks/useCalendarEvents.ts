import { useCallback, useState } from 'react';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: 'account' | 'fd' | 'mutual_fund' | 'gold' | 'general';
  status?: 'pending' | 'completed' | 'cancelled';
  accountId?: string;
  fdId?: string;
  mutualFundId?: string;
  goldId?: string;
  reminderEnabled?: boolean;
  reminderTime?: number;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (
    startDate?: string,
    endDate?: string,
    category?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (category) params.append('category', category);

      const res = await fetch(`/api/calendar-events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: CalendarEvent) => {
    setError(null);
    try {
      const res = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const newEvent = await res.json();
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      throw e;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, eventData: Partial<CalendarEvent>) => {
    setError(null);
    try {
      const res = await fetch(`/api/calendar-events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) throw new Error('Failed to update event');
      const updatedEvent = await res.json();
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      throw e;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/calendar-events/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      throw e;
    }
  }, []);

  const generateICalendar = useCallback((events: CalendarEvent[]) => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fire Tracker//Calendar Events//EN',
      'CALSCALE:GREGORIAN',
    ];

    events.forEach((event, index) => {
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id || Date.now()}-${index}@firetracker.com`,
        `DTSTART:${formatDate(event.startDate)}`,
        `DTEND:${formatDate(event.endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `PRIORITY:${event.priority === 'high' ? '1' : event.priority === 'medium' ? '5' : '9'}`,
        `STATUS:${event.status?.toUpperCase() || 'CONFIRMED'}`,
        `CREATED:${formatDate(new Date())}`,
        'END:VEVENT'
      );
    });

    icalContent.push('END:VCALENDAR');
    return icalContent.join('\r\n');
  }, []);

  const downloadICalendar = useCallback((events: CalendarEvent[], filename = 'calendar-events.ics') => {
    const icalContent = generateICalendar(events);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generateICalendar]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    downloadICalendar,
  };
}