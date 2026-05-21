import { useMemo, useState } from 'react';
import { Text } from '@vkontakte/vkui';

type ImageWithFallbackProps = {
  src: string | null;
  alt: string;
  placeholderLabel: string;
  className: string;
  placeholderClassName: string;
};

const isValidImageSrc = (value: string | null): value is string => {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  return /^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/)/i.test(normalized);
};

export function ImageWithFallback({
  src,
  alt,
  placeholderLabel,
  className,
  placeholderClassName,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const canRenderImage = useMemo(() => isValidImageSrc(src) && !failed, [src, failed]);

  if (!canRenderImage) {
    return (
      <div className={placeholderClassName}>
        <Text weight="2">{placeholderLabel}</Text>
      </div>
    );
  }

  return <img className={className} src={src ?? undefined} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
