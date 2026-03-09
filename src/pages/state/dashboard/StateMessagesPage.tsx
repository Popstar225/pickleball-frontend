/**
 * State Messages Page
 * Placeholder for state-level messaging functionality.
 */

import { MessageSquare } from 'lucide-react';

export default function StateMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Mensajes</h2>
        <p className="text-white/50 text-sm mt-1">Comunicaciones de la delegación estatal</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/40 font-medium">Sin mensajes</p>
        <p className="text-white/25 text-sm text-center max-w-xs">
          Los mensajes de la federación y de los clubes del estado aparecerán aquí.
        </p>
      </div>
    </div>
  );
}
