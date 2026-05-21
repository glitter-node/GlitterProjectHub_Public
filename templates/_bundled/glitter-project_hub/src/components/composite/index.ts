


export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as MobileNav } from './MobileNav';
export { NotificationCenter } from './NotificationCenter';
export type { NotificationCenterProps, NotificationItem } from './NotificationCenter';


export { default as ImageGallery } from './ImageGallery';
export { default as ProductImageViewer } from './ProductImageViewer';
export { default as QuantitySelector } from './QuantitySelector';


export { default as PostReactions } from './PostReactions';
export { default as RichTextEditor } from './RichTextEditor';
export { HtmlContent } from './HtmlContent';
export { HtmlEditor } from './HtmlEditor';


export { ExpandableContent } from './ExpandableContent';


export { default as FileUploader } from './FileUploader';
export { ConfirmDialog } from './ConfirmDialog';
export { default as SocialLoginButtons } from './SocialLoginButtons';
export { default as Toast } from './Toast';
export { default as PageTransitionIndicator } from './PageTransitionIndicator';
export { default as PageTransitionBlur } from './PageTransitionBlur';
export { default as PageSkeleton } from './PageSkeleton';
export { default as PageLoading } from './PageLoading';
export { default as ThemeToggle } from './ThemeToggle';
export { Pagination } from './Pagination';
export { SearchBar } from './SearchBar';
export { Avatar } from './Avatar';
export { AvatarUploader } from './AvatarUploader';
export { UserInfo } from './UserInfo';
export { Modal } from './Modal';
export { TabNavigation } from './TabNavigation';



export const compositeComponents = {
  
  Header: () => import('./Header'),
  Footer: () => import('./Footer'),
  MobileNav: () => import('./MobileNav'),
  NotificationCenter: () => import('./NotificationCenter'),

  
  ImageGallery: () => import('./ImageGallery'),
  ProductImageViewer: () => import('./ProductImageViewer'),
  QuantitySelector: () => import('./QuantitySelector'),

  
  PostReactions: () => import('./PostReactions'),
  RichTextEditor: () => import('./RichTextEditor'),
  HtmlContent: () => import('./HtmlContent'),
  HtmlEditor: () => import('./HtmlEditor'),

  
  ExpandableContent: () => import('./ExpandableContent'),

  
  FileUploader: () => import('./FileUploader'),
  ConfirmDialog: () => import('./ConfirmDialog'),
  SocialLoginButtons: () => import('./SocialLoginButtons'),
  Toast: () => import('./Toast'),
  PageTransitionIndicator: () => import('./PageTransitionIndicator'),
  PageTransitionBlur: () => import('./PageTransitionBlur'),
  PageSkeleton: () => import('./PageSkeleton'),
  PageLoading: () => import('./PageLoading'),
  ThemeToggle: () => import('./ThemeToggle'),
  Pagination: () => import('./Pagination'),
  SearchBar: () => import('./SearchBar'),
  Avatar: () => import('./Avatar'),
  AvatarUploader: () => import('./AvatarUploader'),
  UserInfo: () => import('./UserInfo'),
  Modal: () => import('./Modal'),
  TabNavigation: () => import('./TabNavigation'),
  
};


export type CompositeComponentName = keyof typeof compositeComponents;
