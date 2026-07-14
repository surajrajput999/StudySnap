'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, VoiceNote, Note } from '@/lib/store/useStore';
import { 
  Play, Square, Mic, MicOff, Trash2, 
  Volume2, FileText, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VoiceNotesProps {
  onBack: () => void;
  onLinkToNote: (noteId: string) => void;
}

export default function VoiceNotes({ onBack, onLinkToNote }: VoiceNotesProps) {
  const { voiceNotes, notes, addVoiceNote, deleteVoiceNote } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) setTranscript(prev => prev + ' ' + finalTranscript);
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      durationTimerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => { if (durationTimerRef.current) clearInterval(durationTimerRef.current); };
  }, [isRecording, isPaused]);

  useEffect(() => {
    return () => { if (activeAudioRef.current) activeAudioRef.current.pause(); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const associateNoteId = notes[0]?.id || crypto.randomUUID();
        addVoiceNote({ noteId: associateNoteId, audioUrl, duration: recordingDuration, transcript: transcript.trim() || 'Voice session captured.' });
        setRecordingDuration(0);
        setTranscript('');
        confetti({ particleCount: 40, colors: ['#0061A4', '#bdc7dc'] });
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setTranscript('');
      if (recognitionRef.current) recognitionRef.current.start();
    } catch (err) {
      console.error("Mic Access failed:", err);
      alert("Failed to access microphone. Please grant permission.");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        if (recognitionRef.current) recognitionRef.current.start();
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (recognitionRef.current) recognitionRef.current.stop();
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const handlePlayVoice = (vn: VoiceNote) => {
    if (playingId === vn.id) {
      if (activeAudioRef.current) { activeAudioRef.current.pause(); setPlayingId(null); }
    } else {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      const audio = new Audio(vn.audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.onended = () => setPlayingId(null);
      activeAudioRef.current = audio;
      setPlayingId(vn.id);
      audio.play();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (activeAudioRef.current) activeAudioRef.current.playbackRate = speed;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={20} style={{ color: 'var(--primary)' }} />
          Voice Notes
        </h3>
        <button onClick={onBack} className="md3-btn md3-btn-text">Back</button>
      </div>

      <div className="premium-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {isRecording ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div className="pulse-recording" style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--error)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Mic size={36} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>{formatTime(recordingDuration)}</span>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{isPaused ? 'Paused' : 'Recording...'}</p>
            </div>
            {transcript && (
              <div style={{ maxHeight: '80px', overflowY: 'auto', padding: '10px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.04)', fontSize: '12px', maxWidth: '360px', width: '100%', fontStyle: 'italic' }}>
                "{transcript}"
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button onClick={handlePauseRecording} className="md3-btn md3-btn-secondary" style={{ padding: '8px 24px' }}>{isPaused ? 'Resume' : 'Pause'}</button>
              <button onClick={handleStopRecording} className="md3-btn" style={{ backgroundColor: 'var(--error)', color: '#fff', padding: '8px 24px' }}>
                <Square size={14} /> Stop
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <button onClick={handleStartRecording} className="pulse-recording" style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,97,164,0.3)' }}>
              <Mic size={36} color="#fff" />
            </button>
            <div>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Start Recording</span>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>Your voice is transcribed in real-time</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Speed:</span>
        {[0.5, 1.0, 1.5, 2.0].map((speed) => (
          <button key={speed} onClick={() => handleSpeedChange(speed)}
            className="md3-chip" style={{ cursor: 'pointer', background: playbackSpeed === speed ? 'var(--primary)' : 'var(--surface-variant)', color: playbackSpeed === speed ? '#fff' : 'var(--on-surface-variant)', fontWeight: 600 }}>
            {speed}x
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '16px' }}>Recordings ({voiceNotes.length})</h4>
        {voiceNotes.length === 0 ? (
          <div className="md3-card-sm" style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--outline-variant)' }}>
            <HelpCircle size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: '13px', color: 'var(--outline)' }}>No recordings yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {voiceNotes.map((vn) => {
              const linkedNote = notes.find(n => n.id === vn.noteId);
              return (
                <div key={vn.id} className="md3-card-sm" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={() => handlePlayVoice(vn)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-container)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}>
                        {playingId === vn.id ? <Square size={14} /> : <Play size={16} style={{ fill: 'var(--primary)' }} />}
                      </button>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Voice {formatTime(vn.duration)}</span>
                        <p style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '1px' }}>
                          {linkedNote ? linkedNote.title : 'General'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {linkedNote && (
                        <button onClick={() => onLinkToNote(linkedNote.id)} className="md3-btn-ghost" style={{ padding: '6px', color: 'var(--primary)' }}>
                          <FileText size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteVoiceNote(vn.id)} className="md3-btn-ghost" style={{ padding: '6px', color: 'var(--error)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {vn.transcript && (
                    <div style={{ padding: '8px 12px', background: 'var(--surface-variant)', borderRadius: '8px', fontSize: '11px', color: 'var(--on-surface-variant)', borderLeft: '3px solid var(--primary)', fontStyle: 'italic' }}>
                      "{vn.transcript}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
