import { default as React } from 'react';
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
export declare const ProductImageViewer: React.FC<ProductImageViewerProps>;
export default ProductImageViewer;
