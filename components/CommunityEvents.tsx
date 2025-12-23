
import React from 'react';
import { Event } from '../types';
import { Calendar, MapPin, Users, HeartHandshake } from 'lucide-react';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Ramadan Prep: Fiqh of Fasting',
    date: 'Saturday, Mar 02 • 6:00 PM',
    location: 'Central Mosque Hall',
    attendees: 142,
    category: 'Lecture',
    imageUrl: 'https://picsum.photos/800/400'
  },
  {
    id: '2',
    title: 'Community Iftar & Fundraiser',
    date: 'Friday, Mar 15 • 5:45 PM',
    location: 'Community Center Gardens',
    attendees: 350,
    category: 'Charity',
    imageUrl: 'https://picsum.photos/800/401'
  },
  {
    id: '3',
    title: 'Youth Sisters Coffee Meetup',
    date: 'Sunday, Mar 17 • 11:00 AM',
    location: 'Olive Tree Cafe',
    attendees: 15,
    category: 'Community',
    imageUrl: 'https://picsum.photos/800/402'
  }
];

export const CommunityEvents: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Community Gatherings</h2>
        <p className="text-slate-600 dark:text-slate-400">Connect, learn, and grow with your local Ummah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                {event.category}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {event.title}
              </h3>

              <div className="space-y-3 mt-2 flex-1">
                <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                  {event.date}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                  {event.location}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                  <Users className="w-4 h-4 mr-2 text-emerald-500" />
                  {event.attendees} attending
                </div>
              </div>

              <button className="w-full mt-6 py-2 rounded-lg border border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-600 hover:text-white dark:hover:text-slate-900 transition-colors">
                RSVP Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-200 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-800 dark:text-emerald-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-white">Host an Event?</h3>
            <p className="text-emerald-700 dark:text-emerald-400/80 text-sm">Organize a halaqah or charity drive.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
          Create Event
        </button>
      </div>
    </div>
  );
};
