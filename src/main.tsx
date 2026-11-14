import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { startSync } from './supabase.js';
import './index.css';

startSync();

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: String(error?.message || error || 'Unknown error') };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
            🛠️
          </div>
          <h1 className="text-xl font-black mb-2">خدّام ديزاد — Khadam DZ</h1>
          <p className="text-xs text-slate-300 mb-4 max-w-md">{this.state.errorMsg}</p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm cursor-pointer"
          >
            إعادة تشغيل التطبيق الآن 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}
