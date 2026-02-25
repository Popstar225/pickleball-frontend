const sponsors = [
  { name: 'SOCO PWA', subtitle: 'Socio Premium' },
  { name: 'SOCO PWA', subtitle: 'Socio Oro' },
  { name: 'SOCO PWA', subtitle: 'Socio Plata' },
];

const SponsorsSection = () => {
  const handleSponsorClick = (sponsorName: string) => {
    console.log(`Sponsor clicked: ${sponsorName} - navigate to sponsor page or external link`);
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-foreground text-center mb-8 sm:mb-10">
          PATROCINADORES
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group"
              onClick={() => handleSponsorClick(sponsor.name)}
            >
              <div className="w-28 h-16 sm:w-32 sm:h-20 bg-muted rounded-lg flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                <span className="font-display text-base sm:text-lg text-foreground text-center px-2">
                  {sponsor.name}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground text-center">
                {sponsor.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
