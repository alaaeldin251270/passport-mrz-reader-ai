import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ResultRowProps {
  label: string;
  value: string;
}

const ResultRow: React.FC<ResultRowProps> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={value}
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 font-mono text-sm sm:text-base"
        />
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center px-4 py-2 rounded font-bold text-white transition-all duration-200 ${
            copied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title="نسخ النص"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ResultRow;