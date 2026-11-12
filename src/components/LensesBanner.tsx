
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import '../styles/lenses-banner.css';

type Advertisement = {
  id: string;
  panel_number: number;
  eyebrow: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  media_url: string;
  poster_url: string | null;
  whatsapp_message: string | null;
  sort_order: number;
  is_active: boolean;
};

const ROTATION_DURATION = 7000;
const TRANSITION_DURATION = 900;

const getWhatsAppLink = (ad: Advertisement) => {
  const phone = '573022476117';

  const message =
    ad.whatsapp_message?.trim() ||
    `Hola, quisiera recibir información sobre ${ad.title}. ¿Me pueden asesorar?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// ======================================================
// COMPONENTE DE CADA ANUNCIO
// ======================================================

function AdvertisementSlide({
  ad,
  isActive,
  showProgress,
}: {
  ad: Advertisement;
  isActive: boolean;
  showProgress: boolean;
}) {
  return (
    <div
      className={`lens-digital-slide ${
        isActive ? 'is-active' : 'is-outgoing'
      }`}
      aria-hidden={!isActive}
    >
      <div className="lens-digital-media">
        {ad.media_type === 'video' ? (
          <video
            key={ad.media_url}
            src={ad.media_url}
            poster={ad.poster_url ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img src={ad.media_url} alt={ad.title} />
        )}
      </div>

      <div className="lens-digital-overlay"></div>

      <div className="lens-digital-content">
        {ad.eyebrow && (
          <span className="lens-digital-eyebrow">
            {ad.eyebrow}
          </span>
        )}

        <h3>{ad.title}</h3>

        {ad.description && <p>{ad.description}</p>}

        <a
          href={getWhatsAppLink(ad)}
          target="_blank"
          rel="noopener noreferrer"
          className="lens-digital-cta"
          tabIndex={isActive ? 0 : -1}
        >
          CONSULTAR POR WHATSAPP
          <span aria-hidden="true"></span>
        </a>
      </div>

      {showProgress && isActive && (
        <div className="lens-digital-progress">
          <span key={ad.id}></span>
        </div>
      )}
    </div>
  );
}

// ======================================================
// COMPONENTE INDIVIDUAL DE PANEL
// ======================================================

function AdvertisingPanelView({
  ads,
  panelIndex,
}: {
  ads: Advertisement[];
  panelIndex: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const currentIndexRef = useRef(0);

  // REINICIAR ÍNDICE CUANDO CAMBIE LA CANTIDAD DE ANUNCIOS.
  useEffect(() => {
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setPreviousIndex(null);
  }, [ads.length]);

  // RETIRAR EL ANUNCIO ANTERIOR AL TERMINAR EL DESLIZAMIENTO.
  useEffect(() => {
    if (previousIndex === null) return;

    const timeoutId = window.setTimeout(() => {
      setPreviousIndex(null);
    }, TRANSITION_DURATION);

    return () => window.clearTimeout(timeoutId);
  }, [previousIndex]);

  // ROTACIÓN AUTOMÁTICA INDEPENDIENTE.
  useEffect(() => {
    if (paused || ads.length <= 1) return;

    let intervalId: number | undefined;

    const advanceAdvertisement = () => {
      const previous = currentIndexRef.current;
      const next = (previous + 1) % ads.length;

      setPreviousIndex(previous);
      currentIndexRef.current = next;
      setCurrentIndex(next);
    };

    const initialDelay = ROTATION_DURATION + panelIndex * 1400;

    const timeoutId = window.setTimeout(() => {
      advanceAdvertisement();

      intervalId = window.setInterval(
        advanceAdvertisement,
        ROTATION_DURATION
      );
    }, initialDelay);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [paused, ads.length, panelIndex]);

  const safeCurrentIndex =
    ads.length > 0 ? currentIndex % ads.length : 0;

  const activeAd = ads[safeCurrentIndex];

  const previousAd =
    previousIndex !== null && ads.length > 0
      ? ads[previousIndex]
      : null;

  return (
    <article
      className="lens-digital-panel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label={`Panel publicitario ${panelIndex + 1}`}
    >
      <div className="lens-digital-slides">
        {previousAd && (
          <AdvertisementSlide
            key={`previous-${previousAd.id}`}
            ad={previousAd}
            isActive={false}
            showProgress={false}
          />
        )}

        {activeAd ? (
          <AdvertisementSlide
            key={`current-${activeAd.id}`}
            ad={activeAd}
            isActive={true}
            showProgress={ads.length > 1}
          />
        ) : (
          <div className="lens-digital-slide is-active">
            <div className="lens-digital-media">
              <div className="lens-digital-placeholder">
                <span>MOORE VISION</span>
              </div>
            </div>

            <div className="lens-digital-overlay"></div>

            <div className="lens-digital-content">
              <span className="lens-digital-eyebrow">
                MOORE VISION · PUBLICIDAD
              </span>

              <h3>Próximamente nuevos anuncios.</h3>

              <p>
                Este espacio estará disponible para nuestras
                próximas tecnologías y promociones.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="lens-digital-top">
        <span>MOORE VISION</span>

        <span className="lens-digital-number">
          0{panelIndex + 1}
        </span>
      </div>

      <button
        type="button"
        className="lens-digital-pause"
        onClick={() => setPaused((current) => !current)}
        aria-label={paused ? 'Reanudar publicidad' : 'Pausar publicidad'}
        aria-pressed={paused}
      >
        {paused ? '▶' : 'Ⅱ'}
      </button>
    </article>
  );
}

// ======================================================
// FRANJA PUBLICITARIA PRINCIPAL
// ======================================================

function LensesBanner() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadAdvertisements = async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          id,
          panel_number,
          eyebrow,
          title,
          description,
          media_type,
          media_url,
          poster_url,
          whatsapp_message,
          sort_order,
          is_active
        `)
        .eq('is_active', true)
        .order('panel_number', { ascending: true })
        .order('sort_order', { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error('Error cargando publicidad:', error);
        setLoadError('No fue posible cargar la publicidad.');
      } else {
        setAdvertisements((data ?? []) as Advertisement[]);
        setLoadError('');
      }

      setLoading(false);
    };

    void loadAdvertisements();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      className="lenses-marquee-section"
      id="lentes"
      aria-label="Publicidad de tecnologías en lentes"
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
          Descubre nuestras tecnologías, novedades y promociones.
        </p>
      </div>

      {loadError && (
        <p className="lens-digital-load-status" role="status">
          {loadError}
        </p>
      )}

      {loading && (
        <p className="lens-digital-load-status" role="status">
          Cargando anuncios...
        </p>
      )}

      <div className="lens-digital-grid">
        {[1, 2, 3].map((panelNumber, index) => {
          const panelAds = advertisements.filter(
            (ad) => ad.panel_number === panelNumber
          );

          return (
            <AdvertisingPanelView
              key={panelNumber}
              ads={panelAds}
              panelIndex={index}
            />
          );
        })}
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
