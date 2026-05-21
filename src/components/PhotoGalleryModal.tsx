import { useEffect, useMemo, useRef, useState, type TouchEventHandler } from 'react';
import { createPortal } from 'react-dom';

type PhotoGalleryModalProps = {
  title: string;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

export function PhotoGalleryModal({ title, images, initialIndex = 0, onClose }: PhotoGalleryModalProps) {
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 50;

  const safeImages = useMemo(() => images.filter((src) => !brokenImages.has(src)), [images, brokenImages]);

  useEffect(() => {
    const nextIndex = Number.isFinite(initialIndex) ? Math.max(0, initialIndex) : 0;
    setBrokenImages(new Set());
    setCurrentIndex(nextIndex);
  }, [images, initialIndex]);

  useEffect(() => {
    if (safeImages.length === 0) {
      onClose();
      return;
    }
    if (currentIndex >= safeImages.length) {
      setCurrentIndex(safeImages.length - 1);
    }
  }, [currentIndex, onClose, safeImages.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
      }
      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % safeImages.length);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, safeImages.length]);


  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    html.classList.add('gallery-modal-open');
    body.classList.add('gallery-modal-open');
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      const bodyTop = body.style.top;
      html.classList.remove('gallery-modal-open');
      body.classList.remove('gallery-modal-open');
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      const nextScrollY = Math.abs(parseInt(bodyTop || '0', 10));
      window.scrollTo(0, Number.isFinite(nextScrollY) ? nextScrollY : 0);
    };
  }, []);

  if (safeImages.length === 0) return null;

  const currentImage = safeImages[currentIndex] ?? safeImages[0];
  const hasMany = safeImages.length > 1;

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % safeImages.length);

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.touches[0];
    if (!touch || !touchStartRef.current) return;
    touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = () => {
    if (!hasMany || !touchStartRef.current || !touchCurrentRef.current) {
      touchStartRef.current = null;
      touchCurrentRef.current = null;
      return;
    }

    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;

    if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < SWIPE_THRESHOLD) {
      touchStartRef.current = null;
      touchCurrentRef.current = null;
      return;
    }

    if (deltaX < 0) goNext();
    else goPrev();

    touchStartRef.current = null;
    touchCurrentRef.current = null;
  };

  return createPortal(
    <div className="gallery-modal-overlay" onClick={onClose} role="presentation">
      <div className="gallery-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="gallery-modal__header">
          <div className="gallery-modal__counter">{title} · {currentIndex + 1} / {safeImages.length}</div>
          <button type="button" className="gallery-modal__close" onClick={onClose} aria-label="Закрыть галерею">✕</button>
        </div>
        <div className="gallery-modal__media" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="gallery-modal__bg" style={{ backgroundImage: `url(${currentImage})` }} aria-hidden="true" />
          <img
            src={currentImage}
            alt={title}
            className="gallery-modal__img"
            onError={() => {
              const src = safeImages[currentIndex] ?? safeImages[0];
              if (!src) return;
              setBrokenImages((prev) => new Set(prev).add(src));
            }}
          />
          {hasMany ? (
            <>
              <button type="button" className="gallery-modal__nav gallery-modal__nav--prev" onClick={goPrev} aria-label="Предыдущее фото">‹</button>
              <button type="button" className="gallery-modal__nav gallery-modal__nav--next" onClick={goNext} aria-label="Следующее фото">›</button>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
