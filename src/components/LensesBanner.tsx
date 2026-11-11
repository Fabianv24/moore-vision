
import '../styles/lenses-banner.css';

type Advertisement = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  mediaSrc: string;
};

const advertisements: Advertisement[] = [
  {
    id: 'fotosensibles',
    eyebrow: 'TECNOLOGÍA QUE SE ADAPTA',
    title: 'LENTES FOTOSENSIBLES',
    description:
      'Lentes que se oscurecen al exponerse a la luz UV y se aclaran en interiores.',
    mediaSrc: '/lentes/fotosensible.jpg',
  },
  {
    id: 'blue-block',
    eyebrow: 'TECNOLOGÍA PARA TU DÍA A DÍA',
    title: 'LENTES CON FILTRO BLUE BLOCK',
    description:
      'Una alternativa con filtro para parte de la luz azul-violeta.',
    mediaSrc: '/lentes/blueblock.webp',
  },
  {
    id: 'transitions',
    eyebrow: 'INNOVACIÓN Y ESTILO',
    title: 'TRANSITIONS GEN S',
    description:
      'Descubre la tecnología fotocromática Transitions GEN S.',
    mediaSrc: '/lentes/transitions.jpg',
  },
];

const getWhatsAppLink = (title: string) => {
  const phone = '573022476117';
  const message = `Hola, quisiera recibir información sobre ${title}. ¿Me pueden asesorar?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

function LensesBanner() {
  return (
    <section
      className="lenses-marquee-section"
      id="lentes"
      aria-label="Tecnologías disponibles en lentes"
    >
      <div className="lenses-marquee-heading">
        <span className="lenses-marquee-eyebrow">
          MOORE VISION · COMPLETA TUS GAFAS
        </span>

        <h2>
          La tecnología también
          <br />
          está en tus lentes.
        </h2>

        <p>
          Descubre opciones para complementar tu montura.
        </p>
      </div>

      <div className="lens-feature-grid">
        {advertisements.map((ad, index) => (
          <a
            key={ad.id}
            href={getWhatsAppLink(ad.title)}
            target="_blank"
            rel="noopener noreferrer"
            className={`lens-feature-card lens-feature-card--${ad.id}`}
          >
            <div className="lens-feature-media">
              <img src={ad.mediaSrc} alt={ad.title} />
            </div>

            <div className="lens-feature-overlay"></div>

            <div className="lens-feature-topline">
              <span>MOORE VISION</span>
              <span>TECNOLOGÍA ÓPTICA</span>
            </div>

            <div className="lens-feature-content">
              <span className="lens-feature-eyebrow">
                {ad.eyebrow}
              </span>

              <h3>{ad.title}</h3>

              <p>{ad.description}</p>

              <span className="lens-feature-cta">
                CONSULTAR POR WHATSAPP
                <span aria-hidden="true">↗</span>
              </span>
            </div>

            <span className="lens-feature-number">
              {String(index + 1).padStart(2, '0')}
            </span>
          </a>
        ))}
      </div>

      <div className="lenses-marquee-footer">
        <span></span>
        <p>ENCUENTRA LA TECNOLOGÍA IDEAL PARA TUS GAFAS</p>
        <span></span>
      </div>
    </section>
  );
}

export default LensesBanner;
