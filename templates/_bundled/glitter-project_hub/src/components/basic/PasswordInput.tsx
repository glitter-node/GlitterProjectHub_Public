import React, { useState, useCallback, forwardRef, useImperativeHandle, useRef, useEffect, useMemo } from 'react';
import { Icon } from './Icon';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as unknown as { G7Core?: { t?: (key: string, params?: Record<string, string | number>) => string } })
    .G7Core?.t?.(key, params) ?? key;


export interface PasswordRule {
  
  key: string;
  
  labelKey: string;
  
  validate: (value: string, param?: number) => boolean;
  
  defaultParam?: number;
}


export const availablePasswordRules: Record<string, PasswordRule> = {
  minLength: {
    key: 'minLength',
    labelKey: 'auth.password_input.rules.minLength',
    defaultParam: 6,
    validate: (value: string, param = 6) => value.length >= param,
  },
  maxLength: {
    key: 'maxLength',
    labelKey: 'auth.password_input.rules.maxLength',
    defaultParam: 20,
    validate: (value: string, param = 20) => value.length <= param,
  },
  hasUppercase: {
    key: 'hasUppercase',
    labelKey: 'auth.password_input.rules.hasUppercase',
    validate: (value: string) => /[A-Z]/.test(value),
  },
  hasLowercase: {
    key: 'hasLowercase',
    labelKey: 'auth.password_input.rules.hasLowercase',
    validate: (value: string) => /[a-z]/.test(value),
  },
  hasNumber: {
    key: 'hasNumber',
    labelKey: 'auth.password_input.rules.hasNumber',
    validate: (value: string) => /[0-9]/.test(value),
  },
  hasSpecial: {
    key: 'hasSpecial',
    labelKey: 'auth.password_input.rules.hasSpecial',
    validate: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
  noSpaces: {
    key: 'noSpaces',
    labelKey: 'auth.password_input.rules.noSpaces',
    validate: (value: string) => !/\s/.test(value),
  },
  minTypes: {
    key: 'minTypes',
    labelKey: 'auth.password_input.rules.minTypes',
    defaultParam: 3,
    validate: (value: string, param = 3) => {
      let types = 0;
      if (/[A-Z]/.test(value)) types++;
      if (/[a-z]/.test(value)) types++;
      if (/[0-9]/.test(value)) types++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) types++;
      return types >= param;
    },
  },
};


export const defaultPasswordRules: PasswordRule[] = [
  availablePasswordRules.minLength,
];


interface ParsedRule {
  rule: PasswordRule;
  param?: number;
}


function parseRuleString(ruleString: string): ParsedRule | null {
  const [key, paramStr] = ruleString.split(':');
  const rule = availablePasswordRules[key];
  if (!rule) return null;

  const param = paramStr ? parseInt(paramStr, 10) : rule.defaultParam;
  return { rule, param: isNaN(param as number) ? rule.defaultParam : param };
}


interface NonStandardProps {
  loadingactions?: unknown;
  formdata?: unknown;
}

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  
  label?: string;
  
  error?: string;
  
  showToggle?: boolean;
  
  showValidation?: boolean;
  
  isConfirmField?: boolean;
  
  confirmTarget?: string;
  
  onMatchChange?: (isMatch: boolean) => void;
  
  onValidityChange?: (isValid: boolean, failedRules: string[]) => void;
  
  rules?: PasswordRule[];
  
  enableRules?: string[];
  
  showRules?: string[];
  
  wrapperClassName?: string;
  
  validationClassName?: string;
}


export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      showToggle = true,
      showValidation = false,
      isConfirmField = false,
      confirmTarget,
      onMatchChange,
      onValidityChange,
      rules,
      enableRules,
      showRules,
      wrapperClassName = '',
      validationClassName = '',
      className = '',
      onChange,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    
    const [showPassword, setShowPassword] = useState(false);

    
    const [capsLockOn, setCapsLockOn] = useState(false);

    
    const [internalValue, setInternalValue] = useState<string>(
      (value as string) ?? (defaultValue as string) ?? ''
    );

    
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value as string);
      }
    }, [value]);

    
    const parsedRules = useMemo((): ParsedRule[] => {
      
      if (rules && rules.length > 0) {
        return rules.map((rule) => ({ rule, param: rule.defaultParam }));
      }

      
      if (enableRules && enableRules.length > 0) {
        return enableRules
          .map((ruleStr) => parseRuleString(ruleStr))
          .filter((parsed): parsed is ParsedRule => parsed !== null);
      }

      
      return defaultPasswordRules.map((rule) => ({ rule, param: rule.defaultParam }));
    }, [rules, enableRules]);

    
    const displayRules = useMemo(() => {
      if (!showRules || showRules.length === 0) return parsedRules;
      return parsedRules.filter((parsed) => showRules.includes(parsed.rule.key));
    }, [parsedRules, showRules]);

    
    const validationResults = useMemo(() => {
      if (!showValidation || isConfirmField) return {};
      return displayRules.reduce((acc, { rule, param }) => {
        acc[rule.key] = rule.validate(internalValue, param);
        return acc;
      }, {} as Record<string, boolean>);
    }, [internalValue, displayRules, showValidation, isConfirmField]);

    
    const isMatch = useMemo(() => {
      if (!isConfirmField || confirmTarget === undefined) return true;
      return internalValue === confirmTarget && internalValue.length > 0;
    }, [isConfirmField, internalValue, confirmTarget]);

    
    const isAllValid = useMemo(() => {
      if (!showValidation) return true;
      return Object.values(validationResults).every((v) => v);
    }, [validationResults, showValidation]);

    
    useEffect(() => {
      if (onValidityChange && showValidation && !isConfirmField) {
        const failedRules = Object.entries(validationResults)
          .filter(([, passed]) => !passed)
          .map(([key]) => key);
        onValidityChange(isAllValid, failedRules);
      }
    }, [isAllValid, validationResults, onValidityChange, showValidation, isConfirmField]);

    
    useEffect(() => {
      if (onMatchChange && isConfirmField) {
        onMatchChange(isMatch);
      }
    }, [isMatch, onMatchChange, isConfirmField]);

    
    const handleToggle = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        if (onChange) {
          onChange(e);
        }
      },
      [onChange]
    );

    
    const handleKeyEvent = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLockOn(e.getModifierState('CapsLock'));
      },
      []
    );

    
    const { loadingactions, formdata, ...validProps } = props as typeof props & NonStandardProps;

    return (
      <div className={`relative ${wrapperClassName}`}>
        <div className="relative">
          <input
            ref={internalRef}
            type={showPassword ? 'text' : 'password'}
            className={`${className} ${showToggle ? 'pr-10' : ''}`}
            value={value !== undefined ? (value as string) : undefined}
            defaultValue={value === undefined ? defaultValue : undefined}
            onChange={handleChange}
            onKeyDown={handleKeyEvent}
            onKeyUp={handleKeyEvent}
            disabled={disabled}
            {...validProps}
          />

          {showToggle && (
            <button
              type="button"
              onClick={handleToggle}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:opacity-50"
              aria-label={showPassword ? t('auth.password_input.hide') : t('auth.password_input.show')}
            >
              <Icon
                name={showPassword ? 'eye-slash' : 'eye'}
                className="w-5 h-5"
              />
            </button>
          )}
        </div>

        {capsLockOn && !showPassword && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
            <Icon name="triangle-exclamation" className="w-4 h-4" />
            <span>{t('auth.password_input.caps_lock_on')}</span>
          </div>
        )}

        {isConfirmField && confirmTarget !== undefined && internalValue.length > 0 && (
          <div
            className={`mt-2 flex items-center gap-1.5 text-sm ${
              isMatch
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            <Icon
              name={isMatch ? 'check-circle' : 'xmark-circle'}
              className="w-4 h-4"
            />
            <span>{isMatch ? t('auth.password_input.match') : t('auth.password_input.mismatch')}</span>
          </div>
        )}

        {showValidation && !isConfirmField && internalValue.length > 0 && (
          <div className={`mt-2 space-y-1 ${validationClassName}`}>
            {displayRules.map(({ rule, param }) => {
              const passed = validationResults[rule.key];
              // 파라미터가 있는 규칙은 라벨에 파라미터 값 전달
              const labelParams = param !== undefined ? { count: param } : undefined;
              return (
                <div
                  key={rule.key}
                  className={`flex items-center gap-1.5 text-sm ${
                    passed
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon
                    name={passed ? 'check-circle' : 'circle'}
                    className="w-4 h-4"
                  />
                  <span>{t(rule.labelKey, labelParams)}</span>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
