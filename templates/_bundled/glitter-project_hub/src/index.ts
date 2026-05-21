


const logger = ((window as any).G7Core?.createLogger?.('Template:glitter-project_hub')) ?? {
    log: (...args: unknown[]) => console.log('[Template:glitter-project_hub]', ...args),
    warn: (...args: unknown[]) => console.warn('[Template:glitter-project_hub]', ...args),
    error: (...args: unknown[]) => console.error('[Template:glitter-project_hub]', ...args),
};


import './styles/main.css';


export {
  Badge,
  type BadgeProps,
  Button,
  type ButtonProps,
  FileInput,
  type FileInputProps,
  Input,
  type InputProps,
  PasswordInput,
  type PasswordInputProps,
  type PasswordRule,
  defaultPasswordRules,
  availablePasswordRules,
  Textarea,
  type TextareaProps,
  Label,
  type LabelProps,
  Div,
  type DivProps,
  Span,
  type SpanProps,
  P,
  type PProps,
  Img,
  type ImgProps,
  H1,
  type H1Props,
  H2,
  type H2Props,
  H3,
  type H3Props,
  H4,
  type H4Props,
  Ul,
  type UlProps,
  Ol,
  type OlProps,
  Li,
  type LiProps,
  A,
  type AProps,
  Form,
  type FormProps,
  Select,
  type SelectProps,
  Option,
  type OptionProps,
  Optgroup,
  type OptgroupProps,
  Checkbox,
  type CheckboxProps,
  Table,
  type TableProps,
  Thead,
  type TheadProps,
  Tbody,
  type TbodyProps,
  Tr,
  type TrProps,
  Th,
  type ThProps,
  Td,
  type TdProps,
  Nav,
  type NavProps,
  Section,
  type SectionProps,
  Svg,
  type SvgProps,
  Icon,
  type IconProps,
  Code,
  type CodeProps,
  Footer as BasicFooter,
  type FooterProps as BasicFooterProps,
  Header as BasicHeader,
  type HeaderProps as BasicHeaderProps,
  Hr,
  type HrProps,
  IconName,
  type IconStyle,
  type IconSize,
} from './components/basic';


export * from './components/composite';


export * from './components/layout';


import templateMetadata from '../template.json';


import { handlerMap } from './handlers';


if (typeof window !== 'undefined') {
  (window as any).G7TemplateHandlers = handlerMap;
}


export { templateMetadata };


export function initTemplate(): void {
  
  if (typeof window !== 'undefined') {
    let retryCount = 0;
    const maxRetries = 50; 

    const registerHandlers = () => {
      const actionDispatcher = (window as any).G7Core?.getActionDispatcher?.();

      if (actionDispatcher) {
        
        Object.entries(handlerMap).forEach(([name, handler]) => {
          actionDispatcher.registerHandler(name, handler);
        });

        logger.log(`${Object.keys(handlerMap).length} custom handler(s) registered:`, Object.keys(handlerMap));
      } else {
        retryCount++;
        if (retryCount <= maxRetries) {
          logger.warn(`ActionDispatcher not found, retrying... (${retryCount}/${maxRetries})`);
          setTimeout(registerHandlers, 100);
        } else {
          logger.error('Failed to register handlers: ActionDispatcher not available after maximum retries');
        }
      }
    };

    // window.load 이벤트 사용 (모든 리소스 로드 완료 후)
    if (document.readyState === 'complete') {
      registerHandlers();
    } else {
      window.addEventListener('load', registerHandlers);
    }
  }
}

// 템플릿 초기화 자동 실행
initTemplate();
