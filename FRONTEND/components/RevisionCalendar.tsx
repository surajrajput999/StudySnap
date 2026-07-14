'use client';

import React, { useState } from 'react';
import { useStore, Note, RevisionLog } from '@/lib/store/useStore';
import { Calendar, CheckCircle, Clock, CalendarDays, Star, Pin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RevisionCalendar() {
  const { notes, revisionLogs, markAsRevised } = useStore();
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>('daily');

  const revisionNotes = notes
    .filter(n => n.nextRevisionAt)
    .sort((a, b) => new Date(a.nextRevisionAt!).getTime() - new Date(b.nextRevisionAt!).getTime());

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dueNotes = revisionNotes.filter(n => new Date(n.nextRevisionAt!) <= today);
  const upcomingNotes = revisionNotes.filter(n => new Date(n.nextRevisionAt!) > today);

  const handleRevise = (noteId: string, rating: 'easy' | 'medium' | 'hard') => {
    markAsRevised(noteId, rating);
    confetti({ particleCount: 50, spread: 60, colors: rating === 'easy' ? ['#10B981'] : rating === 'medium' ? ['#3B82F6'] : ['#F59E0B'] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--primary)' }} />
          Revision Scheduler
        </h3>
        <div style={{ display: 'flex', borderRadius: '100px', background: 'var(--surface-variant)', overflow: 'hidden' }}>
          {['daily', 'weekly'].map((freq) => (
            <button key={freq} onClick={() => setReminderFrequency(freq as any)}
              style={{ border: 'none', padding: '6px 18px', fontSize: '11px', cursor: 'pointer', fontWeight: 600, background: reminderFrequency === freq ? 'var(--primary)' : 'transparent', color: reminderFrequency === freq ? '#fff' : 'var(--on-surface-variant)', transition: 'all 0.15s' }}>
              {freq}
            </button>
          ))}
        </div>
      </div>

      <div className="md3-card-sm" style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--on-surface-variant)', padding: '14px 18px' }}>
        <strong>Spaced Repetition:</strong> Revise at increasing intervals. Easy → 7 days, Medium → 3 days, Hard → 1 day.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)' }}>
          <Clock size={16} /> Due ({dueNotes.length})
        </h4>
        {dueNotes.length === 0 ? (
          <div className="md3-card-sm" style={{ textAlign: 'center', padding: '24px', color: 'var(--outline)' }}>
            <CheckCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            All caught up!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dueNotes.map((note) => (
              <div key={note.id} className="md3-card-sm" style={{ borderLeft: '4px solid var(--error)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600 }}>{note.title}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                      Last: {note.lastRevisedAt ? new Date(note.lastRevisedAt).toLocaleDateString('en-IN') : 'Never'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {note.isPinned && <Pin size={12} style={{ color: 'var(--primary)' }} />}
                    {note.isFavorite && <Star size={12} style={{ color: '#F59E0B' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid var(--outline-variant)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Recall:</span>
                  {(['hard', 'medium', 'easy'] as const).map((r) => (
                    <button key={r} onClick={() => handleRevise(note.id, r)}
                      className="md3-btn" style={{ fontSize: '10px', padding: '4px 12px', background: r === 'hard' ? '#EF444418' : r === 'medium' ? '#3B82F618' : '#10B98118', color: r === 'hard' ? '#EF4444' : r === 'medium' ? '#3B82F6' : '#10B981', boxShadow: 'none' }}>
                      {r} {r === 'hard' ? '(1d)' : r === 'medium' ? '(3d)' : '(7d)'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarDays size={16} style={{ color: 'var(--primary)' }} />
          Upcoming ({upcomingNotes.length})
        </h4>
        {upcomingNotes.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--outline)', fontStyle: 'italic' }}>No upcoming schedules.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {upcomingNotes.map((note) => (
              <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{note.title}</span>
                <span className="md3-chip" style={{ fontSize: '11px', padding: '2px 10px', background: 'var(--primary-container)', color: 'var(--primary)' }}>
                  {new Date(note.nextRevisionAt!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} style={{ color: '#10B981' }} />
          History ({revisionLogs.length})
        </h4>
        {revisionLogs.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--outline)', fontStyle: 'italic' }}>No revision history yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
            {revisionLogs.map((log) => {
              const matchingNote = notes.find(n => n.id === log.noteId);
              return (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderRadius: '8px', background: 'var(--surface-variant)', fontSize: '12px' }}>
                  <span style={{ fontWeight: 500 }}>{matchingNote ? matchingNote.title : 'Deleted'}</span>
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontWeight: 600, color: log.rating === 'easy' ? '#10B981' : log.rating === 'medium' ? 'var(--primary)' : 'var(--error)' }}>
                      {log.rating.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--outline)' }}>{new Date(log.revisedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
