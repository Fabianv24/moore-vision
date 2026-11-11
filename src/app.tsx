
import { useEffect, useRef, useState } from 'react';
import type { WheelEvent, PointerEvent } from 'react';
import { getAvailableProducts } from './services/productService';
import type { Product, ProductCategory, ProductShape } from './types';
import Admin from './admin';
import LensesBanner from './components/LensesBanner';
import './styles/catalog-expansion.css';

type SelectedImage = {
  src: string;
  name: string;
};

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const INITIAL_PRODUCT_LIMIT = 6;

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<
    'Todos' | ProductCategory
  >('Todos');

  const [selectedShape, setSelectedShape] = useState<
    'Todas' | ProductShape
  >('Todas');

  const [searchTerm, setSearchTerm] = useState('');

  const [showAllProducts, setShowAllProducts] = useState(false);

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [zoom, setZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const dragStart = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    imageX: number;
    imageY: number;
  } | null>(null);

  const isAdminRoute = window.location.pathname === '/admin';

  const availableShapes: ProductShape[] = [
    'Rectangular',
    'Redonda',
    'Cuadrada',
    'Aviador',
    'Cat-eye',
    'Geométrica',
    'Otra',
  ];

  const normalizedSearch = normalizeText(searchTerm.trim());

  // Combina búsqueda, categoría y forma.
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Todos' ||
      product.category === selectedCategory;

    const matchesShape =
      selectedShape === 'Todas' ||
      product.shape === selectedShape;

    const searchableText = normalizeText(
      `${product.name} ${product.reference}`
    );

    const matchesSearch = searchableText.includes(normalizedSearch);

    return matchesCategory && matchesShape && matchesSearch;
  });

  const hasActiveFilters =
    selectedCategory !== 'Todos' ||
    selectedShape !== 'Todas' ||
    searchTerm.trim() !== '';

  // Limita a seis productos únicamente cuando no hay filtros activos.
  const visibleProducts =
    !hasActiveFilters && !showAllProducts
      ? filteredProducts.slice(0, INITIAL_PRODUCT_LIMIT)
      : filteredProducts;

  const canExpandCatalog =
    !hasActiveFilters &&
    filteredProducts.length > INITIAL_PRODUCT_LIMIT;

  // Restablece todos los filtros y vuelve a la vista compacta.
  const clearFilters = () => {
    setSelectedCategory('Todos');
    setSelectedShape('Todas');
    setSearchTerm('');
    setShowAllProducts(false);
  };

  useEffect(() => {
    if (isAdminRoute) return;

    getAvailableProducts()
      .then(setProducts)
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setError('No fue posible cargar nuestra colección.');
      })
      .finally(() => setLoading(false));
  }, [isAdminRoute]);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeImage();

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        changeZoom(0.25);
      }

      if (event.key === '-') {
        event.preventDefault();
        changeZoom(-0.25);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedImage, zoom]);

  const closeImage = () => {
    setSelectedImage(null);
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
    dragStart.current = null;
  };

  const changeZoom = (amount: number) => {
    setZoom((current) => {
      const next = Math.min(
        3,
        Math.max(1, Number((current + amount).toFixed(2)))
      );

      if (next === 1) setImagePosition({ x: 0, y: 0 });

      return next;
    });
  };

  const resetZoom = () => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 0.2 : -0.2);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragStart.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: imagePosition.x,
      imageY: imagePosition.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;

    if (!start || start.pointerId !== event.pointerId) return;

    setImagePosition({
      x: start.imageX + event.clientX - start.pointerX,
      y: start.imageY + event.clientY - start.pointerY,
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.pointerId === event.pointerId) {
      dragStart.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  };

  const handleImageDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoom();
    }
  };

  if (isAdminRoute) {
    return <Admin />;
  }

  const getWhatsAppLink = (product: Product) => {
    const phone = '573022476117';

    const message = `Hola, estoy interesado/a en la montura ${product.name}, referencia ${product.reference}. ¿Me pueden dar más información?`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="page">
      {/* ENCABEZADO */}
      <header className="header">
        <a href="#inicio" className="logo">
          MOORE <span>VISION</span>
        </a>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#catalogo">Colección</a>
          <a href="#lentes">Lentes</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <a className="header-button" href="#contacto">
          Contáctanos
        </a>
      </header>

      {/* PORTADA: SE DEJA SIN MODIFICACIONES */}
      <section className="hero hero-premium" id="inicio">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="eyebrow">MOORE VISION · ESTILO Y VISIÓN</span>

          <h1>
            Tu mirada merece
            <br />
            algo <span>extraordinario.</span>
          </h1>

          <p>
            Descubre monturas que reflejan tu personalidad.
            Nosotros te acompañamos en el camino hacia
            unas gafas hechas para ti.
          </p>

          <a href="#catalogo" className="main-button">
            Explorar colección <span>→</span>
          </a>

          <div className="hero-caption">ELEGANCIA EN CADA MIRADA</div>
        </div>

        <div className="hero-number">01 — MOORE VISION</div>
      </section>

      {/* COLECCIÓN */}
      <section className="catalog-intro" id="catalogo">
        <span className="eyebrow">NUESTRA COLECCIÓN</span>

        <h2>Encuentra tu próxima montura</h2>

        <p>
          Explora nuestra selección de diseños y descubre
          el estilo que mejor se adapta a ti.
        </p>

        {loading ? (
          <p>Cargando nuestra colección...</p>
        ) : error ? (
          <p>{error}</p>
        ) : products.length > 0 ? (
          <div className="catalog-layout">
            {/* BARRA LATERAL DE BÚSQUEDA Y FILTROS */}
            <aside
              className="catalog-sidebar"
              aria-label="Búsqueda y filtros de la colección"
            >
              <div className="catalog-sidebar-heading">
                <h3 className="catalog-sidebar-title">
                  Encuentra tu estilo
                </h3>

                <p className="catalog-sidebar-description">
                  Explora las monturas y encuentra el diseño que buscas.
                </p>
              </div>

              {/* BUSCADOR */}
              <div className="catalog-sidebar-section">
                <label htmlFor="catalog-search">
                  Buscar montura
                </label>

                <div className="catalog-search-wrap">
                  <input
                    id="catalog-search"
                    type="search"
                    className="catalog-search"
                    placeholder="Nombre o referencia..."
                    aria-label="Buscar monturas por nombre o referencia"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div className="catalog-sidebar-divider"></div>

              {/* FILTROS POR CATEGORÍA */}
              <div className="catalog-sidebar-section">
                <h3>Categoría</h3>

                <div className="category-filters">
                  {(['Todos', 'Hombre', 'Mujer', 'Unisex'] as const).map(
                    (category) => (
                      <button
                        type="button"
                        key={category}
                        className={`filter-button ${
                          selectedCategory === category ? 'active' : ''
                        }`}
                        onClick={() => setSelectedCategory(category)}
                        aria-pressed={selectedCategory === category}
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="catalog-sidebar-divider"></div>

              {/* FILTRO POR FORMA */}
              <div className="catalog-sidebar-section">
                <div className="shape-filter-wrap">
                  <label htmlFor="shape-filter">
                    Forma de la montura
                  </label>

                  <select
                    id="shape-filter"
                    className="shape-filter-select"
                    value={selectedShape}
                    onChange={(event) =>
                      setSelectedShape(
                        event.target.value as 'Todas' | ProductShape
                      )
                    }
                  >
                    <option value="Todas">Todas las formas</option>

                    {availableShapes.map((shape) => (
                      <option key={shape} value={shape}>
                        {shape}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LIMPIAR FILTROS */}
              <button
                type="button"
                className="catalog-clear-filters"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Limpiar filtros
              </button>
            </aside>

            {/* ZONA PRINCIPAL DE PRODUCTOS */}
            <div className="catalog-main">
              <p className="catalog-results-count" aria-live="polite">
                {filteredProducts.length === 1
                  ? '1 montura encontrada'
                  : hasActiveFilters
                    ? `${filteredProducts.length} monturas encontradas`
                    : canExpandCatalog && !showAllProducts
                      ? `Mostrando ${visibleProducts.length} de ${filteredProducts.length} monturas`
                      : `${filteredProducts.length} monturas en la colección`}
              </p>

              {filteredProducts.length > 0 ? (
                <>
                  <div className="product-grid">
                    {visibleProducts.map((product) => (
                      <article className="product-card" key={product.id}>
                        {product.image && (
                          <button
                            type="button"
                            className="product-image-button"
                            onClick={() => {
                              setSelectedImage({
                                src: product.image,
                                name: product.name,
                              });
                              resetZoom();
                            }}
                            aria-label={`Ampliar fotografía de ${product.name}`}
                            title="Ver imagen ampliada"
                          >
                            <img src={product.image} alt={product.name} />

                            {product.is_new && (
                              <span className="product-new-badge">
                                NUEVA COLECCIÓN
                              </span>
                            )}

                            <span className="image-zoom-hint">
                              Ampliar imagen ⤢
                            </span>
                          </button>
                        )}

                        <div className="product-info">
                          <div className="product-tags">
                            <span className="product-category">
                              {product.category}
                            </span>

                            {product.shape && (
                              <span className="product-shape">
                                {product.shape}
                              </span>
                            )}
                          </div>

                          <h3>{product.name}</h3>

                          <p>Referencia: {product.reference}</p>

                          {Number(product.price) > 0 && (
                            <strong>
                              ${Number(product.price).toLocaleString('es-CO')}
                            </strong>
                          )}

                          <a
                            href={getWhatsAppLink(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="main-button"
                          >
                            Consultar por WhatsApp →
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* BOTÓN PARA DESPLEGAR O REDUCIR EL CATÁLOGO */}
                  {canExpandCatalog && (
                    <div className="catalog-expansion-controls">
                      <button
                        type="button"
                        className="catalog-toggle-button"
                        onClick={() =>
                          setShowAllProducts((current) => !current)
                        }
                        aria-expanded={showAllProducts}
                      >
                        {showAllProducts
                          ? 'VER MENOS'
                          : 'VER CATÁLOGO COMPLETO'}

                        <span aria-hidden="true">
                          {showAllProducts ? '↑' : '↓'}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* MENSAJE PROFESIONAL CUANDO NO HAY RESULTADOS */
                <div className="empty-catalog catalog-no-results">
                  <span>MOORE VISION · COLECCIÓN</span>

                  <h3>
                    Aún no encontramos lo que buscas.
                  </h3>

                  <p>
                    Prueba con otra búsqueda o cambia los filtros
                    para descubrir más diseños de nuestra colección.
                  </p>

                  <button
                    type="button"
                    className="main-button"
                    onClick={clearFilters}
                  >
                    Ver toda la colección
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-catalog">
            <span>MOORE VISION · COLECCIÓN</span>
            <h3>Un estilo para cada mirada.</h3>
            <p>Muy pronto podrás descubrir nuestra colección completa.</p>
          </div>
        )}
      </section>

      {/* FRANJA PUBLICITARIA DE TECNOLOGÍAS EN LENTES */}
      <LensesBanner />

      {/* CONTACTO */}
      <section className="contact" id="contacto">
        <span className="eyebrow">ESTAMOS PARA TI</span>

        <h2>Tu próxima mirada comienza aquí.</h2>

        <p>
          ¿Tienes alguna pregunta? Comunícate directamente
          con nuestro equipo por WhatsApp.
        </p>

        <a
          href="https://wa.me/573022476117?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20Moore%20Vision."
          target="_blank"
          rel="noopener noreferrer"
          className="main-button"
        >
          Escríbenos por WhatsApp →
        </a>
      </section>

      {/* PIE DE PÁGINA */}
      <footer>
        <strong>MOORE VISION</strong>
        <span>Una nueva forma de ver tu estilo.</span>
        <small>© 2026 Moore Vision. Todos los derechos reservados.</small>
      </footer>

      {/* VISUALIZADOR CON ZOOM */}
      {selectedImage && (
        <div
          className="image-lightbox"
          onClick={closeImage}
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${selectedImage.name}`}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={closeImage}
            aria-label="Cerrar imagen"
          >
            ×
          </button>

          <div
            className="lightbox-toolbar"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => changeZoom(-0.25)}
              disabled={zoom <= 1}
              aria-label="Alejar"
            >
              −
            </button>

            <span>{Math.round(zoom * 100)}%</span>

            <button
              type="button"
              onClick={() => changeZoom(0.25)}
              disabled={zoom >= 3}
              aria-label="Acercar"
            >
              +
            </button>

            <button
              type="button"
              className="lightbox-reset"
              onClick={resetZoom}
              disabled={zoom === 1}
            >
              Restablecer
            </button>
          </div>

          <div
            className={`lightbox-image-area ${
              zoom > 1 ? 'is-zoomed' : ''
            }`}
            onClick={(event) => event.stopPropagation()}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleImageDoubleClick}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.name}
              draggable={false}
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom})`,
              }}
            />
          </div>

          <p className="lightbox-caption">{selectedImage.name}</p>

          <span className="lightbox-help">
            Usa la rueda o los controles para ampliar · Arrastra para explorar · Doble clic para acercar
          </span>
        </div>
      )}
    </main>
  );
}

export default App;
