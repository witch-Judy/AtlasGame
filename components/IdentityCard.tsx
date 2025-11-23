
import React from 'react';
import { Identity } from '../types';
import { User, Shield, Zap, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  identity: Identity;
  language: 'en' | 'zh';
}

const IdentityCard: React.FC<Props> = ({ identity, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-amber-200/20 p-6 rounded-lg shadow-xl max-w-sm w-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-amber-100 font-serif text-2xl tracking-wide">{identity.title}</h3>
        <Sparkles className="text-amber-300 w-5 h-5 animate-pulse" />
      </div>
      
      <div className="space-y-4 text-sm text-slate-300">
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 mt-1 text-slate-400" />
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">{t.role}</span>
            <span className="text-slate-200">{identity.role}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 mt-1 text-amber-400/80" />
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">{t.ability}</span>
            <span className="text-amber-100">{identity.ability}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 mt-1 text-rose-400/80" />
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">{t.vulnerability}</span>
            <span className="text-rose-100">{identity.weakness}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700 italic text-slate-400 font-serif">
          "{identity.outfit}"
        </div>
      </div>
    </div>
  );
};

export default IdentityCard;
