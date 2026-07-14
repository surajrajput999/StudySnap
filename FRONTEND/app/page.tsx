'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import HomeScreen from '@/components/HomeScreen';
import NoteEditor from '@/components/NoteEditor';
import VoiceNotes from '@/components/VoiceNotes';
import AiHelper from '@/components/AiHelper';
import RevisionCalendar from '@/components/RevisionCalendar';
import ProfileView from '@/components/ProfileView';
import { 
  Home, FileText, Mic, Calendar, Sparkles, User, Sun, Moon, 
  LogIn, Wifi, WifiOff, ChevronRight
} from 'lucide-react';
import { SignInButton, UserButton, useAuth, useUser } from '@clerk/nextjs';

export default function Page() {
  const { theme, toggleTheme, isOffline, activeNoteId, setActiveNoteId, updateProfile } = useStore();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isSignedIn && clerkUser?.fullName) {
      updateProfile({ name: clerkUser.fullName });
    }
  }, [isSignedIn, clerkUser]);

  const handleEditNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveTab('editor');
  };

  const handleCreateNote = () => {
    setActiveNoteId(null);
    setActiveTab('editor');
  };

  const handleLinkToNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveTab('editor');
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'editor', label: 'Note Editor', icon: FileText },
    { id: 'voice', label: 'Voice Notes', icon: Mic },
    { id: 'calendar', label: 'Revision', icon: Calendar },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (!mounted) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      backgroundColor: 'var(--background)', color: 'var(--on-background)'
    }}>
      
      {/* ─── Premium Header ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '10px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div 
            onClick={() => setActiveTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <img src="/window.svg" alt="StudySnap" style={{ width: '34px', height: '34px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,97,164,0.25)' }} />
            <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-title)', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StudySnap
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isOffline ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--error)', padding: '4px 12px', borderRadius: '100px', background: 'var(--error-container)' }}>
                <WifiOff size={13} /> Offline
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#10B981', padding: '4px 12px', borderRadius: '100px', background: 'rgba(16,185,129,0.1)' }}>
                <Wifi size={13} /> Online
              </span>
            )}

            <button onClick={toggleTheme} className="md3-btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
                <button className="md3-btn md3-btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  <LogIn size={14} /> Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Layout ─── */}
      <div style={{
        display: 'flex', flexGrow: 1, width: '100%',
        maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px'
      }}>
        
        {/* ─── Desktop Sidebar ─── */}
        <aside className="desktop-nav" style={{
          width: '220px', position: 'sticky', top: '64px', height: 'calc(100vh - 72px)',
          padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px',
          flexShrink: 0, overflowY: 'auto'
        }}>
          <div style={{ padding: '4px 14px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)' }}>
            Navigation
          </div>
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                  borderRadius: 'var(--card-radius-md)', border: 'none', width: '100%',
                  textAlign: 'left', fontSize: '14px', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', letterSpacing: '-0.01em',
                  background: isActive ? 'linear-gradient(135deg, var(--primary-container), transparent)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span style={{ flexGrow: 1 }}>{tab.label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </button>
            );
          })}
        </aside>

        {/* ─── Main Content ─── */}
        <main style={{
          flexGrow: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column',
          width: '100%', overflowY: 'auto', minHeight: 'calc(100vh - 64px)',
        }}>
          <div className="stagger" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'home' && (
              <HomeScreen 
                onEditNote={handleEditNote} 
                onCreateNote={handleCreateNote} 
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'editor' && (
              <NoteEditor 
                noteId={activeNoteId} 
                onBack={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'voice' && (
              <VoiceNotes 
                onBack={() => setActiveTab('home')}
                onLinkToNote={handleLinkToNote}
              />
            )}
            {activeTab === 'calendar' && <RevisionCalendar />}
            {activeTab === 'ai' && <AiHelper />}
            {activeTab === 'profile' && <ProfileView />}
          </div>
        </main>

      </div>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 4px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))'
      }}>
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                minWidth: '48px', borderRadius: 'var(--card-radius-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                padding: '6px 14px', borderRadius: '12px',
                background: isActive ? 'var(--primary-container)' : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} color={isActive ? 'var(--primary)' : 'var(--outline)'} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary)' : 'var(--outline)', letterSpacing: '-0.01em' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ─── Responsive CSS ─── */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          main { padding: 16px !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>

    </div>
  );
}
