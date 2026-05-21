
export type IconStyle = 'solid' | 'regular' | 'light' | 'duotone' | 'brands';


export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x' | '4x' | '5x';


export enum IconName {
  
  User = 'fa-user',
  Users = 'fa-users',
  UserCircle = 'fa-user-circle',
  UserPlus = 'fa-user-plus',
  UserMinus = 'fa-user-minus',
  UserShield = 'fa-user-shield',

  
  Search = 'fa-search',
  Edit = 'fa-edit',
  Pencil = 'fa-pencil-alt',
  Trash = 'fa-trash',
  Save = 'fa-save',
  Plus = 'fa-plus',
  Minus = 'fa-minus',
  Check = 'fa-check',
  Times = 'fa-times',
  Download = 'fa-download',
  Upload = 'fa-upload',
  Copy = 'fa-copy',
  ExternalLink = 'fa-external-link-alt',

  
  Home = 'fa-home',
  ChevronLeft = 'fa-chevron-left',
  ChevronRight = 'fa-chevron-right',
  ChevronUp = 'fa-chevron-up',
  ChevronDown = 'fa-chevron-down',
  AngleLeft = 'fa-angle-left',
  AngleRight = 'fa-angle-right',
  AngleUp = 'fa-angle-up',
  AngleDown = 'fa-angle-down',
  ArrowUp = 'fa-arrow-up',
  ArrowDown = 'fa-arrow-down',
  ArrowLeft = 'fa-arrow-left',
  ArrowRight = 'fa-arrow-right',
  Bars = 'fa-bars',
  EllipsisVertical = 'fa-ellipsis-v',
  EllipsisHorizontal = 'fa-ellipsis-h',

  
  CheckCircle = 'fa-check-circle',
  TimesCircle = 'fa-times-circle',
  ExclamationCircle = 'fa-exclamation-circle',
  ExclamationTriangle = 'fa-exclamation-triangle',
  InfoCircle = 'fa-info-circle',
  QuestionCircle = 'fa-question-circle',
  XCircle = 'fa-times-circle',

  
  ShoppingCart = 'fa-shopping-cart',
  ShoppingBag = 'fa-shopping-bag',
  CreditCard = 'fa-credit-card',
  Tag = 'fa-tag',
  Tags = 'fa-tags',

  
  File = 'fa-file',
  FileAlt = 'fa-file-alt',
  Folder = 'fa-folder',
  FolderOpen = 'fa-folder-open',

  
  Envelope = 'fa-envelope',
  Phone = 'fa-phone',
  Comment = 'fa-comment',
  Comments = 'fa-comments',

  
  Cog = 'fa-cog',
  Cogs = 'fa-cogs',
  Settings = 'fa-cog',
  Wrench = 'fa-wrench',
  Sliders = 'fa-sliders-h',

  
  Image = 'fa-image',
  Images = 'fa-images',
  Video = 'fa-video',
  Camera = 'fa-camera',

  
  Heart = 'fa-heart',
  Star = 'fa-star',
  ThumbsUp = 'fa-thumbs-up',
  ThumbsDown = 'fa-thumbs-down',
  Share = 'fa-share',

  
  Clock = 'fa-clock',
  Calendar = 'fa-calendar',
  CalendarAlt = 'fa-calendar-alt',

  
  Lock = 'fa-lock',
  Unlock = 'fa-unlock',
  Eye = 'fa-eye',
  EyeSlash = 'fa-eye-slash',
  Bell = 'fa-bell',
  Flag = 'fa-flag',
  Map = 'fa-map',
  MapMarker = 'fa-map-marker-alt',
  Globe = 'fa-globe',
  Link = 'fa-link',
  Unlink = 'fa-unlink',
  Sun = 'fa-sun',
  Moon = 'fa-moon',

  
  ChartBar = 'fa-chart-bar',
  ChartLine = 'fa-chart-line',
  ChartPie = 'fa-chart-pie',
  ChartArea = 'fa-chart-area',

  
  Spinner = 'fa-spinner',
  CircleNotch = 'fa-circle-notch',

  
  CheckBadge = 'fa-badge-check',

  
  BellSlash = 'fa-bell-slash',

  
  BookOpen = 'fa-book-open',

  
  Building = 'fa-building',

  
  FileCircleCheck = 'fa-file-circle-check',

  
  WandMagicSparkles = 'fa-wand-magic-sparkles',

  
  UserXmark = 'fa-user-xmark',

  
  Cube = 'fa-cube',
  Cubes = 'fa-cubes',
  Plug = 'fa-plug',
  PuzzlePiece = 'fa-puzzle-piece',

  
  Fire = 'fa-fire',
  CommentDots = 'fa-comment-dots',
  DollarSign = 'fa-dollar-sign',
  Bars2 = 'fa-bars',
  X = 'fa-times',
  List = 'fa-list',
  ThLarge = 'fa-th-large',
  Inbox = 'fa-inbox',
  Box = 'fa-box',
  PaperPlane = 'fa-paper-plane',
  FileText = 'fa-file-alt',
  Paperclip = 'fa-paperclip',
  Truck = 'fa-truck',
  Sync = 'fa-sync',
  RotateLeft = 'fa-rotate-left',
  MapPin = 'fa-map-marker-alt',
  HelpCircle = 'fa-question-circle',
}


export const iconNameMap: Record<string, IconName> = {
  
  'user': IconName.User,
  'users': IconName.Users,
  'user-circle': IconName.UserCircle,
  'user-plus': IconName.UserPlus,
  'user-minus': IconName.UserMinus,
  'user-shield': IconName.UserShield,

  
  'search': IconName.Search,
  'edit': IconName.Edit,
  'pencil': IconName.Pencil,
  'trash': IconName.Trash,
  'save': IconName.Save,
  'plus': IconName.Plus,
  'minus': IconName.Minus,
  'check': IconName.Check,
  'times': IconName.Times,
  'download': IconName.Download,
  'upload': IconName.Upload,
  'copy': IconName.Copy,
  'external-link': IconName.ExternalLink,

  
  'home': IconName.Home,
  'chevron-left': IconName.ChevronLeft,
  'chevron-right': IconName.ChevronRight,
  'chevron-up': IconName.ChevronUp,
  'chevron-down': IconName.ChevronDown,
  'angle-left': IconName.AngleLeft,
  'angle-right': IconName.AngleRight,
  'angle-up': IconName.AngleUp,
  'angle-down': IconName.AngleDown,
  'arrow-up': IconName.ArrowUp,
  'arrow-down': IconName.ArrowDown,
  'arrow-left': IconName.ArrowLeft,
  'arrow-right': IconName.ArrowRight,
  'bars': IconName.Bars,
  'ellipsis-vertical': IconName.EllipsisVertical,
  'ellipsis-v': IconName.EllipsisVertical,
  'ellipsis-horizontal': IconName.EllipsisHorizontal,
  'ellipsis-h': IconName.EllipsisHorizontal,

  
  'check-circle': IconName.CheckCircle,
  'times-circle': IconName.TimesCircle,
  'x-circle': IconName.XCircle,
  'exclamation-circle': IconName.ExclamationCircle,
  'exclamation-triangle': IconName.ExclamationTriangle,
  'info-circle': IconName.InfoCircle,
  'question-circle': IconName.QuestionCircle,

  
  'shopping-cart': IconName.ShoppingCart,
  'shopping-bag': IconName.ShoppingBag,
  'credit-card': IconName.CreditCard,
  'tag': IconName.Tag,
  'tags': IconName.Tags,

  
  'file': IconName.File,
  'file-alt': IconName.FileAlt,
  'folder': IconName.Folder,
  'folder-open': IconName.FolderOpen,

  
  'envelope': IconName.Envelope,
  'phone': IconName.Phone,
  'comment': IconName.Comment,
  'comments': IconName.Comments,

  
  'cog': IconName.Cog,
  'cogs': IconName.Cogs,
  'settings': IconName.Settings,
  'wrench': IconName.Wrench,
  'sliders': IconName.Sliders,

  
  'image': IconName.Image,
  'images': IconName.Images,
  'video': IconName.Video,
  'camera': IconName.Camera,

  
  'heart': IconName.Heart,
  'star': IconName.Star,
  'thumbs-up': IconName.ThumbsUp,
  'thumbs-down': IconName.ThumbsDown,
  'share': IconName.Share,

  
  'clock': IconName.Clock,
  'calendar': IconName.Calendar,
  'calendar-alt': IconName.CalendarAlt,

  
  'lock': IconName.Lock,
  'unlock': IconName.Unlock,
  'eye': IconName.Eye,
  'eye-slash': IconName.EyeSlash,
  'bell': IconName.Bell,
  'flag': IconName.Flag,
  'map': IconName.Map,
  'map-marker': IconName.MapMarker,
  'globe': IconName.Globe,
  'link': IconName.Link,
  'unlink': IconName.Unlink,
  'sun': IconName.Sun,
  'moon': IconName.Moon,

  
  'chart-bar': IconName.ChartBar,
  'chart-line': IconName.ChartLine,
  'chart-pie': IconName.ChartPie,
  'chart-area': IconName.ChartArea,

  
  'spinner': IconName.Spinner,
  'circle-notch': IconName.CircleNotch,

  
  'check-badge': IconName.CheckBadge,
  'badge-check': IconName.CheckBadge,

  
  'cube': IconName.Cube,
  'cubes': IconName.Cubes,
  'plug': IconName.Plug,
  'puzzle-piece': IconName.PuzzlePiece,

  
  'flame': IconName.Fire,
  'fire': IconName.Fire,
  'message-square': IconName.CommentDots,
  'dollar-sign': IconName.DollarSign,
  'menu': IconName.Bars,
  'x': IconName.X,
  'list': IconName.List,
  'layout-grid': IconName.ThLarge,
  'th-large': IconName.ThLarge,
  'grid': IconName.ThLarge,
  'inbox': IconName.Inbox,
  'package': IconName.Box,
  'box': IconName.Box,
  'send': IconName.PaperPlane,
  'paper-plane': IconName.PaperPlane,
  'file-text': IconName.FileText,
  'paperclip': IconName.Paperclip,
  'truck': IconName.Truck,
  'refresh-cw': IconName.Sync,
  'sync': IconName.Sync,
  'undo-2': IconName.RotateLeft,
  'rotate-left': IconName.RotateLeft,
  'map-pin': IconName.MapPin,
  'help-circle': IconName.HelpCircle,

  
  'alert-triangle': IconName.ExclamationTriangle,
  'bell-off': IconName.BellSlash,
  'book-open': IconName.BookOpen,
  'building': IconName.Building,
  'edit-2': IconName.Edit,
  'edit-3': IconName.Edit,
  'file-check': IconName.FileCircleCheck,
  'mail': IconName.Envelope,
  'sparkles': IconName.WandMagicSparkles,
  'trash-2': IconName.Trash,
  'user-x': IconName.UserXmark,
};
