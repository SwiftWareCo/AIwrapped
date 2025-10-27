import React, { useState, useCallback } from 'react';
import { Platform } from '../types';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  onFileProcess: (content: string) => void;
  isLoading: boolean;
}

const ExportInstructions: React.FC<{ platform: Platform }> = ({ platform }) => {
  if (platform === 'ChatGPT') {
    return (
      <div className="mt-4 text-left text-sm text-gray-400 space-y-2 p-4 bg-gray-900/50 rounded-lg">
        <p className="font-semibold text-gray-200">How to get your ChatGPT data:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Log in to <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">chat.openai.com</a>.</li>
          <li>Click your name in the bottom-left corner, then go to <strong>Settings</strong>.</li>
          <li>Select <strong>Data Controls</strong>, then click <strong>Export data</strong>.</li>
          <li>Confirm the export. You'll get an email with a link to download a <code>.zip</code> file.</li>
          <li>Unzip the file and upload the <strong>conversations.json</strong> file here.</li>
        </ol>
      </div>
    );
  }

  if (platform === 'Claude') {
    return (
      <div className="mt-4 text-left text-sm text-gray-400 space-y-2 p-4 bg-gray-900/50 rounded-lg">
        <p className="font-semibold text-gray-200">How to get your Claude data:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Log in to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">claude.ai</a>.</li>
          <li>Click your profile icon in the bottom-left corner, then go to <strong>Settings</strong>.</li>
          <li>Select <strong>Privacy</strong>, then click <strong>Export data</strong>.</li>
          <li>Confirm the export. You'll get an email with a link to download a <code>.zip</code> file.</li>
          <li>Unzip the file and upload the <strong>conversations.json</strong> file here.</li>
        </ol>
      </div>
    );
  }

  return null;
};


const FileUpload: React.FC<FileUploadProps> = ({ platform, setPlatform, onFileProcess, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileProcess(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file.');
    }
  }, [onFileProcess]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      className="w-full max-w-xl mx-auto p-6 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm shadow-lg"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Upload Your Conversation History</h2>
        <p className="text-gray-400 mt-2">Don't worry, your data is processed entirely in your browser and is never uploaded to any servers.</p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">1. Select AI Platform</label>
        <div className="flex bg-gray-900 rounded-lg p-1">
          {(['ChatGPT', 'Claude'] as Platform[]).map(p => (
            <button
              key={p}
              onClick={() => {
                setPlatform(p);
                setShowInstructions(false);
              }}
              className={`w-1/2 py-2.5 text-sm font-semibold rounded-md transition-colors ${platform === p ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">2. Upload JSON Export</label>
            <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
                <Info size={16} />
                {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
            </button>
        </div>
        
        {showInstructions && <ExportInstructions platform={platform} />}

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-purple-500 bg-gray-700/50' : 'border-gray-600 bg-gray-900/50 hover:bg-gray-800/50'}`}
        >
          <input
            id="file-upload"
            type="file"
            accept=".json"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <p className="text-gray-400">
              {isDragging ? 'Drop it like it\'s hot!' : 'Drag & drop your file here'}
            </p>
            <p className="text-gray-500 text-sm">or</p>
            <p className="font-semibold text-purple-400">Click to browse</p>
          </label>
        </div>
      </div>
    </motion.div>
  );
};

export default FileUpload;