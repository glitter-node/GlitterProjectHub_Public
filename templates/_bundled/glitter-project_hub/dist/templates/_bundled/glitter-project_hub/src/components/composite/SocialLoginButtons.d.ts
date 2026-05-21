import { default as React } from 'react';
type SocialProvider = 'google' | 'naver' | 'kakao' | 'facebook' | 'apple';
interface SocialLoginButtonsProps {
    providers?: SocialProvider[];
    mode?: 'login' | 'register';
    variant?: 'full' | 'icon';
    className?: string;
}
declare const SocialLoginButtons: React.FC<SocialLoginButtonsProps>;
export default SocialLoginButtons;
