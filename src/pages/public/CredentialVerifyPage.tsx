import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { CredentialHoloCard } from '@/components/credentials/CredentialHoloCard';

export default function CredentialVerifyPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<'loading' | 'found' | 'notfound'>('loading');
  const [credential, setCredential] = useState<any>(null);

  useEffect(() => {
    if (!code) { setState('notfound'); return; }
    const url = `/digital-credentials/verify/${code}${token ? `?token=${token}` : ''}`;
    api.get<any>(url)
      .then((res: any) => {
        const cred = res?.data?.credential ?? res?.data ?? res;
        if (!cred) { setState('notfound'); return; }
        setCredential(cred);
        setState('found');
      })
      .catch(() => setState('notfound'));
  }, [code, token]);

  return (
    <div className="min-h-screen bg-[#06080E] text-white flex flex-col items-center justify-center p-6">

      {state === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#C8FF00] animate-spin" />
          <p className="text-white/60 text-sm">Verificando credencial…</p>
        </div>
      )}

      {state === 'notfound' && (
        <div className="w-full max-w-md bg-white/[0.03] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <XCircle className="w-14 h-14 text-red-400" />
          <h1 className="text-xl font-bold">Credencial no encontrada</h1>
          <p className="text-white/55 text-sm">El código de verificación no corresponde a ninguna credencial activa.</p>
        </div>
      )}

      {state === 'found' && credential && (
        <div className="w-full max-w-[380px] flex flex-col items-center gap-6">
          {/* Verified badge */}
          <div className="inline-flex items-center gap-2 bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.2] rounded-full px-4 py-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
            <span className="font-sans font-bold text-[11px] tracking-[2px] text-[#C8FF00] uppercase">
              Credencial Verificada · FEDMEX
            </span>
          </div>

          {/* The full credential card */}
          <div className="w-full">
            <CredentialHoloCard credential={credential} />
          </div>
        </div>
      )}
    </div>
  );
}
