import React from 'react';
import { motion } from 'motion/react';
import { WorkplaceDoc } from '../types';
import { X, FileText, Code2, Table, FileCheck, Copy, Check, Bookmark, Minimize2 } from 'lucide-react';

interface DocumentViewerModalProps {
  doc: WorkplaceDoc | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  doc,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!doc) return null;

  const handleCopyText = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'doc': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'json': return <Code2 className="w-4 h-4 text-emerald-600" />;
      case 'csv': return <Table className="w-4 h-4 text-amber-600" />;
      case 'pdf': return <FileCheck className="w-4 h-4 text-rose-600" />;
      default: return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      {/* Main Document Window with Craft Paper Aesthetic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-stone-100/90 backdrop-blur-md rounded-[32px] sm:rounded-[36px] p-3 sm:p-4 shadow-[0_28px_70px_rgba(0,0,0,0.18)] border border-stone-200/80 flex flex-col overflow-hidden"
      >
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-white/80 rounded-2xl mb-3 border border-stone-200/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-2xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-2xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-2xs inline-block" />
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-50 shadow-2xs border border-stone-200/60 text-[11px] font-medium text-stone-800">
            <span className="text-stone-900 font-bold font-mono">before.choosing</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-700 font-bold truncate max-w-[200px] sm:max-w-xs">{doc.title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyText}
              className="craft-btn-secondary text-xs px-3 py-1 font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? '已复制要点' : '复制内容'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-900 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Paper Document Canvas inside Browser Window */}
        <div className="flex-1 bg-white rounded-[26px] p-5 sm:p-8 shadow-xs border border-stone-200/80 overflow-y-auto space-y-6 text-stone-800 custom-scrollbar">
          
          {/* Header of Paper Document */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-stone-100 shadow-2xs">
                {getDocIcon(doc.fileType)}
              </div>
              <div>
                <h3 className="font-bold text-stone-950 text-base sm:text-lg font-serif craft-serif">{doc.title}</h3>
                <p className="text-xs text-stone-500 font-mono">大小: {doc.fileSize} · 分类: {doc.tag}</p>
              </div>
            </div>
          </div>

          {/* Summary Callout block */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3 shadow-2xs">
            <Bookmark className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-stone-900 mb-0.5">文档摘要与研读指引：</p>
              <p className="text-xs text-stone-700 leading-relaxed font-sans">{doc.summary}</p>
            </div>
          </div>

          {/* Render structured blocks */}
          {doc.content.map((block, idx) => {
            if (block.type === 'heading') {
              return (
                <h4 key={idx} className="text-base sm:text-lg font-bold text-stone-950 pt-2 border-b border-stone-100 pb-2 font-serif craft-serif">
                  {block.text}
                </h4>
              );
            }
            if (block.type === 'paragraph') {
              return (
                <p key={idx} className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'bullet') {
              return (
                <ul key={idx} className="space-y-2 text-xs sm:text-sm text-stone-700 pl-4 list-disc leading-relaxed font-sans">
                  {block.items?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'callout') {
              return (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border-l-4 border-stone-900 text-xs sm:text-sm text-stone-800 italic leading-relaxed font-serif">
                  “{block.text}”
                </div>
              );
            }
            if (block.type === 'code') {
              return (
                <div key={idx} className="rounded-2xl bg-stone-900 p-4 text-stone-100 text-xs font-mono overflow-x-auto leading-relaxed border border-stone-800 shadow-inner">
                  <pre>{block.text}</pre>
                </div>
              );
            }
            if (block.type === 'table' && block.tableData) {
              return (
                <div key={idx} className="overflow-x-auto border border-stone-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold">
                      <tr>
                        {block.tableData.headers.map((h, i) => (
                          <th key={i} className="p-3 font-mono">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {block.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-stone-50/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-stone-700 font-mono">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            return null;
          })}

          {/* Bottom Close */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-400 font-mono">已载入完整知识库，可返回PRD工作台继续撰写</span>
            <button
              onClick={onClose}
              className="craft-btn-black px-4 py-2 text-xs flex items-center gap-1 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>返回工作台</span>
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
