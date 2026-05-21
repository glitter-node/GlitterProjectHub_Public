import { default as React } from 'react';
interface SocialLinks {
    github?: string;
    twitter?: string;
    discord?: string;
    facebook?: string;
    instagram?: string;
}
interface FooterLink {
    label: string;
    href: string;
}
interface FooterLinkGroup {
    title: string;
    links: FooterLink[];
}
interface FooterProps {
    siteName?: string;
    siteDescription?: string;
    copyrightText?: string;
    socialLinks?: SocialLinks;
    linkGroups?: FooterLinkGroup[];
    className?: string;
}
declare const Footer: React.FC<FooterProps>;
export default Footer;
