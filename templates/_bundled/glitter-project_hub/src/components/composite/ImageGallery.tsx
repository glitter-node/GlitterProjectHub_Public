

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Lightbox, { Slide } from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

import { Button } from '../basic/Button';
import { I } from '../basic/I';


const G7Core = (window as any).G7Core;


const t = (key: string, params?: Record<string, string | number>) =>
  G7Core?.t?.(key, params) ?? key;



export interface GalleryImage {
  
  src: string;
  
  downloadUrl?: string;
  
  title?: string;
  
  description?: string;
  
  thumbnail?: string;
  
  filename?: string;
  
  downloadRequiresAuth?: boolean;
}

export interface ImageGalleryProps {
  
  images: GalleryImage[];
  
  isOpen: boolean;
  
  onClose: () => void;
  
  startIndex?: number;
  
  enableZoom?: boolean;
  
  enableSlideshow?: boolean;
  
  enableFullscreen?: boolean;
  
  showCounter?: boolean;
  
  showDownload?: boolean;
  
  showThumbnails?: boolean;
  
  onDownload?: (image: GalleryImage, index: number) => void;
}




const downloadAuthenticatedFile = async (url: string, filename: string): Promise<void> => {
  try {
    const blob = await G7Core.api.get(url, {
      responseType: 'blob',
    });

    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    console.error('Failed to download file:', error);
    G7Core?.toast?.error?.(t('common.download_failed'));
  }
};


const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const executeImageDownload = async (image: GalleryImage): Promise<void> => {
  const downloadUrl = image.downloadUrl || image.src;
  const filename = image.filename || image.title || 'image';

  if (image.downloadRequiresAuth) {
    await downloadAuthenticatedFile(downloadUrl, filename);
  } else {
    downloadFile(downloadUrl, filename);
  }
};



interface DownloadButtonProps {
  image: GalleryImage;
  index: number;
  onDownload?: (image: GalleryImage, index: number) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ image, index, onDownload }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onDownload) {
      onDownload(image, index);
      return;
    }

    setIsDownloading(true);
    try {
      await executeImageDownload(image);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="yarl__button flex items-center justify-center"
      aria-label={t('common.download')}
      title={t('common.download')}
    >
      {isDownloading ? (
        <I className="fa-solid fa-spinner fa-spin text-white" />
      ) : (
        <I className="fa-solid fa-download text-white" />
      )}
    </Button>
  );
};



export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  isOpen,
  onClose,
  startIndex = 0,
  enableZoom = true,
  enableSlideshow = false,
  enableFullscreen = true,
  showCounter = true,
  showDownload = true,
  showThumbnails = true,
  onDownload,
}) => {
  
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  
  const currentIndexRef = useRef(startIndex);

  
  const slides: Slide[] = images.map((image) => ({
    src: image.src,
    title: image.title,
    description: image.description,
  }));

  
  const plugins = [];
  if (enableZoom) plugins.push(Zoom);
  if (enableSlideshow) plugins.push(Slideshow);
  if (enableFullscreen) plugins.push(Fullscreen);
  if (showCounter) plugins.push(Counter);
  if (showThumbnails) plugins.push(Thumbnails);

  
  const currentImage = images[currentIndex];

  
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={currentIndex}
      plugins={plugins}
      on={{
        view: ({ index }) => {
          if (index !== currentIndexRef.current) {
            setCurrentIndex(index);
          }
        },
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: true,
      }}
      carousel={{
        finite: true,
        preload: 2,
        padding: '16px',
        spacing: '30%',
      }}
      animation={{
        fade: 250,
        swipe: 500,
        easing: {
          fade: 'ease',
          swipe: 'ease-out',
          navigation: 'ease-in-out',
        },
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
        closeOnPullUp: true,
      }}
      thumbnails={{
        position: 'bottom',
        width: 120,
        height: 80,
        border: 2,
        borderRadius: 4,
        padding: 4,
        gap: 16,
        showToggle: false,
        vignette: true,
      }}
      toolbar={{
        buttons: [
          showDownload && currentImage && (
            <DownloadButton
              key="download"
              image={currentImage}
              index={currentIndex}
              onDownload={onDownload}
            />
          ),
          'close',
        ].filter(Boolean),
      }}
      styles={{
        container: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
      }}
    />
  );
};




export const useImageGallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  const openGallery = useCallback((galleryImages: GalleryImage[], index = 0) => {
    setImages(galleryImages);
    setStartIndex(index);
    setIsOpen(true);
  }, []);

  const closeGallery = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openGallery,
    closeGallery,
    galleryProps: {
      images,
      isOpen,
      onClose: closeGallery,
      startIndex,
    },
  };
};

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
