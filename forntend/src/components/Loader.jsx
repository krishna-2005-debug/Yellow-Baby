
import { Baby } from 'lucide-react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-200 animate-bounce">
          <Baby className="w-7 h-7 text-white" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-yellow-300/40 animate-ping" />
      </div>
      <p className="text-sm font-medium text-gray-400">{text}</p>
    </div>
  );
}
