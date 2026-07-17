'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import HomeScreen from '@/components/HomeScreen';
import NoteEditor from '@/components/NoteEditor';
import VoiceNotes from '@/components/VoiceNotes';
import AiTutor from '@/components/AiTutor';
import RevisionCalendar from '@/components/RevisionCalendar';
import ProfileView from '@/components/ProfileView';
import GamificationHub from '@/components/GamificationHub';
import MobileDrawer from '@/components/MobileDrawer';
import { 
  Home, FileText, Mic, Calendar, Sparkles, User, Sun, Moon, 
  LogIn, Wifi, WifiOff, ChevronRight, Trophy, Menu
} from 'lucide-react';
import { SignInButton, UserButton, useAuth, useUser } from '@clerk/nextjs';

export default function Page() {
  const { theme, toggleTheme, isOffline, activeNoteId, setActiveNoteId, updateProfile } = useStore();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isSignedIn && clerkUser?.fullName) {
      updateProfile({ name: clerkUser.fullName });
    } else if (!isSignedIn) {
      updateProfile({ name: 'Student' });
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

  const handleDrawerNav = (tab: string) => {
    const routing: Record<string, string> = {
      folders: 'home',
      favorites: 'home',
      statistics: 'profile',
      settings: 'profile',
      about: 'profile',
    };
    setActiveTab(routing[tab] || tab);
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'editor', label: 'Note Editor', icon: FileText },
    { id: 'voice', label: 'Voice Notes', icon: Mic },
    { id: 'calendar', label: 'Revision', icon: Calendar },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'gamification', label: 'Achievements', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (!mounted) return null;

  return (
    <div className="app-root">
      {/* ─── Mobile Drawer ─── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onNavigate={handleDrawerNav}
      />

      {/* ─── Desktop Sidebar ─── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand" onClick={() => setActiveTab('home')}>
          <img src="/window.svg" alt="StudySnap" className="sidebar-logo" />
          <span className="sidebar-name">StudySnap</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{tab.label}</span>
                {isActive && <ChevronRight size={14} className="sidebar-chevron" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-version">StudySnap v0.1</span>
        </div>
      </aside>

      {/* ─── Tablet Mini Sidebar ─── */}
      <aside className="app-rail">
        {navItems.slice(0, 6).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`rail-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            </button>
          );
        })}
      </aside>

      {/* ─── Header ─── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <button className="header-hamburger" onClick={() => setDrawerOpen(true)}>
              <Menu size={22} />
            </button>
            <span className="header-title" onClick={() => setActiveTab('home')}>
              <img src="/window.svg" alt="StudySnap" className="header-mobile-logo" />
              <span className="header-brand-text">StudySnap</span>
              <span className="header-tab-name">{navItems.find(t => t.id === activeTab)?.label}</span>
            </span>
          </div>
          <div className="header-right">
            <button onClick={toggleTheme} className="header-icon-btn">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
                <button className="header-signin">
                  <LogIn size={14} /> <span>Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="app-main">
        <div className="main-content">
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
          {activeTab === 'ai' && <AiTutor onBack={() => setActiveTab('home')} />}
          {activeTab === 'gamification' && <GamificationHub />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="app-bottom-nav">
        {navItems.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`bottom-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="bottom-nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
        <button
          className={`bottom-nav-link ${activeTab === 'gamification' || activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'gamification' || activeTab === 'profile' ? activeTab : 'profile')}
        >
          <div className="bottom-nav-icon-wrap">
            <User size={20} />
          </div>
          <span className="bottom-nav-label">More</span>
        </button>
      </nav>
    </div>
  );
}
