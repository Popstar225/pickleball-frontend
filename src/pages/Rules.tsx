import { FileText, Download, Sparkles, Shield, BookOpen, Award } from 'lucide-react';
import Director from '../assets/images/_DSC7870.png';

import Equipment from '../assets/images/rules/equipment.png';
import Technical from '../assets/images/rules/technical.png';
import Sports from '../assets/images/rules/sports.png';

// Import the PDF files directly
import reglamentoEquipamiento from '@/assets/documents/Reglamento del equipamiento.pdf';
import reglamentoDeportivo from '@/assets/documents/Reglamento deportivo.pdf';
import reglamentoTecnico from '@/assets/documents/Reglamento técnico.pdf';

const rulesDocuments = [
  {
    id: 1,
    title: 'Reglas Técnicas',
    description: 'Reglas oficiales del juego de Pickleball',
    fileUrl: reglamentoTecnico, // Use the imported URL directly
    fileName: 'Reglamento técnico.pdf',
    icon: BookOpen,
    color: 'primary',
    image: Technical,
  },
  {
    id: 2,
    title: 'Reglas de Equipamiento',
    description: 'Especificaciones de paletas, pelotas y equipo aprobado',
    fileUrl: reglamentoEquipamiento, // Use the imported URL directly
    fileName: 'Reglamento del equipamiento.pdf',
    icon: Shield,
    color: 'lime-500',
    image: Equipment,
  },
  {
    id: 3,
    title: 'Reglamento Deportivo',
    description: 'Normativas para competencias y torneos oficiales',
    fileUrl: reglamentoDeportivo, // Use the imported URL directly
    fileName: 'Reglamento deportivo.pdf',
    icon: Award,
    color: 'primary',
    image: Sports,
  },
];

const Rules = () => {
  const handleDownload = (fileUrl: string, downloadName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block animate-fade-in">
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Documentación Oficial</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                    <span className="block bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                      Reglamentos
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                    Documentos oficiales y reglamentos de la Federación Mexicana de Pickleball
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3</div>
                    <div className="text-sm text-white/60">Documentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
                    <div className="text-sm text-white/60">Oficial</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2025</div>
                    <div className="text-sm text-white/60">Actualizado</div>
                  </div>
                </div>
              </div>

              <div className="relative group w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-none mx-auto lg:mx-0 flex justify-center">
                <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-lg sm:shadow-xl md:shadow-2xl transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-700 overflow-hidden border-2 border-primary/20 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px]">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-lime-500/30" />
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>

                  <div className="relative z-10 rounded-2xl overflow-hidden w-full h-full">
                    <img
                      src={Director}
                      alt="Entrenador de Pickleball FEDMEX"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Liderazgo Profesional
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-1">Coaching de Elite</h3>
                      <p className="text-xs sm:text-sm text-white/80">
                        Formando campeones mexicanos
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-primary/30 rounded-tr-2xl sm:rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-lime-500/30 rounded-bl-2xl sm:rounded-bl-3xl" />
                </div>

                <div className="absolute -top-2 sm:-top-3 md:-top-4 -left-2 sm:-left-3 md:-left-4 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-primary/30 rounded-full blur-xl sm:blur-2xl animate-pulse" />
                <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 -right-2 sm:-right-3 md:-right-4 w-14 sm:w-20 md:w-24 h-14 sm:h-20 md:h-24 bg-lime-500/20 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>

        {/* Documents Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto space-y-8">
              {rulesDocuments.map((doc, index) => (
                <div key={doc.id} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
                      {/* Image Section */}
                      <div className="relative group/img overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl h-40 sm:h-44 md:h-56 lg:h-64">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-lime-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 z-10" />
                        <img
                          src={doc.image}
                          alt={doc.title}
                          className="w-full h-full object-cover transform group-hover/img:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-col justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6">
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-${doc.color}/20 backdrop-blur-sm border border-${doc.color}/30 flex items-center justify-center text-${doc.color} flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-${doc.color} group-hover:text-slate-900 transition-all duration-500 shadow-lg shadow-${doc.color}/0 group-hover:shadow-${doc.color}/50`}
                          >
                            <doc.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-500">
                              {doc.title}
                            </h3>
                            <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed group-hover:text-slate-300 transition-colors duration-500">
                              {doc.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span>Formato PDF</span>
                          </div>

                          <button
                            onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                            className="group/btn relative inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold text-sm sm:text-base px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl hover:shadow-lg sm:hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden whitespace-nowrap"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover/btn:translate-y-1 transition-transform duration-500 flex-shrink-0" />
                            <span className="relative z-10">Descargar PDF</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-3xl blur-3xl opacity-30" />
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden p-12 md:p-16 text-center">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124, 252, 0, 0.3) 1px, transparent 0)`,
                    backgroundSize: '32px 32px',
                  }}
                />

                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-primary mx-auto">
                    <Shield className="w-8 h-8" />
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    ¿Necesitas Ayuda?
                  </h3>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Si tienes dudas sobre los reglamentos o necesitas información adicional, no
                    dudes en contactarnos.
                  </p>
                  <a
                    href="/contact"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-10 py-5 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden relative"
                  >
                    <span className="relative z-10">Contáctanos</span>
                    <svg
                      className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Add Footer if needed */}
      {/* <Footer /> */}
    </div>
  );
};

export default Rules;
