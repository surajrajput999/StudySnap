'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, Note, Category, Folder } from '@/lib/store/useStore';
import { 
  ArrowLeft, Save, Pin, Star, Lock, Unlock, Download, Upload,
  Volume2, VolumeX, Mic, MicOff, Tag, FolderOpen, Calendar, RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface NoteEditorProps {
  noteId: string | null;
  onBack: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export default function NoteEditor({ noteId, onBack }: NoteEditorProps) {
  const { 
    notes, categories, folders, addNote, updateNote, deleteNote 
  } = useStore();

  const isNew = !noteId;
  const activeNote = notes.find(n => n.id === noteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [pinLock, setPinLock] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setTags(activeNote.tags);
      setCategoryId(activeNote.categoryId || '');
      setFolderId(activeNote.folderId || '');
      setIsPinned(activeNote.isPinned);
      setIsFavorite(activeNote.isFavorite);
      setPinLock(activeNote.pinLock);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setCategoryId('');
      setFolderId('');
      setIsPinned(false);
      setIsFavorite(false);
      setPinLock(null);
    }
    setSaveStatus('saved');
  }, [noteId, activeNote]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => { if (synthRef.current) synthRef.current.cancel(); };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition() as SpeechRecognition;
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onstart = () => setIsListening(true);
        rec.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < (event.results as any).length; ++i) {
            if (event.results[i][0].transcript) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setContent(prev => prev + ' ' + finalTranscript);
            setSaveStatus('unsaved');
          }
        };
        rec.onerror = (e: SpeechRecognitionErrorEvent) => { console.error("STT Error:", e.error); setIsListening(false); };
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }
  }, []);

  useEffect(() => {
    if (isNew && !title.trim() && !content.trim()) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const notePayload = {
        title: title || 'Untitled Note',
        content,
        tags,
        categoryId: categoryId || null,
        folderId: folderId || null,
        isPinned,
        isFavorite,
        pinLock,
      };
      if (isNew) {
        const created = addNote(notePayload);
        updateNote(created.id, {});
      } else if (noteId) {
        updateNote(noteId, notePayload);
      }
      setSaveStatus('saved');
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, content, tags, categoryId, folderId, isPinned, isFavorite, pinLock]);

  const handleListenNote = () => {
    if (!synthRef.current) return;
    if (isSpeaking) {
      if (isPaused) { synthRef.current.resume(); setIsPaused(false); }
      else { synthRef.current.pause(); setIsPaused(true); }
      return;
    }
    const textToRead = content.replace(/<[^>]*>/g, '');
    if (!textToRead.trim()) return;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    utteranceRef.current = utterance;
    setIsSpeaking(true); setIsPaused(false);
    synthRef.current.speak(utterance);
  };

  const handleStopListeningVoice = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false); setIsPaused(false);
  };

  const handleDictateSpeech = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Try Chrome/Safari.");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
        setSaveStatus('unsaved');
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
    setSaveStatus('unsaved');
  };

  const handleLockToggle = () => {
    if (pinLock) { setPinLock(null); confetti({ particleCount: 30, colors: ['#a0c9ff'] }); }
    else { setShowPinModal(true); setPinCode(''); }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length === 4) { setPinLock(pinCode); setShowPinModal(false); confetti({ particleCount: 50, colors: ['#0061A4'] }); }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 97, 164);
    doc.text(title || "Untitled Note", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const catName = categories.find(c => c.id === categoryId)?.name || 'General';
    const folderName = folders.find(f => f.id === folderId)?.name || 'Root';
    doc.text(`Subject: ${catName}   |   Folder: ${folderName}`, 20, 28);
    doc.text(`Tags: ${tags.length > 0 ? tags.map(t => `#${t}`).join(', ') : 'None'}`, 20, 33);
    doc.setDrawColor(0, 97, 164);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    const textContent = content.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n');
    const splitText = doc.splitTextToSize(textContent || "No text content.", 170);
    doc.text(splitText, 20, 48);
    doc.save(`${title || 'study-note'}.pdf`);
    confetti({ particleCount: 40, colors: ['#10B981'] });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const fileTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(fileTitle);
      setContent(text);
      setSaveStatus('unsaved');
      confetti({ particleCount: 50, colors: ['#0061A4'] });
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onBack} className="md3-btn md3-btn-text" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px',
            color: saveStatus === 'saved' ? '#10B981' : saveStatus === 'saving' ? 'var(--primary)' : 'var(--outline)'
          }}>
            <RefreshCw size={12} className={saveStatus === 'saving' ? 'pulse-recording' : ''} />
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>
          <button onClick={() => setIsPinned(!isPinned)} className="md3-btn-ghost" style={{ borderRadius: '50%', padding: '8px', color: isPinned ? 'var(--primary)' : 'var(--outline)' }}>
            <Pin size={18} style={{ fill: isPinned ? 'var(--primary)' : 'transparent' }} />
          </button>
          <button onClick={() => setIsFavorite(!isFavorite)} className="md3-btn-ghost" style={{ borderRadius: '50%', padding: '8px', color: isFavorite ? '#F59E0B' : 'var(--outline)' }}>
            <Star size={18} style={{ fill: isFavorite ? '#F59E0B' : 'transparent' }} />
          </button>
          <button onClick={handleLockToggle} className="md3-btn-ghost" style={{ borderRadius: '50%', padding: '8px', color: pinLock ? 'var(--error)' : 'var(--outline)' }}>
            {pinLock ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
        </div>
      </div>

      <div className="md3-card-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> Subject
          </label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="md3-input" style={{ padding: '10px 14px' }}>
            <option value="">General</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderOpen size={12} /> Folder
          </label>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="md3-input" style={{ padding: '10px 14px' }}>
            <option value="">Root</option>
            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
        </div>
      </div>

      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, padding: '20px' }}>
        <input 
          type="text" placeholder="Note Title" value={title}
          onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
          style={{ width: '100%', border: 'none', borderBottom: '2px solid var(--outline-variant)', outline: 'none', padding: '8px 0', fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-title)', backgroundColor: 'transparent', color: 'var(--on-background)' }}
        />

        {isSpeaking && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '8px 14px', backgroundColor: 'var(--primary-container)', borderRadius: '100px', width: 'fit-content' }}>
            <div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" />
            <span style={{ fontSize: '12px', color: 'var(--on-primary-container)', marginLeft: '6px' }}>Reading aloud...</span>
            <button onClick={handleStopListeningVoice} className="md3-btn-ghost" style={{ color: 'var(--error)', padding: '2px', marginLeft: '8px' }}>
              <VolumeX size={14} /> Stop
            </button>
          </div>
        )}

        <textarea 
          placeholder="Start typing your study notes..." value={content}
          onChange={(e) => { setContent(e.target.value); setSaveStatus('unsaved'); }}
          style={{ width: '100%', flexGrow: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '15px', lineHeight: 1.7, padding: '10px 0', minHeight: '300px', backgroundColor: 'transparent', color: 'var(--on-background)', fontFamily: 'var(--font-body)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.map((tag) => (
            <span key={tag} className="md3-chip" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
              #{tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)', padding: 0, fontSize: '14px' }}>×</button>
            </span>
          ))}
        </div>
        <input type="text" placeholder="Add tags... (Press Enter)" value={tagInput}
          onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="md3-input" style={{ padding: '10px 14px' }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--outline-variant)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={handleListenNote} className={`md3-btn ${isSpeaking && !isPaused ? 'md3-btn-primary' : 'md3-btn-secondary'}`}>
            <Volume2 size={16} /> {isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}
          </button>
          <button type="button" onClick={handleDictateSpeech}
            className={`md3-btn ${isListening ? 'md3-btn-primary pulse-recording' : 'md3-btn-secondary'}`}
            style={{ backgroundColor: isListening ? 'var(--error)' : undefined, color: isListening ? '#fff' : undefined }}>
            {isListening ? <MicOff size={16} /> : <Mic size={16} />} {isListening ? 'Stop' : 'Dictate'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={handleExportPDF} className="md3-btn md3-btn-secondary">
            <Download size={16} /> PDF
          </button>
          <label className="md3-btn md3-btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Import
            <input type="file" accept=".txt,.md" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {showPinModal && (
        <div className="modal-backdrop" onClick={() => setShowPinModal(false)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={handleSavePin} style={{ textAlign: 'center', maxWidth: '360px' }}>
            <Lock size={40} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px' }}>Lock Note</h3>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>Set a 4-digit PIN to secure this note</p>
            <input type="password" maxLength={4} placeholder="••••" value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))} required autoFocus
              style={{ width: '120px', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '22px', letterSpacing: '10px', textAlign: 'center', outline: 'none', margin: '0 auto' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowPinModal(false)} className="md3-btn md3-btn-text">Cancel</button>
              <button type="submit" className="md3-btn md3-btn-primary" disabled={pinCode.length !== 4}>Set Lock</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
