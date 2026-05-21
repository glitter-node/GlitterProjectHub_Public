import { default as React } from 'react';
interface QuantitySelectorProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}
declare const QuantitySelector: React.FC<QuantitySelectorProps>;
export default QuantitySelector;
