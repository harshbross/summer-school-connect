import { useListPosts, useCreatePost, getListPostsQueryKey, useGetUpcomingEvents } from "@workspace/api-client-react";
import { PostType, PostInputType } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostCard } from "@/components/post-card";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Home() {
  const [filterType, setFilterType] = useState<PostType | "all">("all");
  const queryClient = useQueryClient();
  const createPost = useCreatePost();
  
  const { data: posts, isLoading: postsLoading } = useListPosts(
    { type: filterType !== "all" ? filterType : undefined },
    { query: { queryKey: getListPostsQueryKey({ type: filterType !== "all" ? filterType : undefined }) } }
  );

  const { data: upcomingEvents, isLoading: eventsLoading } = useGetUpcomingEvents();

  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<PostInputType>(PostInputType.discussion);

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;

    createPost.mutate(
      { data: { type: newPostType, content: newPostContent } },
      {
        onSuccess: () => {
          setNewPostContent("");
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Community Feed</h1>
          <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
            <SelectTrigger className="w-[160px] h-9 bg-card border-none shadow-sm rounded-full">
              <SelectValue placeholder="All Posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value={PostType.announcement}>Announcements</SelectItem>
              <SelectItem value={PostType.discussion}>Discussions</SelectItem>
              <SelectItem value={PostType.resource}>Resources</SelectItem>
              <SelectItem value={PostType.introduction}>Introductions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Post Composer */}
        <Card className="p-4 flex flex-col gap-3 shadow-sm border-primary/10">
          <Textarea 
            placeholder="Share something with the cohort..." 
            className="resize-none border-none focus-visible:ring-0 px-2 shadow-none text-base"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <div className="flex items-center justify-between border-t pt-3">
            <Select value={newPostType} onValueChange={(val: any) => setNewPostType(val)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/50 border-none rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PostInputType.discussion}>Discussion</SelectItem>
                <SelectItem value={PostInputType.resource}>Resource</SelectItem>
                <SelectItem value={PostInputType.introduction}>Introduction</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              size="sm" 
              className="rounded-full px-6" 
              onClick={handlePostSubmit}
              disabled={!newPostContent.trim() || createPost.isPending}
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {postsLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50" /></div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed">
              No posts found. Be the first to share something!
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Upcoming Events Sidebar */}
        <div className="bg-card rounded-2xl border p-5 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={18} className="text-primary" />
            <h2 className="font-serif font-semibold text-lg">Upcoming Events</h2>
          </div>

          <div className="space-y-4">
            {eventsLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50" /></div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 4).map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group block p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(event.startAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events.</p>
            )}
          </div>
          
          <Button variant="outline" className="w-full mt-4 rounded-xl" asChild>
            <Link href="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
