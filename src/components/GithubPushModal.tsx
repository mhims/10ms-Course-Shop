import React, { useState } from 'react';
import {
  X,
  Github,
  GitBranch,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Terminal,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface GithubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportCoursesJSON: () => string;
  onSuccess?: () => void;
}

export const GithubPushModal: React.FC<GithubPushModalProps> = ({
  isOpen,
  onClose,
  exportCoursesJSON,
  onSuccess,
}) => {
  const [token, setToken] = useState(() => localStorage.getItem('10ms_gh_pat') || '');
  const [repo, setRepo] = useState(() => localStorage.getItem('10ms_gh_repo') || 'mhims/mhims.github.io');
  const [showToken, setShowToken] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handlePush = async () => {
    if (!token.trim()) {
      setStatus({
        type: 'error',
        message: 'দয়া করে আপনার GitHub Personal Access Token দিন!',
      });
      return;
    }

    const cleanRepo = repo.trim();
    if (!cleanRepo || !cleanRepo.includes('/')) {
      setStatus({
        type: 'error',
        message: 'দয়া করে সঠিক রিপোজিটরি নাম দিন (যেমন: mhims/mhims.github.io)',
      });
      return;
    }

    setIsPushing(true);
    setStatus({
      type: 'loading',
      message: 'গিটহাবে সরাসরি ডেটা পাঠানো হচ্ছে ও লাইভ করা হচ্ছে...',
    });

    localStorage.setItem('10ms_gh_pat', token.trim());
    localStorage.setItem('10ms_gh_repo', cleanRepo);

    try {
      const jsonContent = exportCoursesJSON();
      // Target paths for GitHub Pages root and docs/
      const targetPaths = ['docs/courses.json', 'public/courses.json', 'courses.json'];

      // Encode UTF-8 content to base64 safely
      const utf8Bytes = new TextEncoder().encode(jsonContent);
      let binaryStr = '';
      utf8Bytes.forEach((b) => (binaryStr += String.fromCharCode(b)));
      const base64Content = btoa(binaryStr);

      for (const filePath of targetPaths) {
        const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;
        let sha: string | undefined = undefined;

        try {
          const getRes = await fetch(apiUrl, {
            headers: {
              Authorization: `token ${token.trim()}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });
          if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
          }
        } catch {
          // File might not exist yet, continue
        }

        const putRes = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            Authorization: `token ${token.trim()}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update courses from 10MS Admin Panel [skip ci] - ${new Date().toLocaleTimeString()}`,
            content: base64Content,
            sha: sha,
          }),
        });

        if (!putRes.ok) {
          const errData = await putRes.json().catch(() => ({}));
          throw new Error(errData.message || `গিটহাবে ${filePath} ফাইল আপলোডে সমস্যা হয়েছে (${putRes.status})`);
        }
      }

      setStatus({
        type: 'success',
        message: 'আলহামদুলিল্লাহ! সরাসরি গিটহাবে সফলভাবে পুশ সম্পন্ন হয়েছে। আগামী ১-২ মিনিটের মধ্যে 10mscourse.shop সাইটে সব আপডেট লাইভ দেখতে পাবেন!',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('GitHub Push error:', err);
      setStatus({
        type: 'error',
        message: `পুশ ব্যর্থ হয়েছে: ${err.message || 'টোকেনের মেয়াদ বা repo পারমিশন চেক করুন'}`,
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopyGitCommand = () => {
    const cmd = `git add . && git commit -m "Update courses from Admin Panel" && git push`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportCoursesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-md">
              <Github className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>সরাসরি GitHub-এ পুশ করুন</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  Live Deploy
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                এক ক্লিকে মূল ওয়েবসাইট (10mscourse.shop)-এ কোর্সের আপডেট লাইভ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {status.type !== 'idle' && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-semibold transition-all ${
              status.type === 'loading'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : status.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            {status.type === 'loading' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />}
            {status.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {status.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            <div className="flex-1 leading-relaxed">{status.message}</div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  GitHub Personal Access Token (PAT)
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  {showToken ? 'লুকান' : 'দেখান'}
                </button>
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>একবার দিলেই ব্রাউজারে সেভ থাকবে</span>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-rose-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>টোকেন পাবেন কোথায়?</span>
                </button>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                GitHub Repository (ইউজারনেম/রিপো-নাম)
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="যেমন: mhims/mhims.github.io"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                আপনার GitHub Pages রিপোজিটরির নাম
              </p>
            </div>
          </div>

          {/* Quick Guide Accordion */}
          {showGuide && (
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2 text-xs border border-slate-800 animate-in fade-in">
              <div className="font-bold text-rose-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>৩০ সেকেন্ডে GitHub Personal Token তৈরি করার সহজ নিয়ম:</span>
                </span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=10mscourse-shop-admin"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] transition-colors"
                >
                  <span>সরাসরি লিঙ্ক খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pt-1 leading-relaxed">
                <li>উপরের লিংকে ক্লিক করুন (GitHub-এ লগইন থাকা অবস্থায়)।</li>
                <li>নোট হিসেবে নাম দেওয়া থাকবে এবং <strong className="text-white">repo</strong> অপশনে অটো টিক চিহ্ন থাকবে।</li>
                <li>নিচে স্ক্রল করে সবুজ রঙের <strong className="text-emerald-400">Generate token</strong> বাটনে চাপ দিন।</li>
                <li>টোকেনটি কপি করে ওপরের ঘরে পেস্ট করে দিন। ব্যাস, আর কখনো দিতে হবে না!</li>
              </ol>
            </div>
          )}

          {/* Action: Direct GitHub Push Button */}
          <button
            type="button"
            disabled={isPushing}
            onClick={handlePush}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
          >
            {isPushing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>গিটহাবে পাঠানো হচ্ছে...</span>
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                <span>এক ক্লিকে গিটহাবে পুশ করুন (Push to Live)</span>
              </>
            )}
          </button>
        </div>

        {/* Divider with alternative options */}
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            বিকল্প পদ্ধতি (Alternative Push Methods)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Terminal Command */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  <span>টার্মিনাল থেকে পুশ</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyGitCommand}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd ? 'কপি হয়েছে!' : 'কমান্ড কপি'}</span>
                </button>
              </div>
              <code className="block p-2 bg-slate-900 text-emerald-400 rounded-lg text-[10px] font-mono select-all overflow-x-auto whitespace-nowrap">
                git add . && git commit -m "Update courses" && git push
              </code>
            </div>

            {/* JSON Download */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>courses.json ব্যাকআপ</span>
                </span>
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>ডাউনলোড</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                সম্পূর্ণ কোর্স ডেটা এক ক্লিকে JSON ফাইল হিসেবে ডাউনলোড করে ব্যাকআপ রাখুন।
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
