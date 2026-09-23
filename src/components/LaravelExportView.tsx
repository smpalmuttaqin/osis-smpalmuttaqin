import React, { useState } from 'react';
import { LARAVEL_CODE_FILES, CodeFile } from '../data/laravelCodeSnippets';
import { Copy, Check, FileCode, FolderArchive, Layers } from 'lucide-react';

export const LaravelExportView: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(LARAVEL_CODE_FILES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentFile = LARAVEL_CODE_FILES.find((f) => f.id === selectedFileId) || LARAVEL_CODE_FILES[0];

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(LARAVEL_CODE_FILES.map((f) => f.category)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Dokumentasi & Arsitektur Kode
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Arsip Kode Sumber Laravel & Supabase PostgreSQL
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh berkas Controller, Model, Migration DDL, Middleware peran, Routes, dan Blade Views siap diintegrasikan.
          </p>
        </div>

        <button
          onClick={() => handleCopy(currentFile.content, 'current-view')}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          {copiedId === 'current-view' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>Salin Berkas Ini</span>
        </button>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left File Tree */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Struktur Proyek
            </h4>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const filesInCat = LARAVEL_CODE_FILES.filter((f) => f.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                    {cat}
                  </span>
                  {filesInCat.map((file) => {
                    const isSelected = file.id === selectedFileId;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left truncate ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 lg:col-span-3 flex flex-col overflow-hidden text-slate-200">
          {/* Viewer Toolbar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono text-emerald-400 font-semibold truncate">
                {currentFile.path}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">({currentFile.language})</span>
            </div>

            <button
              onClick={() => handleCopy(currentFile.content, currentFile.id)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors"
            >
              {copiedId === currentFile.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto selection:bg-emerald-800 selection:text-white">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
