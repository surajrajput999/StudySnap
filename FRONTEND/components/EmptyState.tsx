'use client';

import React from 'react';

interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  tip?: string;
}

export default function EmptyState({ illustration, title, message, action, tip }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration">
        {illustration}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button onClick={action.onClick} className="md3-btn md3-btn-primary empty-state-action">
          {action.label}
        </button>
      )}
      {tip && (
        <p className="empty-state-tip">{tip}</p>
      )}
    </div>
  );
}

export function EmptyNotesIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="120" height="90" rx="12" fill="var(--primary-container)" opacity="0.5"/>
      <rect x="28" y="23" width="104" height="74" rx="8" fill="var(--surface)" stroke="var(--outline-variant)" strokeWidth="1.5"/>
      <line x1="44" y1="42" x2="116" y2="42" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="44" y1="54" x2="100" y2="54" stroke="var(--outline-variant)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="44" y1="64" x2="108" y2="64" stroke="var(--outline-variant)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="44" y1="74" x2="88" y2="74" stroke="var(--outline-variant)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="132" cy="30" r="18" fill="var(--primary)" opacity="0.15"/>
      <path d="M126 30h12M132 24v12" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <circle cx="28" cy="90" r="14" fill="var(--primary)" opacity="0.1"/>
      <path d="M22 90h12M28 84v12" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function EmptyVoiceIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="50" r="36" fill="var(--primary-container)" opacity="0.4"/>
      <circle cx="80" cy="50" r="26" fill="var(--primary-container)" opacity="0.3"/>
      <circle cx="80" cy="50" r="16" fill="var(--primary)" opacity="0.12"/>
      <rect x="68" y="30" width="24" height="40" rx="12" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2"/>
      <rect x="74" y="36" width="12" height="6" rx="3" fill="var(--primary)" opacity="0.4"/>
      <line x1="62" y1="45" x2="56" y2="45" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="62" y1="52" x2="52" y2="52" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="98" y1="45" x2="104" y2="45" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="98" y1="52" x2="108" y2="52" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M70 85a20 20 0 0 0 20 0" stroke="var(--outline-variant)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="80" cy="93" r="6" fill="var(--primary)" opacity="0.08"/>
    </svg>
  );
}

export function EmptyAiIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="25" width="100" height="70" rx="16" fill="var(--primary)" opacity="0.08"/>
      <rect x="36" y="31" width="88" height="58" rx="12" fill="var(--surface)" stroke="var(--outline-variant)" strokeWidth="1.5"/>
      <circle cx="56" cy="56" r="12" fill="var(--primary-container)" opacity="0.5"/>
      <path d="M52 56h8M56 52v8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
      <text x="76" y="52" fontSize="10" fill="var(--on-surface-variant)" opacity="0.6" fontFamily="var(--font-body)">Hello!</text>
      <text x="76" y="64" fontSize="10" fill="var(--on-surface-variant)" opacity="0.4" fontFamily="var(--font-body)">How can I help?</text>
      <circle cx="40" cy="90" r="5" fill="var(--primary)" opacity="0.2"/>
      <circle cx="120" cy="92" r="4" fill="var(--tertiary)" opacity="0.15"/>
      <circle cx="52" cy="98" r="3" fill="var(--primary)" opacity="0.1"/>
      <path d="M130 28l4-4M134 28l-4-4" stroke="var(--outline-variant)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function EmptyRevisionIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="55" r="38" fill="var(--primary-container)" opacity="0.3"/>
      <circle cx="80" cy="55" r="32" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
      <rect x="60" y="35" width="40" height="40" rx="8" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5" transform="rotate(15 80 55)"/>
      <path d="M75 50l6 6 10-10" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      <path d="M40 90h80" stroke="var(--outline-variant)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <circle cx="48" cy="85" r="4" fill="var(--primary)" opacity="0.15"/>
      <circle cx="80" cy="83" r="3" fill="#10B981" opacity="0.2"/>
      <circle cx="110" cy="86" r="4" fill="var(--primary)" opacity="0.1"/>
      <path d="M20 45l8-8M28 45l-8-8" stroke="var(--outline-variant)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

export function EmptyProfileIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="40" r="24" fill="var(--primary-container)" opacity="0.4"/>
      <circle cx="80" cy="40" r="16" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2"/>
      <circle cx="80" cy="36" r="6" fill="var(--primary)" opacity="0.3"/>
      <path d="M74 48a8 8 0 0 1 12 0" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <rect x="36" y="72" width="88" height="6" rx="3" fill="var(--outline-variant)" opacity="0.4"/>
      <rect x="44" y="84" width="72" height="5" rx="2.5" fill="var(--outline-variant)" opacity="0.25"/>
      <rect x="50" y="95" width="60" height="4" rx="2" fill="var(--outline-variant)" opacity="0.15"/>
      <circle cx="130" cy="30" r="18" fill="var(--primary)" opacity="0.06"/>
      <path d="M126 30h8M130 26v8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <circle cx="24" cy="28" r="12" fill="var(--tertiary)" opacity="0.06"/>
      <path d="M21 28h6M24 25v6" stroke="var(--tertiary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.25"/>
    </svg>
  );
}

export function EmptyFlashcardIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="18" width="104" height="72" rx="12" fill="var(--primary)" opacity="0.08" transform="rotate(-4 80 54)"/>
      <rect x="32" y="22" width="96" height="64" rx="10" fill="var(--surface)" stroke="var(--outline-variant)" strokeWidth="1.5" transform="rotate(-4 80 54)"/>
      <text x="56" y="48" fontSize="11" fill="var(--on-surface-variant)" opacity="0.5" fontFamily="var(--font-body)" transform="rotate(-4 80 54)">Question ?</text>
      <path d="M52 56l20 10M72 56l-20 10" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" transform="rotate(-4 80 54)"/>
      <circle cx="132" cy="26" r="16" fill="var(--primary)" opacity="0.1"/>
      <path d="M128 26h8M132 22v8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <circle cx="24" cy="90" r="12" fill="var(--tertiary)" opacity="0.08"/>
      <path d="M21 90h6M24 87v6" stroke="var(--tertiary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

export function EmptyMcqIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="50" r="38" fill="var(--primary-container)" opacity="0.25"/>
      <rect x="36" y="32" width="88" height="10" rx="5" fill="var(--surface)" stroke="var(--outline-variant)" strokeWidth="1.2"/>
      <circle cx="46" cy="37" r="3" fill="none" stroke="var(--outline-variant)" strokeWidth="1.5"/>
      <rect x="36" y="48" width="88" height="10" rx="5" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5"/>
      <circle cx="46" cy="53" r="3" fill="var(--primary)" opacity="0.5"/>
      <rect x="36" y="64" width="88" height="10" rx="5" fill="var(--surface)" stroke="var(--outline-variant)" strokeWidth="1.2"/>
      <circle cx="46" cy="69" r="3" fill="none" stroke="var(--outline-variant)" strokeWidth="1.5"/>
      <rect x="36" y="80" width="88" height="10" rx="5" fill="var(--surface)" stroke="var(--outline-variant)" strokeWidth="1.2"/>
      <circle cx="46" cy="85" r="3" fill="none" stroke="var(--outline-variant)" strokeWidth="1.5"/>
      <path d="M130 20l3-3M133 20l-3-3" stroke="var(--outline-variant)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <circle cx="28" cy="100" r="4" fill="var(--primary)" opacity="0.1"/>
    </svg>
  );
}
