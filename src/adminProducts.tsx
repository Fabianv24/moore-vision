
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from './supabase';
import { uploadProductImage } from './services/storageService';
import type { Product, ProductCategory } from './types';

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Unisex');
  const [image, setImage] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('No fue posible cargar los productos.');
    } else {
      setProducts((data ?? []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function resetForm() {
    setName('');
    setReference('');
    setPrice('');
    setCategory('Unisex');
    setImage(null);
    setEditingId(null);
    setCurrentImage('');

    const fileInput = document.getElementById(
      'product-image'
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = '';
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setReference(product.reference);
    setPrice(
      Number(product.price) > 0 ? String(product.price) : ''
    );
    setCategory(product.category);
    setCurrentImage(product.image || '');
    setImage(null);
    setError('');
    setSuccess('');

    const fileInput = document.getElementById(
      'product-image'
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = currentImage;

      if (image) {
        imageUrl = await uploadProductImage(image);
      }

      const productData = {
        name: name.trim(),
        reference: reference.trim(),
        price: Number(price) || 0,
        category,
        image: imageUrl || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);

        if (error) throw error;

        setSuccess('¡Montura actualizada correctamente!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            available: true,
          });

        if (error) throw error;

        setSuccess('¡Montura agregada correctamente!');
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(
        'No fue posible guardar la montura. Verifica los datos e inténtalo nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product: Product) {
    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('products')
      .update({ available: !product.available })
      .eq('id', product.id);

    if (error) {
      setError('No fue posible actualizar la disponibilidad.');
      return;
    }

    setSuccess('Disponibilidad actualizada.');
    await loadProducts();
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar ${product.name}?`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      setError('No fue posible eliminar la montura.');
      return;
    }

    setSuccess('Montura eliminada correctamente.');
    await loadProducts();
  }

  return (
    <section style={styles.container}>
      <h2 style={styles.title}>Gestión de catálogo</h2>
      <p style={styles.description}>
        Agrega y administra las monturas de Moore Vision.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>
          {editingId ? 'Editar montura' : 'Agregar nueva montura'}
        </h3>

        <label style={styles.label}>Nombre de la montura</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. DGARI"
          required
        />

        <label style={styles.label}>Referencia</label>
        <input
          style={styles.input}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ej. MV-001"
          required
        />

        <label style={styles.label}>Precio (COP) - Opcional</label>
        <input
          style={styles.input}
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Déjalo vacío para ocultar el precio"
        />

        <label style={styles.label}>Categoría</label>
        <select
          style={styles.input}
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as ProductCategory)
          }
        >
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="Unisex">Unisex</option>
        </select>

        <label style={styles.label}>Fotografía de la montura</label>
        <input
          id="product-image"
          style={styles.input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            setImage(e.target.files?.[0] ?? null)
          }
        />

        {editingId && (
          <div style={styles.preview}>
            {currentImage && !image && (
              <>
                <p>Fotografía actual:</p>
                <img
                  src={currentImage}
                  alt="Fotografía actual"
                  style={styles.previewImage}
                />
              </>
            )}
            {image && <p>Nueva fotografía: {image.name}</p>}
            {!currentImage && !image && (
              <p>Esta montura no tiene fotografía.</p>
            )}
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button style={styles.button} disabled={saving}>
          {saving
            ? 'Guardando...'
            : editingId
              ? 'Guardar cambios'
              : 'Agregar montura'}
        </button>

        {editingId && (
          <button
            type="button"
            style={styles.cancelButton}
            onClick={resetForm}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <h3 style={styles.subtitle}>Monturas registradas</h3>

      {loading ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <div style={styles.productList}>
          {products.map((product) => (
            <article key={product.id} style={styles.product}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={styles.image}
                />
              ) : (
                <div style={styles.noImage}>Sin fotografía</div>
              )}

              <div style={styles.productInfo}>
                <strong>{product.name}</strong>
                <span>Ref: {product.reference}</span>
                <span>
                  {Number(product.price) > 0
                    ? `$${Number(product.price).toLocaleString('es-CO')}`
                    : 'Precio no publicado'}
                </span>
                <span>{product.category}</span>
                <span>
                  {product.available ? 'Disponible' : 'No disponible'}
                </span>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => editProduct(product)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => toggleAvailability(product)}
                  >
                    {product.available ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => deleteProduct(product)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '45px',
  },
  title: {
    fontSize: '25px',
    fontWeight: 500,
  },
  description: {
    color: '#777',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  form: {
    background: '#f8f8f8',
    border: '1px solid #e5e5e5',
    padding: '25px',
    marginTop: '25px',
    maxWidth: '600px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    marginTop: '18px',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    background: '#fff',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '14px',
    marginTop: '25px',
    background: '#171717',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  cancelButton: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    background: '#fff',
    color: '#171717',
    border: '1px solid #ddd',
    cursor: 'pointer',
  },
  subtitle: {
    fontSize: '20px',
    marginTop: '45px',
  },
  productList: {
    display: 'grid',
    gap: '15px',
  },
  product: {
    display: 'flex',
    gap: '20px',
    padding: '18px',
    border: '1px solid #e5e5e5',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  image: {
    width: '110px',
    height: '110px',
    objectFit: 'contain',
    background: '#f5f5f5',
  },
  noImage: {
    width: '110px',
    height: '110px',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#777',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px',
    flex: 1,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  secondaryButton: {
    padding: '9px 13px',
    border: '1px solid #ccc',
    background: '#fff',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '9px 13px',
    border: 'none',
    background: '#eee',
    color: '#a22',
    cursor: 'pointer',
  },
  preview: {
    marginTop: '15px',
    fontSize: '13px',
    color: '#555',
  },
  previewImage: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    background: '#fff',
    border: '1px solid #ddd',
  },
  error: {
    color: '#c0392b',
    fontSize: '13px',
  },
  success: {
    color: '#247a45',
    fontSize: '13px',
  },
};

export default AdminProducts;
