import Groq from 'groq-sdk';
import { env } from '../config/env';

let groq: any = null;

if (env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: env.GROQ_API_KEY });
}

export function getGroq() {
  return groq;
}

export async function chatCompletion(messages: { role: string; content: string }[]) {
  if (!groq) {
    return mockChatReply(messages);
  }
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are StudyBot, an AI study assistant for students. Explain topics simply, offer study tips, and draft revision schedules. Keep responses concise in Markdown.'
      },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || 'Sorry, I could not process that.';
}

export async function summarizeNote(title: string, content: string) {
  if (!groq) {
    return mockSummary(title);
  }
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert summarizer. Generate a concise, structured, bulleted summary. Highlight key definitions, formulas, and main points. Use Markdown.'
      },
      { role: 'user', content: `Title: ${title}\n\nContent:\n${content}` }
    ],
    temperature: 0.3,
  });
  return response.choices[0]?.message?.content || 'Could not generate summary.';
}

export async function generateMcqs(title: string, content: string) {
  if (!groq) {
    return mockMcqs();
  }
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Generate exactly 3 MCQs in JSON array format. Each: {"question": "...", "options": ["","","",""], "answer": 0, "explanation": "..."}. Return ONLY valid JSON.'
      },
      { role: 'user', content: `Text:\n${content}` }
    ],
    temperature: 0.5,
  });
  const raw = response.choices[0]?.message?.content || '[]';
  const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
  return JSON.parse(match ? match[0] : '[]');
}

export async function generateFlashcards(title: string, content: string) {
  if (!groq) {
    return mockFlashcards();
  }
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Generate exactly 3 flashcards in JSON array format. Each: {"question": "...", "answer": "..."}. Return ONLY valid JSON.'
      },
      { role: 'user', content: `Text:\n${content}` }
    ],
    temperature: 0.5,
  });
  const raw = response.choices[0]?.message?.content || '[]';
  const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
  return JSON.parse(match ? match[0] : '[]');
}

export async function translateText(content: string, lang: 'hindi' | 'english') {
  if (!groq) {
    return mockTranslation(content, lang);
  }
  const label = lang === 'hindi' ? 'Hindi' : 'English';
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `Translate the text exactly into ${label}. Retain formatting. Return only the translated text.`
      },
      { role: 'user', content }
    ],
    temperature: 0.2,
  });
  return response.choices[0]?.message?.content || 'Translation failed.';
}

function mockChatReply(messages: { role: string; content: string }[]) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';
  if (last.includes('hello') || last.includes('hi')) {
    return 'Hello! I am StudyBot. Ask me to summarize notes, generate flashcards, or explain any topic!';
  }
  if (last.includes('summarize')) {
    return 'Send me notes text and I will generate a structured summary for you.';
  }
  if (last.includes('explain') || last.includes('what')) {
    return 'In simple terms, think of it like building blocks. Each concept stacks on the previous one. What specific topic would you like me to break down?';
  }
  return 'I can help you study better! Try asking me to explain a concept, generate quiz questions, or create a revision schedule. (Set GROQ_API_KEY for full AI power)';
}

function mockSummary(title: string) {
  return `### Summary: ${title || 'Study Note'}\n\n**Core Concepts:** Key definitions and relationships from the material.\n**Takeaway:** Regular review improves retention.\n**Next:** Test yourself with flashcards.`;
}

function mockMcqs() {
  return [
    { question: 'What is the best way to retain study material?', options: ['Passive reading', 'Active recall', 'Cramming', 'Skipping'], answer: 1, explanation: 'Active recall forces retrieval, strengthening memory pathways.' },
    { question: 'What does spaced repetition prevent?', options: ['Overlearning', 'Forgetting curve', 'Burnout', 'Procrastination'], answer: 1, explanation: 'It schedules reviews right before forgetting would occur.' },
    { question: 'Which study method is most effective long-term?', options: ['Re-reading', 'Highlighting', 'Practice testing', 'Summarizing'], answer: 2, explanation: 'Practice testing has the highest effect size for long-term retention.' }
  ];
}

function mockFlashcards() {
  return [
    { question: 'What is active recall?', answer: 'A learning method where you actively retrieve information from memory.' },
    { question: 'What is spaced repetition?', answer: 'Reviewing material at increasing intervals to combat the forgetting curve.' },
    { question: 'Why teach others what you learn?', answer: 'Teaching forces you to organize knowledge and fill gaps in understanding.' }
  ];
}

function mockTranslation(content: string, lang: string) {
  if (lang === 'hindi') {
    return `[हिंदी अनुवाद]\n\nयह आपके नोट्स का अनुवाद है। GROQ_API_KEY सेट करें वास्तविक अनुवाद के लिए।\n\nमूल: ${content.substring(0, 100)}...`;
  }
  return `[English Translation]\n\nThis is a translation of your notes. Set GROQ_API_KEY for real AI translation.\n\nOriginal: ${content.substring(0, 100)}...`;
}
