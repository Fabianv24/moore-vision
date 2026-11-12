
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from './supabase';
import { uploadAdvertisingMedia } from './services/storageService';
import './styles/admin-advertisements.css';

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
  created_at: string;
};

type AdvertisementForm = {
  panel_number: number;
  eyebrow: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  media_url: string;
  poster_url: string;
  whatsapp_message: string;
  is_active: boolean;
};

const emptyForm = (): AdvertisementForm => ({
  panel_number: 1,
  eyebrow: '',
  title: '',
  description: '',
  media_type: 'image',
  media_url: '',
  poster_url: '',
  whatsapp_message: '',
  is_active: true,
});

function AdminAdvertisements() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [form, setForm] = useState<AdvertisementForm>(emptyForm());
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =====================================================
  // CARGAR ANUNCIOS
  // =====================================================

  const loadAdvertisements = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('panel_number', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error cargando publicidad:', error);
      setError('No fue posible cargar los anuncios.');
    } else {
      setAdvertisements((data ?? []) as Advertisement[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  // =====================================================
  // CAMBIOS EN EL FORMULARIO
  // =====================================================

  const updateField = <K extends keyof AdvertisementForm>(
    field: K,
    value: AdvertisementForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleMediaChange = (file: File | null) => {
    setMediaFile(file);

    if (file) {
      updateField(
        'media_type',
        file.type.startsWith('video/') ? 'video' : 'image'
      );
    }
  };

  // =====================================================
  // REINICIAR FORMULARIO
  // =====================================================

  const resetForm = () => {
    setForm(emptyForm());
    setMediaFile(null);
    setEditingId(null);
    setError('');
    setSuccess('');

    const fileInput = document.getElementById(
      'ad-media'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  };

  // =====================================================
  // GUARDAR O ACTUALIZAR ANUNCIO
  // =====================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      if (!form.title.trim()) {
        throw new Error('Debes escribir un título para el anuncio.');
      }

      if (!mediaFile && !form.media_url) {
        throw new Error('Debes seleccionar una imagen o un video.');
      }

      let mediaUrl = form.media_url;
      let mediaType = form.media_type;

      // Subir nuevo archivo multimedia si se seleccionó.
      if (mediaFile) {
        mediaUrl = await uploadAdvertisingMedia(mediaFile);

        mediaType = mediaFile.type.startsWith('video/')
          ? 'video'
          : 'image';
      }

      const existingAdvertisement = advertisements.find(
        (ad) => ad.id === editingId
      );

      const panelAdvertisements = advertisements.filter(
        (ad) => ad.panel_number === Number(form.panel_number)
      );

      const nextOrder =
        existingAdvertisement?.panel_number === Number(form.panel_number)
          ? existingAdvertisement.sort_order
          : panelAdvertisements.length > 0
            ? Math.max(...panelAdvertisements.map((ad) => ad.sort_order)) + 1
            : 0;

      const payload = {
        panel_number: Number(form.panel_number),
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        media_type: mediaType,
        media_url: mediaUrl,
        poster_url: form.poster_url.trim() || null,
        whatsapp_message: form.whatsapp_message.trim() || null,
        sort_order: nextOrder,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from('advertisements')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;

        setSuccess('Anuncio actualizado correctamente.');
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert(payload);

        if (error) throw error;

        setSuccess('Anuncio creado correctamente.');
      }

      await loadAdvertisements();

      setForm(emptyForm());
      setMediaFile(null);
      setEditingId(null);

      const fileInput = document.getElementById(
        'ad-media'
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('Error guardando anuncio:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible guardar el anuncio.'
      );
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // EDITAR ANUNCIO
  // =====================================================

  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setMediaFile(null);

    setForm({
      panel_number: ad.panel_number,
      eyebrow: ad.eyebrow,
      title: ad.title,
      description: ad.description,
      media_type: ad.media_type,
      media_url: ad.media_url,
      poster_url: ad.poster_url ?? '',
      whatsapp_message: ad.whatsapp_message ?? '',
      is_active: ad.is_active,
    });

    setError('');
    setSuccess('');

    const fileInput = document.getElementById(
      'ad-media'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

    document
      .getElementById('advertisement-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // =====================================================
  // ACTIVAR O DESACTIVAR
  // =====================================================

  const handleToggleActive = async (ad: Advertisement) => {
    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id);

    if (error) {
      setError('No fue posible cambiar el estado del anuncio.');
      return;
    }

    setSuccess(
      ad.is_active
        ? 'Anuncio desactivado.'
        : 'Anuncio activado.'
    );

    await loadAdvertisements();
  };

  // =====================================================
  // ELIMINAR ANUNCIO
  // =====================================================

  const handleDelete = async (ad: Advertisement) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el anuncio "${ad.title}"?`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', ad.id);

    if (error) {
      setError('No fue posible eliminar el anuncio.');
      return;
    }

    if (editingId === ad.id) {
      resetForm();
    }

    setSuccess('Anuncio eliminado correctamente.');

    await loadAdvertisements();
  };

  // =====================================================
  // CAMBIAR ORDEN DE APARICIÓN
  // =====================================================

  const handleMove = async (
    ad: Advertisement,
    direction: 'up' | 'down'
  ) => {
    const panelAds = advertisements
      .filter((item) => item.panel_number === ad.panel_number)
      .sort((a, b) => a.sort_order - b.sort_order);

    const currentIndex = panelAds.findIndex(
      (item) => item.id === ad.id
    );

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= panelAds.length) return;

    const currentAd = panelAds[currentIndex];
    const targetAd = panelAds[targetIndex];

    const { error: firstError } = await supabase
      .from('advertisements')
      .update({ sort_order: targetAd.sort_order })
      .eq('id', currentAd.id);

    if (firstError) {
      setError('No fue posible cambiar el orden.');
      return;
    }

    const { error: secondError } = await supabase
      .from('advertisements')
      .update({ sort_order: currentAd.sort_order })
      .eq('id', targetAd.id);

    if (secondError) {
      setError('No fue posible completar el cambio de orden.');
      await loadAdvertisements();
      return;
    }

    await loadAdvertisements();
  };

  // =====================================================
  // VISTA DE ADMINISTRACIÓN
  // =====================================================

  return (
    <section className="advertisement-admin">
      <div className="advertisement-admin-heading">
        <div>
          <span className="advertisement-admin-eyebrow">
            MOORE VISION · CONTENIDO DIGITAL
          </span>

          <h2>Publicidad de lentes</h2>

          <p>
            Administra los anuncios que aparecen en los tres paneles
            publicitarios de tu página.
          </p>
        </div>

        <button
          type="button"
          className="advertisement-new-button"
          onClick={resetForm}
        >
          + Nuevo anuncio
        </button>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="advertisement-message advertisement-error">
          {error}
        </div>
      )}

      {success && (
        <div className="advertisement-message advertisement-success">
          {success}
        </div>
      )}

      {/* FORMULARIO */}
      <form
        id="advertisement-form"
        className="advertisement-form"
        onSubmit={handleSubmit}
      >
        <div className="advertisement-form-heading">
          <div>
            <span className="advertisement-admin-eyebrow">
              {editingId ? 'MODIFICAR PUBLICIDAD' : 'NUEVA PUBLICIDAD'}
            </span>

            <h3>{editingId ? 'Editar anuncio' : 'Crear anuncio'}</h3>
          </div>

          {editingId && (
            <button
              type="button"
              className="advertisement-cancel-button"
              onClick={resetForm}
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="advertisement-form-grid">

          {/* SELECCIÓN VISUAL DE PANEL */}
          <div className="advertisement-field advertisement-field-full">
            <label>¿En cuál panel quieres publicar este anuncio?</label>

            <div className="advertisement-panel-selector">
              {[1, 2, 3].map((panel) => (
                <button
                  key={panel}
                  type="button"
                  className={`advertisement-panel-option ${
                    form.panel_number === panel ? 'selected' : ''
                  }`}
                  onClick={() => updateField('panel_number', panel)}
                  aria-pressed={form.panel_number === panel}
                >
                  <span className="advertisement-panel-option-number">
                    0{panel}
                  </span>

                  <strong>Panel {panel}</strong>

                  <span className="advertisement-panel-option-status">
                    {form.panel_number === panel
                      ? 'Seleccionado ✓'
                      : 'Seleccionar'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TEXTO SUPERIOR */}
          <div className="advertisement-field">
            <label htmlFor="ad-eyebrow">Texto superior</label>

            <input
              id="ad-eyebrow"
              type="text"
              value={form.eyebrow}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              placeholder="Ej. TECNOLOGÍA PARA TU DÍA A DÍA"
            />
          </div>

          {/* TÍTULO */}
          <div className="advertisement-field advertisement-field-full">
            <label htmlFor="ad-title">Título del anuncio</label>

            <input
              id="ad-title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ej. Lentes con filtro antirreflejo"
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="advertisement-field advertisement-field-full">
            <label htmlFor="ad-description">Descripción</label>

            <textarea
              id="ad-description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Escribe la información que aparecerá en el anuncio..."
              rows={3}
            />
          </div>

          {/* ARCHIVO MULTIMEDIA */}
          <div className="advertisement-field advertisement-field-full">
            <label htmlFor="ad-media">
              Fotografía o video
            </label>

            <input
              id="ad-media"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              onChange={(e) =>
                handleMediaChange(e.target.files?.[0] ?? null)
              }
            />

            <small>
              JPG, PNG, WEBP, AVIF, MP4 o WEBM. Máximo 50 MB.
              {editingId &&
                ' Si no seleccionas otro archivo, se conserva el actual.'}
            </small>

            {(mediaFile || form.media_url) && (
              <div className="advertisement-preview">
                <span>Vista previa del archivo</span>

                {mediaFile
                  ? mediaFile.type.startsWith('video/') ? (
                      <video
                        src={URL.createObjectURL(mediaFile)}
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(mediaFile)}
                        alt="Vista previa del nuevo anuncio"
                      />
                    )
                  : form.media_type === 'video' ? (
                      <video
                        src={form.media_url}
                        poster={form.poster_url || undefined}
                        controls
                      />
                    ) : (
                      <img
                        src={form.media_url}
                        alt="Imagen actual del anuncio"
                      />
                    )}
              </div>
            )}
          </div>

          {/* PORTADA DEL VIDEO */}
          {form.media_type === 'video' && (
            <div className="advertisement-field advertisement-field-full">
              <label htmlFor="ad-poster">
                Imagen de portada del video (opcional)
              </label>

              <input
                id="ad-poster"
                type="url"
                value={form.poster_url}
                onChange={(e) => updateField('poster_url', e.target.value)}
                placeholder="URL de una imagen de portada"
              />
            </div>
          )}

          {/* WHATSAPP */}
          <div className="advertisement-field advertisement-field-full">
            <label htmlFor="ad-whatsapp">
              Mensaje personalizado de WhatsApp
            </label>

            <textarea
              id="ad-whatsapp"
              rows={2}
              value={form.whatsapp_message}
              onChange={(e) =>
                updateField('whatsapp_message', e.target.value)
              }
              placeholder="Déjalo vacío para utilizar el mensaje automático."
            />

            <small>
              Puedes personalizar lo que recibe el cliente al consultar.
            </small>
          </div>

          {/* ESTADO DEL ANUNCIO */}
          <div className="advertisement-field advertisement-field-full">
            <label className="advertisement-checkbox">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
              />

              <span>Publicar este anuncio en la página</span>
            </label>
          </div>
        </div>

        {/* BOTONES DEL FORMULARIO */}
        <div className="advertisement-form-actions">
          <button
            type="submit"
            className="advertisement-save-button"
            disabled={processing}
          >
            {processing
              ? 'Guardando anuncio...'
              : editingId
                ? 'Guardar cambios'
                : 'Crear anuncio'}
          </button>

          {editingId && (
            <button
              type="button"
              className="advertisement-cancel-button"
              onClick={resetForm}
              disabled={processing}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* LISTADO DE LOS TRES PANELES */}
      <div className="advertisement-list-heading">
        <div>
          <span className="advertisement-admin-eyebrow">
            CONTENIDO PUBLICITARIO
          </span>

          <h3>Tus anuncios</h3>
        </div>

        <button
          type="button"
          className="advertisement-refresh-button"
          onClick={loadAdvertisements}
        >
          Actualizar lista
        </button>
      </div>

      {loading ? (
        <p className="advertisement-empty">
          Cargando anuncios...
        </p>
      ) : (
        [1, 2, 3].map((panelNumber) => {
          const panelAds = advertisements
            .filter((ad) => ad.panel_number === panelNumber)
            .sort((a, b) => a.sort_order - b.sort_order);

          return (
            <div className="advertisement-panel-group" key={panelNumber}>
              <div className="advertisement-panel-heading">
                <h4>Panel {panelNumber}</h4>

                <span>
                  {panelAds.length}{' '}
                  {panelAds.length === 1 ? 'anuncio' : 'anuncios'}
                </span>
              </div>

              {panelAds.length === 0 ? (
                <div className="advertisement-empty">
                  Todavía no tienes anuncios en este panel.
                </div>
              ) : (
                <div className="advertisement-admin-list">
                  {panelAds.map((ad, index) => (
                    <article
                      className="advertisement-admin-card"
                      key={ad.id}
                    >
                      <div className="advertisement-admin-thumbnail">
                        {ad.media_type === 'video' ? (
                          <video
                            src={ad.media_url}
                            poster={ad.poster_url ?? undefined}
                            muted
                          />
                        ) : (
                          <img src={ad.media_url} alt={ad.title} />
                        )}
                      </div>

                      <div className="advertisement-admin-details">
                        <div className="advertisement-admin-card-top">
                          <span className="advertisement-order">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <span
                            className={
                              ad.is_active
                                ? 'advertisement-status is-active'
                                : 'advertisement-status is-inactive'
                            }
                          >
                            {ad.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <h5>{ad.title}</h5>

                        <p>{ad.description}</p>

                        <small>
                          {ad.media_type === 'video' ? 'Video' : 'Imagen'}
                        </small>

                        <div className="advertisement-card-actions">
                          <button
                            type="button"
                            onClick={() => handleEdit(ad)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(ad)}
                          >
                            {ad.is_active ? 'Desactivar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMove(ad, 'up')}
                            disabled={index === 0}
                            aria-label="Mover anuncio hacia arriba"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMove(ad, 'down')}
                            disabled={index === panelAds.length - 1}
                            aria-label="Mover anuncio hacia abajo"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="advertisement-delete-button"
                            onClick={() => handleDelete(ad)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}

export default AdminAdvertisements;
