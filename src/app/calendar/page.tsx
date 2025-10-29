"use client";

import { useState, useEffect } from 'react';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { ModalLoader } from '@/components/LoadingComponents';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    downloadICalendar,
  } = useCalendarEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fds, setFds] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [eventForm, setEventForm] = useState<CalendarEvent>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    priority: 'medium',
    category: 'general',
    reminderEnabled: true,
    reminderTime: 15,
  });

  useEffect(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    fetchEvents(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
    fetchAccountsAndFDs();
  }, [currentDate, fetchEvents]);

  const fetchAccountsAndFDs = async () => {
    try {
      const [accountsRes, fdsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds')
      ]);
      
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }
      
      if (fdsRes.ok) {
        const fdsData = await fdsRes.json();
        setFds(Array.isArray(fdsData) ? fdsData : []);
      }
    } catch (error) {
      console.error('Error fetching accounts/FDs:', error);
    }
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
      });
    }
    
    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === dateStr;
    });
  };

  const handleCreateEvent = async () => {
    setFormLoading(true);
    try {
      await createEvent(eventForm);
      resetForm();
      setShowEventForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent?.id) return;
    setFormLoading(true);
    try {
      await updateEvent(editingEvent.id, eventForm);
      resetForm();
      setEditingEvent(null);
      setShowEventForm(false);
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setFormLoading(true);
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: selectedDate || new Date(),
      endDate: selectedDate || new Date(),
      allDay: false,
      priority: 'medium',
      category: 'general',
      reminderEnabled: true,
      reminderTime: 15,
    });
  };

  const openEventForm = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
      setEventForm(prev => ({
        ...prev,
        startDate: date,
        endDate: date,
      }));
    }
    setShowEventForm(true);
  };

  const editEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay || false,
      priority: event.priority || 'medium',
      category: event.category || 'general',
      accountId: event.accountId,
      fdId: event.fdId,
      mutualFundId: event.mutualFundId,
      goldId: event.goldId,
      reminderEnabled: event.reminderEnabled !== false,
      reminderTime: event.reminderTime || 15,
    });
    setShowEventForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600';
      case 'low': return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Calendar
            </h1>
            <p className="text-gray-600 mt-2">Manage your financial events and deadlines</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openEventForm()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-lg">➕</span>
              Add Event
            </button>
            <button
              onClick={() => downloadICalendar(events)}
              disabled={events.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-lg">📅</span>
              Export Calendar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-lg mb-6 shadow-md">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        {/* Calendar Header */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 transform hover:scale-110 text-gray-600 hover:text-gray-800"
            >
              <span className="text-xl">←</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 transform hover:scale-110 text-gray-600 hover:text-gray-800"
            >
              <span className="text-xl">→</span>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r last:border-r-0 bg-gradient-to-b from-gray-50 to-gray-100">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {getDaysInMonth().map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`min-h-[140px] border-r border-b last:border-r-0 p-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-inner ${
                    !day.isCurrentMonth 
                      ? 'bg-gray-50 text-gray-400' 
                      : isToday 
                        ? 'bg-blue-100 border-blue-200' 
                        : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => openEventForm(day.date)}
                >
                  <div className={`font-semibold mb-2 ${
                    isToday 
                      ? 'text-blue-600 bg-blue-200 rounded-full w-8 h-8 flex items-center justify-center text-sm' 
                      : 'text-gray-700'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-2 rounded-md text-white truncate transition-all duration-200 hover:shadow-md cursor-pointer ${getPriorityColor(event.priority || 'medium')}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          editEvent(event);
                        }}
                        title={event.title}
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-xs opacity-90 mt-1">{event.description.slice(0, 20)}...</div>
                        )}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-gray-500 font-medium bg-gray-100 rounded p-1 text-center">
                        +{day.events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/40 to-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl transform animate-scaleIn border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingEvent ? '✏️ Edit Event' : '➕ Create New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter event title"
                  />
                </div>
              
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="general">📝 General</option>
                    <option value="account">🏦 Account</option>
                    <option value="fd">💰 Fixed Deposit</option>
                    <option value="mutual_fund">📈 Mutual Fund</option>
                    <option value="gold">🥇 Gold</option>
                  </select>
                </div>
              
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventForm.startDate.toISOString().slice(0, 16)}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDate.toISOString().slice(0, 16)}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={eventForm.priority}
                    onChange={(e) => setEventForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={eventForm.allDay}
                      onChange={(e) => setEventForm(prev => ({ ...prev, allDay: e.target.checked }))}
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">🕐 All Day Event</span>
                  </label>
                </div>
            </div>
            
              {/* Account/FD Selection for specific categories */}
              {eventForm.category === 'account' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block font-semibold text-gray-700 mb-3">🏦 Select Account</label>
                  <select
                    value={eventForm.accountId || ''}
                    onChange={(e) => setEventForm(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Choose an account...</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} (₹{account.balance?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {eventForm.category === 'fd' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <label className="block font-semibold text-gray-700 mb-3">💰 Select Fixed Deposit</label>
                  <select
                    value={eventForm.fdId || ''}
                    onChange={(e) => setEventForm(prev => ({ ...prev, fdId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Choose an FD...</option>
                    {fds.map((fd) => (
                      <option key={fd.id} value={fd.id}>
                        ₹{fd.amount?.toLocaleString()} @ {fd.rate}% - {fd.account?.name || 'Account'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            
              <div className="mt-6">
                <label className="block font-semibold text-gray-700 mb-3">📝 Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Add event description or notes..."
                />
              </div>
              
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  disabled={!eventForm.title || formLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 disabled:transform-none"
                >
                  {formLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingEvent ? '✅ Update Event' : '➕ Create Event'}
                </button>
                
                {editingEvent && (
                  <button
                    onClick={() => handleDeleteEvent(editingEvent.id!)}
                    disabled={formLoading}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 disabled:transform-none"
                  >
                    {formLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    🗑️ Delete Event
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  disabled={formLoading}
                  className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold disabled:transform-none"
                >
                  ❌ Cancel
                </button>
            </div>
          </div>
        </div>
      )}

        {loading && (
          <div className="fixed inset-0 bg-gradient-to-br from-white/60 via-blue-50/80 to-white/60 backdrop-blur-md flex items-center justify-center z-40 animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading calendar events...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}