import { default as React } from 'react';
interface Board {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}
interface User {
    id: number;
    name: string;
    avatar?: string;
}
interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    logo?: string;
    siteName?: string;
    user?: User | null;
    boards?: Board[];
}
declare const MobileNav: React.FC<MobileNavProps>;
export default MobileNav;
