import { useEffect, useMemo, useState } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

type PartnerPhotoGalleryProps = {
  images: string[];
  alt: string;
  placeholderLabel: string;
  imageClassName: string;
  placeholderClassName: string;
};

export function PartnerPhotoGallery({
  images,
  alt,
  placeholderLabel,
  imageClassName,
  placeholderClassName,
}: PartnerPhotoGalleryProps) {
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages = useMemo(() => images.filter((src) => !brokenImages.has(src)), [images, brokenImages]);

  useEffect(() => {
    setBrokenImages(new Set());
    setCurrentIndex(0);
  }, [images]);

  useEffect(() => {
    if (currentIndex >= safeImages.length && safeImages.length > 0) {
      setCurrentIndex(safeImages.length - 1);
    }
  }, [currentIndex, safeImages.length]);

  if (safeImages.length === 0) {
    return (
      <ImageWithFallback
        src={null}
        alt={alt}
        className={imageClassName}
        placeholderClassName={placeholderClassName}
        placeholderLabel={placeholderLabel}
      />
    );
  }

  const hasMany = safeImages.length > 1;
  const currentImage = safeImages[currentIndex] ?? safeImages[0];

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % safeImages.length);

  return (
    <div className="partner-gallery">
      <img
        src={currentImage}
        alt={alt}
        className={imageClassName}
        onError={() => {
          const currentSrc = safeImages[currentIndex] ?? safeImages[0];
          if (!currentSrc) return;
          setBrokenImages((prev) => new Set(prev).add(currentSrc));
        }}
      />
      {hasMany ? (
        <>
          <button type="button" className="partner-gallery__nav partner-gallery__nav--prev" onClick={goPrev} aria-label="Предыдущее фото">‹</button>
          <button type="button" className="partner-gallery__nav partner-gallery__nav--next" onClick={goNext} aria-label="Следующее фото">›</button>
          <div className="partner-gallery__indicator">{currentIndex + 1} / {safeImages.length}</div>
        </>
      ) : null}
    </div>
  );
}
