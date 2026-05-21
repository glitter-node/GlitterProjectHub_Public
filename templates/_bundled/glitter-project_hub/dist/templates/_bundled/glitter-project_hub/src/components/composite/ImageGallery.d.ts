import { default as React } from 'react';
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
export declare const executeImageDownload: (image: GalleryImage) => Promise<void>;
export declare const ImageGallery: React.FC<ImageGalleryProps>;
export declare const useImageGallery: () => {
    isOpen: boolean;
    openGallery: (galleryImages: GalleryImage[], index?: number) => void;
    closeGallery: () => void;
    galleryProps: {
        images: GalleryImage[];
        isOpen: boolean;
        onClose: () => void;
        startIndex: number;
    };
};
export default ImageGallery;
