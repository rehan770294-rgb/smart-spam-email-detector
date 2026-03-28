import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Copy, 
  Sun, 
  Moon, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Mail,
  User,
  Type,
  Send
} from 'lucide-react';

const SPAM_KEYWORDS = [
  "win", "free", "offer", "money", "urgent", "click", "prize",
  "congratulations", "winner", "cash", "claim", "limited", "buy", "save",
  "discount", "investment", "bitcoin", "crypto", "account", "verify",
  "suspended", "action", "required", "immediately", "lottery", "gift",
  "inheritance", "bank", "password", "security", "update", "unusual",
  "activity", "login", "access", "reward", "bonus", "exclusive"
];

export default function App() {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const analysis = useMemo(() => {
    const combinedText = `${subject} ${message}`.toLowerCase();
    if (!combinedText.trim()) return null;

    const words = combinedText.split(/\W+/);
    const detectedWords = new Set<string>();
    let count = 0;

    SPAM_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        detectedWords.add(keyword);
        count += matches.length;
      }
    });

    const totalWords = words.filter(w => w.length > 0).length;
    // Score calculation: weighted by unique keywords and total occurrences
    const uniqueWeight = detectedWords.size * 5;
    const occurrenceWeight = (count / (totalWords || 1)) * 100;
    const score = Math.min(Math.round(uniqueWeight + occurrenceWeight), 100);
    
    const isSpam = detectedWords.size >= 3 || score > 20;

    return {
      isSpam,
      score,
      detectedKeywords: Array.from(detectedWords),
      count
    };
  }, [subject, message]);

  const handleCheck = () => {
    if (subject.trim() || message.trim()) {
      setShowResult(true);
    }
  };

  const clearAll = () => {
    setFrom('');
    setSubject('');
    setMessage('');
    setShowResult(false);
  };

  const copyResult = () => {
    if (!analysis) return;
    const resultText = `Email Analysis Result\nFrom: ${from || 'Unknown'}\nSubject: ${subject}\nResult: ${analysis.isSpam ? 'SPAM' : 'NOT SPAM'}\nScore: ${analysis.score}%\nDetected Keywords: ${analysis.detectedKeywords.join(', ')}`;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedMessage = () => {
    if (!message) return null;
    
    const sortedKeywords = [...SPAM_KEYWORDS].sort((a, b) => b.length - a.length);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    const regex = new RegExp(`\\b(${sortedKeywords.join('|')})\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(message)) !== null) {
      parts.push(message.substring(lastIndex, match.index));
      parts.push(
        <span key={match.index} className="highlight-spam">
          {match[0]}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    parts.push(message.substring(lastIndex));
    
    return parts;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EmailGuard Pro</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Advanced Spam Analysis</p>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Email Form Section */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                <Mail size={16} /> Email Composer
              </h2>
              <button 
                onClick={clearAll}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-500 font-medium transition-colors"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              {/* From Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <User size={12} /> From
                </label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="sender@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>

              {/* Subject Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Type size={12} /> Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (showResult) setShowResult(false);
                  }}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Mail size={12} /> Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (showResult) setShowResult(false);
                  }}
                  placeholder="Paste the email body content here..."
                  className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none resize-none leading-relaxed"
                />
              </div>

              <button 
                onClick={handleCheck}
                disabled={!subject.trim() && !message.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <ShieldAlert size={20} /> Check Email for Spam
              </button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl opacity-40 bg-slate-50/30 dark:bg-slate-900/20"
              >
                <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Send size={40} />
                </div>
                <h3 className="font-bold text-lg">Ready to Analyze</h3>
                <p className="text-sm max-w-[240px] mt-2">Fill in the email details and click "Check Email" to see the security analysis.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Result Status Card */}
                <div className={`p-8 rounded-2xl border-2 transition-all shadow-xl ${
                  analysis?.isSpam 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 shadow-red-500/5' 
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 shadow-emerald-500/5'
                }`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${
                        analysis?.isSpam ? 'bg-red-100 text-red-600 dark:bg-red-900/40' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'
                      }`}>
                        {analysis?.isSpam ? 'Security Alert' : 'Verified Safe'}
                      </div>
                      <h2 className={`text-4xl font-black italic tracking-tight ${
                        analysis?.isSpam ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {analysis?.isSpam ? 'SPAM' : 'NOT SPAM'}
                      </h2>
                    </div>
                    {analysis?.isSpam ? (
                      <AlertCircle className="text-red-600" size={48} />
                    ) : (
                      <CheckCircle2 className="text-emerald-600" size={48} />
                    )}
                  </div>

                  {/* Score Visualization */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Spam Probability</span>
                      <span className={`text-2xl font-black ${analysis?.isSpam ? 'text-red-600' : 'text-emerald-600'}`}>
                        {analysis?.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis?.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${analysis?.isSpam ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={copyResult}
                    className="w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Analysis Report'}
                  </button>
                </div>

                {/* Keywords Analysis */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-5 opacity-40 flex items-center gap-2">
                    <ShieldAlert size={14} /> Trigger Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.detectedKeywords.length ? (
                      analysis.detectedKeywords.map(word => (
                        <span key={word} className="px-3.5 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold border border-red-200/50 dark:border-red-900/50">
                          {word}
                        </span>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">Clean content - no triggers found.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Preview with Highlights */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-5 opacity-40 flex items-center gap-2">
                    <Info size={14} /> Content Inspection
                  </h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {renderHighlightedMessage()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="mt-12 py-8 w-full max-w-5xl border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 text-[10px] font-bold uppercase tracking-widest">
        <p>© 2026 EmailGuard Pro Security Systems</p>
        <div className="flex gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Docs</span>
        </div>
      </footer>
    </div>
  );
}
