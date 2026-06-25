import { useListProfiles, getListProfilesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Loader2, Search, MapPin, GraduationCap } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Directory() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: profiles, isLoading } = useListProfiles(
    { search: debouncedSearch },
    { query: { queryKey: getListProfilesQueryKey({ search: debouncedSearch }) } }
  );

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Student Directory</h1>
        <p className="text-muted-foreground text-lg">Connect with your cohort peers.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input 
          placeholder="Search by name, college, major, or tags..." 
          className="h-14 pl-12 bg-card border-none shadow-sm rounded-2xl text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50 h-8 w-8" /></div>
      ) : profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Link key={profile.id} href={`/students/${profile.id}`}>
              <Card className="p-6 flex flex-col gap-4 hover:shadow-md transition-all hover:border-primary/30 cursor-pointer h-full border border-border/50 bg-card/50 backdrop-blur-sm group">
                <div className="flex gap-4 items-start">
                  <Avatar className="h-16 w-16 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                    <AvatarImage src={profile.photoUrl || undefined} />
                    <AvatarFallback className="text-lg bg-primary/5 text-primary">{getInitials(profile.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{profile.fullName}</h3>
                    {profile.pronouns && <p className="text-xs text-muted-foreground">{profile.pronouns}</p>}
                    {profile.homeCity && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {profile.homeCity}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                    <GraduationCap size={14} className="text-primary/70" />
                    <span className="font-medium">{profile.college}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-5">
                    {profile.major} • {profile.year}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
                  {profile.interestTags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 font-normal px-2 rounded-md">
                      {tag}
                    </Badge>
                  ))}
                  {profile.interestTags.length > 3 && (
                    <Badge variant="outline" className="font-normal px-2 rounded-md border-dashed">
                      +{profile.interestTags.length - 3}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-muted-foreground bg-card rounded-2xl border border-dashed">
          No students found matching your search.
        </div>
      )}
    </div>
  );
}
