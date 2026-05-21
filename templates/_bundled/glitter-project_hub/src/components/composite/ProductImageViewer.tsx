

import React, { useState, useMemo } from 'react';
import { Div } from '../basic/Div';
import { Img } from '../basic/Img';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { ImageGallery, useImageGallery, GalleryImage } from './ImageGallery';


const G7Core = (window as any).G7Core;

const t = (key: string, params?: Record<string, string | number>) =>
  G7Core?.t?.(key, params) ?? key;



export interface ProductImage {
  
  id: number;
  
  url: string | null;
  
  download_url: string;
  
  alt_text_current?: string;
  
  is_thumbnail?: boolean;
  
  sort_order?: number;
}

export interface ProductImageViewerProps {
  
  images: ProductImage[];
  
  className?: string;
}




const getImageSrc = (image: ProductImage): string => {
  return image.url ?? image.download_url;
};



export const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  images = [],
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { openGallery, galleryProps } = useImageGallery();

  
  const galleryImages: GalleryImage[] = useMemo(
    () =>
      images.map((img) => ({
        src: getImageSrc(img),
        title: img.alt_text_current ?? '',
        thumbnail: getImageSrc(img),
        downloadUrl: img.download_url,
        filename: img.alt_text_current ?? `image-${img.id}`,
      })),
    [images],
  );

  if (!images || images.length === 0) {
    return (
      <Div
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg aspect-square ${className}`}
      >
        <Div className="text-center text-slate-400 dark:text-slate-500">
          <Icon name="image" size="3x" className="mb-3 opacity-50" />
          <Div className="text-sm">{t('shop.no_image')}</Div>
        </Div>
      </Div>
    );
  }

  const currentImage = images[selectedIndex] ?? images[0];

  return (
    <Div className={className}>
      <Div className="relative overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700 aspect-square mb-3">
        <Button
          type="button"
          className="w-full h-full cursor-zoom-in block"
          onClick={() => openGallery(galleryImages, selectedIndex)}
          aria-label={t('shop.view_image')}
        >
          <Img
            src={getImageSrc(currentImage)}
            alt={currentImage.alt_text_current ?? ''}
            className="w-full h-full object-contain"
          />
        </Button>
      </Div>

      {images.length > 1 && (
        <Div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <Button
              key={img.id}
              type="button"
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${
                index === selectedIndex
                  ? 'border-slate-900 dark:border-white'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400'
              }`}
              onClick={() => setSelectedIndex(index)}
              aria-label={img.alt_text_current ?? `${t('shop.image')} ${index + 1}`}
            >
              <Img
                src={getImageSrc(img)}
                alt={img.alt_text_current ?? ''}
                className="w-full h-full object-cover"
              />
            </Button>
          ))}
        </Div>
      )}

      <ImageGallery {...galleryProps} />
    </Div>
  );
};

ProductImageViewer.displayName = 'ProductImageViewer';

export default ProductImageViewer;
