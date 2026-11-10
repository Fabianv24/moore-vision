
import { useEffect, useState } from 'react';
import { getAvailableProducts } from './services/productService';
import type { Product, ProductCategory } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<
    'Todos' | ProductCategory
  >('Todos');

  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  useEffect(() => {
    getAvailableProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setError('No fue posible cargar nuestra colección.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <a className="header-button" href="#contacto">
          Contáctanos
        </a>
      </header>

      {/* PORTADA */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <span className="eyebrow">
            ESTILO · CALIDAD · VISIÓN
          </span>

          <h1>
            Tu mirada merece
            <br />
            algo <span>extraordinario.</span>
          </h1>

          <p>
            Descubre una nueva forma de expresar tu personalidad.
            En Moore Vision creemos que cada mirada tiene su propio estilo.
          </p>

          <a href="#catalogo" className="main-button">
            Descubrir Moore Vision <span>→</span>
          </a>
        </div>

        <div className="hero-decoration">
          <div className="decoration-circle"></div>
          <span>MOORE VISION</span>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="benefits">
        <div>
          <span>01</span>
          <h3>Estilo</h3>
          <p>
            Diseños pensados para expresar tu personalidad.
          </p>
        </div>

        <div>
          <span>02</span>
          <h3>Calidad</h3>
          <p>
            Una selección de monturas para acompañarte cada día.
          </p>
        </div>

        <div>
          <span>03</span>
          <h3>Asesoría</h3>
          <p>
            Te ayudamos a encontrar la montura ideal para ti.
          </p>
        </div>
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
          <>
            <div className="category-filters">
              {(['Todos', 'Hombre', 'Mujer', 'Unisex'] as const).map(
                (category) => (
                  <button
                    key={category}
                    className={`filter-button ${
                      selectedCategory === category ? 'active' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                )
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    )}

                    <div className="product-info">
                      <span>{product.category}</span>

                      <h3>{product.name}</h3>

                      <p>
                        Referencia: {product.reference}
                      </p>

                      <strong>
                        ${Number(product.price).toLocaleString('es-CO')}
                      </strong>

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
            ) : (
              <p>No hay monturas disponibles en esta categoría.</p>
            )}
          </>
        ) : (
          <div className="empty-catalog">
            <span>MOORE VISION · COLECCIÓN</span>

            <h3>Un estilo para cada mirada.</h3>

            <p>
              Muy pronto podrás descubrir nuestra colección completa.
            </p>
          </div>
        )}
      </section>

      {/* NOSOTROS */}
      <section className="about" id="nosotros">
        <span className="eyebrow">CONOCE MOORE VISION</span>

        <h2>
          Más que ver bien,
          <br />
          es sentirte bien.
        </h2>

        <p>
          Somos una propuesta óptica que busca combinar
          estilo, calidad y atención personalizada.
          Queremos ayudarte a encontrar monturas que
          reflejen quién eres.
        </p>
      </section>

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

        <small>
          © 2026 Moore Vision. Todos los derechos reservados.
        </small>
      </footer>

    </main>
  );
}

export default App;
