import logoFedmex from '@/assets/logo-fedmex.png';
import logoConade from '@/assets/logo-conade.jpg';
import logoUwpf from '@/assets/logo-uwpf.png';

const partners = [
  { name: 'FEDMEX Pickleball', subtitle: 'Federación Oficial', logo: logoFedmex },
  { name: 'CONADE', subtitle: 'Comisión Nacional Deportiva', logo: logoConade },
  { name: 'UWPF', subtitle: 'Federación Mundial de Pickleball', logo: logoUwpf },
];

const PartnersSection = () => {
  const handlePartnerClick = (partnerName: string) => {
    console.log(`Partner clicked: ${partnerName} - navigate to partner page or external link`);
  };

  const repeatedPartners = Array.from({ length: 2 }, (_, i) =>
    partners.map((partner, index) => ({ ...partner, uniqueKey: `${partner.name}-${i}-${index}` })),
  ).flat();

  return (
    <section className="bg-card py-4 sm:py-6 md:py-8 lg:py-10 border-y border-border w-full overflow-hidden">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 justify-center items-center">
          {repeatedPartners.map((partner) => (
            <div
              key={partner.uniqueKey}
              className="flex items-center opacity-70 hover:opacity-100 cursor-pointer group flex-shrink transition-opacity duration-300"
              onClick={() => handlePartnerClick(partner.name)}
            >
              <div className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
