import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function CredentialVerifyPage() {
  const { code } = useParams<{ code: string }>();
  const [state, setState] = useState<'loading' | 'found' | 'notfound'>('loading');
  const [credential, setCredential] = useState<any>(null);

  useEffect(() => {
    if (!code) { setState('notfound'); return; }
    api.get(`/digital-credentials/verify/${code}/`)
      .then((res: any) => { setCredential(res); setState('found'); })
      .catch(() => setState('notfound'));
  }, [code]);

  return (
    <div className="min-h-screen bg-[#06080E] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#C8FF00] animate-spin" />
            <p className="text-white/60 text-sm">Verificando credencial…</p>
          </div>
        )}

        {state === 'notfound' && (
          <div className="bg-white/[0.03] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <XCircle className="w-14 h-14 text-red-400" />
            <h1 className="text-xl font-bold">Credencial no encontrada</h1>
            <p className="text-white/55 text-sm">El código de verificación no corresponde a ninguna credencial activa.</p>
          </div>
        )}

        {state === 'found' && credential && (
          <div className="bg-white/[0.03] border border-[#C8FF00]/20 rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#C8FF00]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8FF00]/60 mb-1">Credencial Verificada</p>
              <h1 className="text-2xl font-extrabold">{credential.player_name}</h1>
              <p className="text-white/55 text-sm mt-1">{credential.state_affiliation || ''}</p>
            </div>
            <div className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl divide-y divide-white/[0.05]">
              {[
                ['Número', credential.credential_number || credential.id],
                ['NTPR', credential.nrtp_level || '—'],
                ['Club', credential.club_name || 'Independiente'],
                ['Afiliación', credential.affiliation_status === 'active' ? 'Activa' : 'Inactiva'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-white/50">{label}</span>
                  <span className="font-semibold text-white/90">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#C8FF00]/60" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">FEDMEX Pickleball</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
