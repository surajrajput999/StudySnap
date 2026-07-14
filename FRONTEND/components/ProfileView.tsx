'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { User, School, BookOpen, GraduationCap, MapPin, Award, CheckCircle, FileText, Music, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';

const StudyMap = dynamic(() => import('./StudyMap'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: '240px', borderRadius: '16px' }} />
});

export default function ProfileView() {
  const { user, notes, voiceNotes, updateProfile } = useStore();

  const [name, setName] = useState(user.name);
  const [college, setCollege] = useState(user.college);
  const [field, setField] = useState(user.field);
  const [semester, setSemester] = useState(user.semester);
  const [studyGoals, setStudyGoals] = useState(user.studyGoals);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, college, field, semester, studyGoals });
    setIsEditing(false);
    confetti({ particleCount: 50, colors: ['#0061A4', '#10B981'] });
  };

  const totalNotes = notes.length;
  const totalVoiceNotes = voiceNotes.length;
  const totalRevisedNotes = notes.filter(n => n.revisionStreak > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="premium-card">
        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} /> Edit Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600 }}>Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="md3-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600 }}>School / College (optional)</label>
              <input type="text" placeholder="e.g. Delhi University" value={college} onChange={(e) => setCollege(e.target.value)} className="md3-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600 }}>Field of Study</label>
              <input type="text" placeholder="e.g. Science, Commerce, Engineering" value={field} onChange={(e) => setField(e.target.value)} className="md3-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600 }}>Class / Semester (optional)</label>
              <input type="text" placeholder="e.g. Class 10, Semester 2" value={semester} onChange={(e) => setSemester(e.target.value)} className="md3-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600 }}>Study Goals</label>
              <textarea value={studyGoals} onChange={(e) => setStudyGoals(e.target.value)} required rows={3} className="md3-input" style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="md3-btn md3-btn-text">Cancel</button>
              <button type="submit" className="md3-btn md3-btn-primary">Save</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} style={{ color: 'var(--primary)' }} />
                Student Profile
              </h3>
              <button onClick={() => setIsEditing(true)} className="md3-btn md3-btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                Edit
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-title)' }}>{user.name}</div>
              {user.college && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--on-surface-variant)' }}><School size={14} /> {user.college}</div>}
              {user.field && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--on-surface-variant)' }}><BookOpen size={14} /> {user.field}</div>}
              {user.semester && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--on-surface-variant)' }}><GraduationCap size={14} /> {user.semester}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                <Award size={14} /> {user.studyGoals}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="md3-card-sm" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <FileText size={20} style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalNotes}</span>
          <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>Notes</span>
        </div>
        <div className="md3-card-sm" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <Music size={20} style={{ color: 'var(--tertiary)', margin: '0 auto' }} />
          <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalVoiceNotes}</span>
          <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>Voice</span>
        </div>
        <div className="md3-card-sm" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <CheckCircle size={20} style={{ color: '#10B981', margin: '0 auto' }} />
          <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalRevisedNotes}</span>
          <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>Revised</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} style={{ color: 'var(--primary)' }} />
          Study Zones Nearby
        </h4>
        <StudyMap />
      </div>

    </div>
  );
}
