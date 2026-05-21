

import React from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Span } from '../basic/Span';


const logger = ((window as any).G7Core?.createLogger?.('Comp:PostReactions')) ?? {
    log: (...args: unknown[]) => console.log('[Comp:PostReactions]', ...args),
    warn: (...args: unknown[]) => console.warn('[Comp:PostReactions]', ...args),
    error: (...args: unknown[]) => console.error('[Comp:PostReactions]', ...args),
};


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

type ReactionType = 'like' | 'funny' | 'agree' | 'thanks' | 'wow';

interface ReactionCount {
  type: ReactionType;
  count: number;
}

interface PostReactionsProps {
  
  reactions: ReactionCount[];
  
  userReaction?: ReactionType | null;
  
  postId: number;
  
  onReact?: (type: ReactionType) => void;
  
  size?: 'sm' | 'md' | 'lg';
  
  className?: string;
}

interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  labelKey: string;
  activeColor: string;
}


const REACTION_CONFIGS: ReactionConfig[] = [
  { type: 'like', emoji: '👍', labelKey: 'board.reactions.like', activeColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { type: 'funny', emoji: '😂', labelKey: 'board.reactions.funny', activeColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { type: 'agree', emoji: '👌', labelKey: 'board.reactions.agree', activeColor: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { type: 'thanks', emoji: '🙏', labelKey: 'board.reactions.thanks', activeColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { type: 'wow', emoji: '😮', labelKey: 'board.reactions.wow', activeColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
];


const PostReactions: React.FC<PostReactionsProps> = ({
  reactions,
  userReaction,
  postId,
  onReact,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const emojiSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const getReactionCount = (type: ReactionType): number => {
    const reaction = reactions.find((r) => r.type === type);
    return reaction?.count ?? 0;
  };

  const handleClick = async (type: ReactionType) => {
    if (onReact) {
      onReact(type);
      return;
    }

    
    try {
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('리액션 처리 실패');
      }

      // 성공 시 페이지 새로고침 또는 상태 업데이트
      window.location.reload();
    } catch (error) {
      logger.error('리액션 오류:', error);
    }
  };

  return (
    <Div className={`flex flex-wrap gap-2 ${className}`}>
      {REACTION_CONFIGS.map((config) => {
        const count = getReactionCount(config.type);
        const isActive = userReaction === config.type;

        return (
          <Button
            key={config.type}
            onClick={() => handleClick(config.type)}
            className={`
              inline-flex items-center rounded-full border transition-colors
              ${sizeClasses[size]}
              ${isActive
                ? `${config.activeColor} border-transparent`
                : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
            title={t(config.labelKey)}
          >
            <Span className={emojiSizes[size]}>{config.emoji}</Span>
            <Span>{t(config.labelKey)}</Span>
            {count > 0 && (
              <Span className="font-medium">{count}</Span>
            )}
          </Button>
        );
      })}
    </Div>
  );
};

export default PostReactions;
