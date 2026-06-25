import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@workspace/api-client-react";
import { MessageSquare, Heart, ThumbsUp, Flame, Lightbulb, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactToPost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const reactToPost = useReactToPost();
  const queryClient = useQueryClient();

  const handleReaction = (emoji: "like" | "fire" | "heart" | "insightful") => {
    reactToPost.mutate(
      { id: post.id, data: { emoji } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const isLiked = post.myReaction === "like";
  const isHeart = post.myReaction === "heart";
  const isFire = post.myReaction === "fire";
  const isInsightful = post.myReaction === "insightful";

  return (
    <Card className="p-5 flex flex-col gap-4 overflow-hidden relative group transition-all duration-200 hover:shadow-md">
      {post.isPinned && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <Pin size={12} /> Pinned
        </div>
      )}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/10">
          <AvatarImage src={post.authorPhoto || undefined} />
          <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-2">
            {post.authorName}
            {post.authorCollege && <span className="text-xs font-normal text-muted-foreground">• {post.authorCollege}</span>}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            <span>•</span>
            <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0">
              {post.type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>

      {post.linkUrl && (
        <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
          {post.linkUrl}
        </a>
      )}

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-primary/80 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-border/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 gap-1.5 rounded-full ${isHeart ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:text-rose-500'}`}
          onClick={() => handleReaction("heart")}
        >
          <Heart size={16} className={isHeart ? "fill-current" : ""} />
          <span className="text-xs">{post.reactions.heart || 0}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 gap-1.5 rounded-full ${isLiked ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground hover:text-blue-500'}`}
          onClick={() => handleReaction("like")}
        >
          <ThumbsUp size={16} className={isLiked ? "fill-current" : ""} />
          <span className="text-xs">{post.reactions.like || 0}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 gap-1.5 rounded-full ${isFire ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:text-orange-500'}`}
          onClick={() => handleReaction("fire")}
        >
          <Flame size={16} className={isFire ? "fill-current" : ""} />
          <span className="text-xs">{post.reactions.fire || 0}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 gap-1.5 rounded-full ${isInsightful ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:text-amber-500'}`}
          onClick={() => handleReaction("insightful")}
        >
          <Lightbulb size={16} className={isInsightful ? "fill-current" : ""} />
          <span className="text-xs">{post.reactions.insightful || 0}</span>
        </Button>
        
        <div className="flex-1" />
        
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground rounded-full">
          <MessageSquare size={16} />
          <span className="text-xs">{post.commentCount} Comments</span>
        </Button>
      </div>
    </Card>
  );
}
