import React, { useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface Props {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const UploadPortal: React.FC<Props> = ({ onUpload, isProcessing }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="relative group cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
      />
      <div className="w-full h-64 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-amber-200/50 group-hover:bg-slate-800/30 bg-slate-900/50 backdrop-blur-sm">
        {isProcessing ? (
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-amber-200 animate-spin mx-auto" />
            <p className="text-amber-100 font-serif text-lg animate-pulse">Opening the Rift...</p>
          </div>
        ) : (
          <div className="text-center space-y-3 p-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-600 group-hover:border-amber-200 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-200" />
            </div>
            <h3 className="text-xl font-serif text-slate-200 group-hover:text-white">Open a New Shard</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Upload an image to let the universe generate a new world, identity, and destiny for you.
            </p>
          </div>
        )}
      </div>
      
      {/* Particle Effects Decoration */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-200 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  );
};

export default UploadPortal;
