import { useGetProfile } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, GraduationCap, Calendar, Link as LinkIcon, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { format } from "date-fns";

export default function StudentProfile() {
  const { id } = useParams();
  const studentId = parseInt(id || "0");

  const { data: profile, isLoading } = useGetProfile(studentId, {
    query: { enabled: !!studentId, queryKey: ["profile", studentId] }
  });

  if (isLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50 h-8 w-8" /></div>;
  }

  if (!profile) {
    return <div className="py-24 text-center text-muted-foreground">Profile not found.</div>;
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/80 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-6">
            <Avatar className="h-32 w-32 border-4 border-card bg-card shadow-md">
              <AvatarImage src={profile.photoUrl || undefined} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-serif">{getInitials(profile.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-serif font-bold text-foreground">{profile.fullName}</h1>
                {profile.pronouns && (
                  <Badge variant="outline" className="bg-background">{profile.pronouns}</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm font-medium">
                <span className="flex items-center gap-1.5"><GraduationCap size={16} /> {profile.college}</span>
                {profile.homeCity && <span className="flex items-center gap-1.5"><MapPin size={16} /> {profile.homeCity}</span>}
              </div>
            </div>
            <div className="pb-2 w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full gap-2">
                <MessageCircle size={16} /> Message
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/50">
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-semibold">About</h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>

              {profile.funFact && (
                <div className="bg-accent/10 rounded-2xl p-5 border border-accent/20">
                  <h3 className="text-sm font-semibold text-accent-foreground mb-1 uppercase tracking-wider">Fun Fact</h3>
                  <p className="text-foreground font-medium">{profile.funFact}</p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-serif font-semibold">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interestTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 bg-secondary/10 text-secondary hover:bg-secondary/20">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-muted/30 p-6 rounded-2xl border border-border/50 h-fit">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Academic Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Major</div>
                    <div className="font-medium text-sm">{profile.major}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Year</div>
                    <div className="font-medium text-sm capitalize">{profile.year}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Connect</h3>
                <div className="space-y-3">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors">
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  )}
                  {profile.instagramHandle && (
                    <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors">
                      <Instagram size={16} /> Instagram
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors">
                      <LinkIcon size={16} /> Website
                    </a>
                  )}
                  {!profile.linkedinUrl && !profile.instagramHandle && !profile.websiteUrl && (
                    <div className="text-sm text-muted-foreground italic">No external links provided.</div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar size={14} /> Joined {format(new Date(profile.joinedAt), "MMM yyyy")}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
