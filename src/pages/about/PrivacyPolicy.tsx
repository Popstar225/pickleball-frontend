import { Shield, Database, FileText, UserCheck, Lock, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import logoFedmex from '@/assets/logo-fedmex.png';

const sections = [
  {
    icon: Shield,
    title: 'Responsable del Tratamiento',
    body: 'La FEDMEX PICKLEBALL es responsable de recabar sus datos personales, el uso que se le dé a los mismos y de su protección. La FMP manifiesta que su información personal será tratada con absoluta confidencialidad; de acuerdo a lo previsto en la Ley Federal de Protección de Datos Personales en Posesión de particulares, en el Capítulo I, artículo 2 y Capítulo II, artículos 15, 16 y 17; para los propósitos competentes a dicha Federación como lo son el registro de Jugadores, Entrenadores, Directivos, Jueces y otros; la organización y promoción del Pickleball en el país así como en el extranjero a través de competencias y eventos y la capacitación continua de sus afiliados.',
  },
  {
    icon: Database,
    title: 'Datos Recabados',
    body: 'Los datos recabados por la FEDMEX PICKLEBALL podrán ser de forma directa; los que se proporcionen personalmente, o indirecta; telefónicamente y a través de nuestra página de Internet o cualquier otro medio electrónico reconocido por la FMP. La información solicitada pueden ser la siguiente: nombre, domicilio, escolaridad, teléfono, correo electrónico, función, modalidad, curp, fecha de nacimiento, nacionalidad, sexo, país de nacimiento e imagen dentro o fuera de la práctica del deporte.',
  },
  {
    icon: FileText,
    title: 'Uso de los Datos',
    body: 'Los datos personales que se indican, serán incorporados a las bases de datos de la FEDMEX Pickleball, A.C., para la gestión interna al Sistema de Registro y los programas propios de misma Federación.',
  },
  {
    icon: UserCheck,
    title: 'Consentimiento',
    body: 'El consentimiento del titular sobre los datos anteriormente citados, es necesario para la formalización del ingreso al Sistema de Registro.',
  },
  {
    icon: Lock,
    title: 'Aceptación',
    body: 'El interesado acepta que la realización del registro de sus datos personales en el sistema de registro de la FEDMEX PICKLEBALL, implica su consentimiento de lo descrito en los párrafos anteriores.',
  },
  {
    icon: Mail,
    title: 'Derechos ARCO',
    body: 'Usted tiene derecho de acceder, rectificar, y cancelar sus datos personales, así como de oponerse al tratamiento de los mismos o revocar el consentimiento que para tal fin nos haya otorgado. Para el ejercicio de sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO), cuando sea legalmente procedente, puede enviar su solicitud a nuestras oficinas vía electrónica a través de la dirección contacto@fmpickleball.mx donde con gusto le atenderemos.',
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 sm:gap-10 md:gap-12 lg:gap-16">
              {/* Text */}
              <div className="lg:w-3/5 space-y-4 sm:space-y-5 md:space-y-6">
                <div className="animate-fade-in">
                  <span className="inline-flex items-center text-primary text-sm sm:text-base font-semibold uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-primary/20">
                    Aviso Legal
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                    Aviso de
                    <span className="block text-primary mt-1 sm:mt-2">Privacidad</span>
                  </h1>
                  <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
                    Conoce cómo la FEDMEX PICKLEBALL protege y gestiona tus datos personales conforme a la Ley Federal de Protección de Datos.
                  </p>
                </div>
              </div>

              {/* Logo card */}
              <div className="lg:w-2/5">
                <div className="relative group">
                  <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-2xl sm:rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 sm:p-8 md:p-10">
                      <img
                        src={logoFedmex}
                        alt="FEDMEX Pickleball"
                        className="w-full h-auto object-contain max-w-[280px] sm:max-w-[320px] md:max-w-[360px] mx-auto"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-primary text-white px-4 py-2 sm:px-5 sm:py-3 rounded-xl shadow-xl">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold">6</div>
                    <div className="text-xs sm:text-sm opacity-90">Derechos ARCO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Policy Sections ──────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
              <div className="mb-4 sm:mb-5">
                <span className="inline-flex items-center text-primary text-sm sm:text-base font-semibold uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-primary/20">
                  Protección de Datos
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                Tus datos, nuestra responsabilidad
              </h2>
              <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                La FEDMEX PICKLEBALL se compromete a resguardar tu información de acuerdo a la legislación mexicana vigente.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-8 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700/50 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
                  >
                    {/* Glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    {/* Shine */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>

                    <div className="relative p-5 sm:p-6 md:p-8 h-full flex flex-col">
                      {/* Number badge */}
                      <div className="absolute top-4 right-4 text-[11px] font-bold text-white/20 tabular-nums">
                        0{index + 1}
                      </div>

                      {/* Icon */}
                      <div className="mb-4 sm:mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800 border border-slate-700/50 text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-lime-500 group-hover:text-white transition-all duration-500">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 space-y-3 sm:space-y-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-500">
                          {section.title}
                        </h3>
                        <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                          {section.body}
                        </p>
                      </div>

                      {/* Bottom border */}
                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50 group-hover:border-primary/50 transition-colors duration-500" />
                    </div>

                    {/* Border highlight */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-xl sm:rounded-2xl transition-all duration-500 pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {/* ── Contact CTA ────────────────────────────────────────────────── */}
            <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 bg-lime-500/10 rounded-full blur-3xl" />

                <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center">
                  <div className="mb-4 sm:mb-6">
                    <span className="inline-flex items-center text-primary text-sm sm:text-base font-semibold uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-primary/30">
                      Ejercicio de Derechos ARCO
                    </span>
                  </div>

                  <div className="mb-6 sm:mb-8 md:mb-10 space-y-3 sm:space-y-4">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      ¿Quieres ejercer tus derechos?
                    </h3>
                    <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                      Accede, rectifica, cancela u oponte al uso de tus datos personales contactándonos directamente.
                    </p>
                  </div>

                  <a
                    href="mailto:contacto@fmpickleball.mx"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    contacto@fmpickleball.mx
                  </a>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-slate-300 text-xs sm:text-sm mt-8 sm:mt-10">
                    {['Acceso', 'Rectificación', 'Cancelación', 'Oposición'].map((right, i) => (
                      <div key={right} className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                          <span>{right}</span>
                        </div>
                        {i < 3 && <div className="hidden sm:block w-px h-4 bg-slate-700" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
