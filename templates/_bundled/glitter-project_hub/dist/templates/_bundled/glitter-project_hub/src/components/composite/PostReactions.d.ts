import { default as React } from 'react';
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
declare const PostReactions: React.FC<PostReactionsProps>;
export default PostReactions;
