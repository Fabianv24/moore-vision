
import {
  useEffect,
  useState,
  type FormEvent,
  type CSSProperties,
} from 'react';
import { supabase } from './supabase';
import AdminProducts from './adminProducts';
import AdminAdvertisements from './adminAdvertisements';

const ADMIN_ID = 'd2d6cf01-bd36-46ad-90d7-88a504e58d11';

type AdminSection = 'products' | 'advertisements';

function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  const [activeSection, setActiveSection] =
    useState<AdminSection>('products');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;

      if (currentUser?.id === ADMIN_ID) {
        setUser(currentUser);
      } else if (currentUser) {
        await supabase.auth.signOut();
      }

      setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user.id === ADMIN_ID) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos.');
    } else if (data.user.id !== ADMIN_ID) {
      await supabase.auth.signOut();
      setError('No tienes permisos de administrador.');
    } else {
      setUser(data.user);
    }

    setProcessing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPassword('');
    setActiveSection('products');
  };

  if (loading) {
    return <div style={styles.message}>Cargando...</div>;
  }

  if (!user) {
    return (
      <main style={styles.page}>
        <form style={styles.card} onSubmit={handleLogin}>
          <span style={styles.brand}>MOORE VISION</span>
          <p style={styles.label}>PANEL ADMINISTRATIVO</p>

          <h1 style={styles.title}>Bienvenido.</h1>

          <p style={styles.description}>
            Ingresa tus credenciales para administrar tu colección.
          </p>

          <label style={styles.fieldLabel}>Correo electrónico</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo"
            required
          />

          <label style={styles.fieldLabel}>Contraseña</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={styles.button}
            disabled={processing}
            type="submit"
          >
            {processing ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <a href="/" style={styles.backLink}>
            Volver a Moore Vision
          </a>
        </form>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.dashboard}>
        {/* ENCABEZADO */}
        <header style={styles.header}>
          <div>
            <span style={styles.brand}>MOORE VISION</span>
            <p style={styles.headerSubtitle}>
              Administración de tienda
            </p>
          </div>

          <button
            style={styles.logout}
            onClick={handleLogout}
            type="button"
          >
            Cerrar sesión
          </button>
        </header>

        {/* BIENVENIDA */}
        <div style={styles.welcomeSection}>
          <p style={styles.label}>PANEL ADMINISTRATIVO</p>

          <h1 style={styles.title}>
            Bienvenido a tu panel.
          </h1>

          <p style={styles.description}>
            Administra las monturas y la publicidad de Moore Vision
            desde un solo lugar.
          </p>

          <div style={styles.welcome}>
            <div style={styles.statusDot}></div>

            <div>
              <strong>Acceso autorizado</strong>
              <p>{user.email}</p>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN ADMINISTRATIVA */}
        <div style={styles.sectionNavigation}>
          <button
            type="button"
            onClick={() => setActiveSection('products')}
            style={{
              ...styles.sectionButton,
              ...(activeSection === 'products'
                ? styles.sectionButtonActive
                : {}),
            }}
            aria-pressed={activeSection === 'products'}
          >
            <span style={styles.sectionIcon}>◈</span>
            <span>Monturas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('advertisements')}
            style={{
              ...styles.sectionButton,
              ...(activeSection === 'advertisements'
                ? styles.sectionButtonActive
                : {}),
            }}
            aria-pressed={activeSection === 'advertisements'}
          >
            <span style={styles.sectionIcon}>▣</span>
            <span>Publicidad</span>
          </button>
        </div>

        {/* CONTENIDO SEGÚN LA SECCIÓN */}
        {activeSection === 'products' ? (
          <AdminProducts />
        ) : (
          <AdminAdvertisements />
        )}
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '35px 24px',
    fontFamily: 'Arial, sans-serif',
    color: '#171717',
    boxSizing: 'border-box',
  },

  card: {
    background: '#fff',
    padding: '44px',
    width: '100%',
    maxWidth: '460px',
    boxSizing: 'border-box',
    border: '1px solid #e5e5e5',
  },

  dashboard: {
    background: '#fff',
    padding: '55px',
    width: '100%',
    maxWidth: '1000px',
    boxSizing: 'border-box',
    border: '1px solid #e5e5e5',
    minHeight: 'calc(100vh - 70px)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '25px',
    borderBottom: '1px solid #eee',
    gap: '20px',
    flexWrap: 'wrap',
  },

  brand: {
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '2px',
  },

  headerSubtitle: {
    fontSize: '13px',
    color: '#888',
    marginTop: '8px',
  },

  welcomeSection: {
    marginTop: '35px',
    marginBottom: '35px',
  },

  label: {
    fontSize: '12px',
    letterSpacing: '2px',
    color: '#888',
    marginTop: '15px',
  },

  title: {
    fontSize: '38px',
    fontWeight: 500,
    margin: '18px 0',
  },

  description: {
    color: '#777',
    fontSize: '15px',
    lineHeight: 1.8,
  },

  fieldLabel: {
    display: 'block',
    fontSize: '14px',
    marginTop: '24px',
    marginBottom: '9px',
  },

  input: {
    width: '100%',
    padding: '15px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontSize: '15px',
    outline: 'none',
  },

  button: {
    width: '100%',
    padding: '16px',
    marginTop: '28px',
    background: '#171717',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
  },

  logout: {
    background: '#fff',
    border: '1px solid #ddd',
    padding: '13px 20px',
    cursor: 'pointer',
    fontSize: '13px',
  },

  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '24px',
    color: '#777',
    fontSize: '13px',
    textDecoration: 'none',
  },

  error: {
    color: '#c0392b',
    fontSize: '13px',
    marginTop: '15px',
  },

  message: {
    padding: '50px',
    textAlign: 'center',
  },

  welcome: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#f7f7f7',
    padding: '20px',
    marginTop: '28px',
    fontSize: '14px',
    maxWidth: '400px',
  },

  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#4a9b68',
    flexShrink: 0,
  },

  sectionNavigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '22px',
    borderBottom: '1px solid #e8e8e8',
    marginBottom: '25px',
    flexWrap: 'wrap',
  },

  sectionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 22px',
    background: '#f6f6f6',
    border: '1px solid #e5e5e5',
    color: '#555',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  sectionButtonActive: {
    background: '#202a34',
    color: '#fff',
    border: '1px solid #202a34',
  },

  sectionIcon: {
    fontSize: '16px',
  },
};

export default Admin;
