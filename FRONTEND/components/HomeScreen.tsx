'use client';

import React, { useState } from 'react';
import { useStore, Note, Folder, Category } from '@/lib/store/useStore';
import { 
  Search, Flame, FolderPlus, Plus, Pin, Star, Lock, 
  Trash2, BookOpen, AlertCircle, Calendar, FileText, CheckCircle,
  Grid3X3, List, Clock, TrendingUp, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeScreenProps {
  onEditNote: (noteId: string) => void;
  onCreateNote: () => void;
  onNavigate: (tab: string) => void;
}

export default function HomeScreen({ onEditNote, onCreateNote, onNavigate }: HomeScreenProps) {
  const { 
    user, notes, categories, folders, activeFolderId, activeCategoryId, searchQuery,
    addFolder, addCategory, deleteFolder, deleteCategory, setActiveFolderId, setActiveCategoryId,
    setSearchQuery, togglePinNote, toggleFavoriteNote, deleteNote, markAsRevised, incrementStreak
  } = useStore();

  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#0061A4');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [unlockNoteId, setUnlockNoteId] = useState<string | null>(null);
  const [pinError, setPinError] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = activeFolderId ? note.folderId === activeFolderId : true;
    const matchesCategory = activeCategoryId ? note.categoryId === activeCategoryId : true;
    return matchesSearch && matchesFolder && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);
  const displayNotes = [...pinnedNotes, ...unpinnedNotes];

  const dueRevisionNotes = notes.filter((note) => {
    if (!note.nextRevisionAt) return false;
    return new Date(note.nextRevisionAt) <= new Date();
  });

  const totalNotes = notes.length;
  const totalRevised = notes.filter(n => n.revisionStreak > 0).length;
  const totalPinned = notes.filter(n => n.isPinned).length;
  const totalFavorites = notes.filter(n => n.isFavorite).length;

  const handleStreakClick = () => {
    incrementStreak();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* ─── Hero Section ─── */}
      <div className="premium-card animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em' }}>Hello, {user.name}! 👋</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px', marginTop: '4px' }}>
              {user.studyGoals}
            </p>
          </div>
          <button onClick={handleStreakClick} className="md3-card-sm" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
            <Flame size={22} color="#F59E0B" fill="#F59E0B" />
            <span style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-title)' }}>{user.streakCount}</span>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>day streak</span>
          </button>
        </div>
      </div>

      {/* ─── Stats Bar ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div className="md3-card-sm" style={{ textAlign: 'center', border: 'none', background: 'linear-gradient(135deg, #d1e4ff66, transparent)' }}>
          <FileText size={20} style={{ color: 'var(--primary)', margin: '0 auto 4px' }} />
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalNotes}</div>
          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Notes</div>
        </div>
        <div className="md3-card-sm" style={{ textAlign: 'center', border: 'none', background: 'linear-gradient(135deg, #10B98111, transparent)' }}>
          <CheckCircle size={20} style={{ color: '#10B981', margin: '0 auto 4px' }} />
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalRevised}</div>
          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Revised</div>
        </div>
        <div className="md3-card-sm" style={{ textAlign: 'center', border: 'none', background: 'linear-gradient(135deg, #F59E0B11, transparent)' }}>
          <Pin size={20} style={{ color: '#F59E0B', margin: '0 auto 4px' }} />
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalPinned}</div>
          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Pinned</div>
        </div>
        <div className="md3-card-sm" style={{ textAlign: 'center', border: 'none', background: 'linear-gradient(135deg, #EC489911, transparent)' }}>
          <Star size={20} style={{ color: '#EC4899', margin: '0 auto 4px' }} />
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{totalFavorites}</div>
          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Favorites</div>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', pointerEvents: 'none' }} />
        <input 
          type="text" 
          placeholder="Search notes, tags, or content..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md3-input"
          style={{ paddingLeft: '46px', borderRadius: '100px' }}
        />
      </div>

      {/* ─── Revision Reminders ─── */}
      {dueRevisionNotes.length > 0 && (
        <div className="stagger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calendar size={18} style={{ color: 'var(--error)' }} />
            <h3 style={{ fontSize: '17px' }}>Due for Revision</h3>
            <span className="md3-chip md3-chip-active" style={{ fontSize: '11px', padding: '2px 10px' }}>{dueRevisionNotes.length} pending</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {dueRevisionNotes.map((note) => (
              <div key={note.id} className="md3-card-sm" style={{ minWidth: '240px', maxWidth: '260px', flexShrink: 0, borderLeft: '4px solid var(--error)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="md3-chip" style={{ fontSize: '10px', padding: '2px 8px' }}>Streak {note.revisionStreak}x</span>
                  {note.isPinned && <Pin size={12} style={{ color: 'var(--primary)' }} />}
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} onClick={() => onEditNote(note.id)}>{note.title}</h4>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => { markAsRevised(note.id, 'easy'); confetti({ particleCount: 20, colors: ['#10B981'] }); }} className="md3-btn" style={{ padding: '4px 12px', fontSize: '11px', background: '#10B981', color: '#fff' }}><CheckCircle size={11} /> Revised</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Categories ─── */}
      <div className="stagger">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} /> Subjects
          </h3>
          <button onClick={() => setShowCategoryModal(true)} className="md3-btn md3-btn-text" style={{ fontSize: '12px', padding: '4px 12px' }}>
            <Plus size={14} /> Add Subject
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setActiveCategoryId(null)}
            style={{ padding: '8px 18px', borderRadius: '100px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
              background: activeCategoryId === null ? 'var(--primary)' : 'var(--surface)', color: activeCategoryId === null ? 'var(--on-primary)' : 'var(--on-surface)',
              boxShadow: activeCategoryId === null ? '0 4px 12px rgba(0,97,164,0.3)' : 'var(--elevation-1)' }}>
            All
          </button>
          {categories.map((cat) => (
            <div key={cat.id} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <button onClick={() => setActiveCategoryId(cat.id)}
                style={{ padding: '8px 18px', borderRadius: '100px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeCategoryId === cat.id ? cat.color : 'var(--surface)', color: activeCategoryId === cat.id ? '#fff' : 'var(--on-surface)',
                  boxShadow: activeCategoryId === cat.id ? `0 4px 12px ${cat.color}44` : 'var(--elevation-1)' }}>
                {cat.name}
              </button>
              {!cat.id.startsWith('cat-') && (
                <button onClick={() => deleteCategory(cat.id)} style={{ position: 'absolute', top: '-4px', right: '-4px', border: 'none', background: 'var(--error)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Folders ─── */}
      <div className="stagger">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={18} style={{ color: 'var(--primary)' }} /> Folders
          </h3>
          <button onClick={() => setShowFolderModal(true)} className="md3-btn md3-btn-text" style={{ fontSize: '12px', padding: '4px 12px' }}>
            <Plus size={14} /> New Folder
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setActiveFolderId(null)}
            style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
              background: activeFolderId === null ? 'var(--primary)' : 'var(--surface)', color: activeFolderId === null ? 'var(--on-primary)' : 'var(--on-surface)',
              boxShadow: activeFolderId === null ? '0 4px 12px rgba(0,97,164,0.3)' : 'var(--elevation-1)' }}>
            📁 All Notes
          </button>
          {folders.map((folder) => (
            <div key={folder.id} style={{ display: 'inline-flex', flexShrink: 0 }}>
              <button onClick={() => setActiveFolderId(folder.id)}
                style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeFolderId === folder.id ? 'var(--primary)' : 'var(--surface)', color: activeFolderId === folder.id ? 'var(--on-primary)' : 'var(--on-surface)',
                  boxShadow: 'var(--elevation-1)' }}>
                📁 {folder.name}
              </button>
              <button onClick={() => deleteFolder(folder.id)} style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', color: 'var(--error)', fontSize: '14px' }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Notes Section ─── */}
      <div className="stagger">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Study Notes
            <span className="md3-chip" style={{ fontSize: '11px', padding: '2px 10px' }}>{displayNotes.length}</span>
          </h3>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => setViewMode('grid')} className="md3-btn-ghost" style={{ padding: '6px', borderRadius: '8px', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--outline)' }}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className="md3-btn-ghost" style={{ padding: '6px', borderRadius: '8px', color: viewMode === 'list' ? 'var(--primary)' : 'var(--outline)' }}>
              <List size={16} />
            </button>
            <button onClick={onCreateNote} className="md3-btn md3-btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
              <Plus size={15} /> New Note
            </button>
          </div>
        </div>

        {displayNotes.length === 0 ? (
          <div className="md3-card" style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--outline-variant)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'var(--outline)' }} />
            <h3 style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>No notes yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--outline)', marginTop: '4px' }}>Create your first study note to get started!</p>
            <button onClick={onCreateNote} className="md3-btn md3-btn-primary" style={{ marginTop: '20px' }}>
              <Plus size={16} /> Create Note
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {displayNotes.map((note) => {
              const noteCategory = categories.find(c => c.id === note.categoryId);
              return (
                <div key={note.id} className="md3-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', borderTop: noteCategory ? `4px solid ${noteCategory.color}` : '4px solid var(--outline-variant)' }}
                  onClick={() => onEditNote(note.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {note.pinLock && <Lock size={12} style={{ color: 'var(--outline)' }} />}
                      {note.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {note.isPinned && <Pin size={13} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />}
                      {note.isFavorite && <Star size={13} style={{ color: '#F59E0B', fill: '#F59E0B' }} />}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                    {note.pinLock ? '[🔒 Locked Note]' : note.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                    {noteCategory && <span className="md3-chip" style={{ fontSize: '10px', padding: '2px 10px', background: `${noteCategory.color}18`, color: noteCategory.color }}>{noteCategory.name}</span>}
                    {note.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="md3-chip" style={{ fontSize: '10px', padding: '2px 10px' }}>#{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--outline-variant)', paddingTop: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--outline)' }}>{new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="md3-btn-ghost" style={{ padding: '4px', color: 'var(--error)', fontSize: '12px' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayNotes.map((note) => {
              const noteCategory = categories.find(c => c.id === note.categoryId);
              return (
                <div key={note.id} className="md3-card-sm" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', cursor: 'pointer', borderLeft: noteCategory ? `4px solid ${noteCategory.color}` : '4px solid var(--outline-variant)' }}
                  onClick={() => onEditNote(note.id)}>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title}</h4>
                      {note.isPinned && <Pin size={11} style={{ color: 'var(--primary)', fill: 'var(--primary)', flexShrink: 0 }} />}
                      {note.isFavorite && <Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {noteCategory && <span className="md3-chip" style={{ fontSize: '10px', padding: '2px 10px', background: `${noteCategory.color}18`, color: noteCategory.color }}>{noteCategory.name}</span>}
                    <span style={{ fontSize: '11px', color: 'var(--outline)', whiteSpace: 'nowrap' }}>{new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="md3-btn-ghost" style={{ padding: '4px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      {showFolderModal && (
        <div className="modal-backdrop" onClick={() => setShowFolderModal(false)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (!newFolderName.trim()) return; addFolder({ name: newFolderName.trim() }); setNewFolderName(''); setShowFolderModal(false); confetti({ particleCount: 30, spread: 40, colors: ['#0061A4'] }); }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Create Folder</h3>
            <input type="text" placeholder='e.g. Semester 2, Assignments' value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="md3-input" autoFocus required />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowFolderModal(false)} className="md3-btn md3-btn-text">Cancel</button>
              <button type="submit" className="md3-btn md3-btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (!newCategoryName.trim()) return; addCategory({ name: newCategoryName.trim(), color: newCategoryColor }); setNewCategoryName(''); setShowCategoryModal(false); confetti({ particleCount: 30, spread: 40, colors: [newCategoryColor] }); }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Add Subject</h3>
            <input type="text" placeholder="e.g. Computer Science" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="md3-input" autoFocus required />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {['#0061A4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#F97316', '#14B8A6', '#84CC16', '#06B6D4', '#D946EF', '#6366F1'].map(color => (
                <button key={color} type="button" onClick={() => setNewCategoryColor(color)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, border: newCategoryColor === color ? '2px solid var(--on-surface)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowCategoryModal(false)} className="md3-btn md3-btn-text">Cancel</button>
              <button type="submit" className="md3-btn md3-btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}

      {unlockNoteId && (
        <div className="modal-backdrop" onClick={() => setUnlockNoteId(null)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); const target = notes.find(n => n.id === unlockNoteId); if (target && target.pinLock === pinInput) { onEditNote(unlockNoteId); setUnlockNoteId(null); } else setPinError(true); }}>
            <Lock size={36} style={{ color: 'var(--primary)', margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ fontSize: '18px', textAlign: 'center' }}>Enter PIN</h3>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', textAlign: 'center', marginBottom: '16px' }}>This note is locked</p>
            <input type="password" maxLength={4} placeholder="••••" value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} autoFocus style={{ width: '120px', margin: '0 auto', display: 'block', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '22px', letterSpacing: '10px', textAlign: 'center', outline: 'none' }} />
            {pinError && <p style={{ color: 'var(--error)', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>Incorrect PIN</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button type="button" onClick={() => setUnlockNoteId(null)} className="md3-btn md3-btn-text">Cancel</button>
              <button type="submit" className="md3-btn md3-btn-primary">Unlock</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
