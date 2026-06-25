import { useParams, Link } from "wouter";
import { useGetEvent, useGetEventRsvps, useRsvpEvent, getGetEventQueryKey, getGetEventRsvpsQueryKey } from "@workspace/api-client-react";
import { RsvpInputStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Calendar, MapPin, Clock, Users, ChevronLeft, Info, Video } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function EventDetail() {
  const { id } = useParams();
  const eventId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) }
  });

  const { data: rsvps, isLoading: rsvpsLoading } = useGetEventRsvps(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventRsvpsQueryKey(eventId) }
  });

  const rsvpMutation = useRsvpEvent();

  const handleRsvp = (status: RsvpInputStatus) => {
    rsvpMutation.mutate({ id: eventId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
        queryClient.invalidateQueries({ queryKey: getGetEventRsvpsQueryKey(eventId) });
        toast({ title: "RSVP updated successfully" });
      }
    });
  };

  if (eventLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50 h-8 w-8" /></div>;
  }

  if (!event) {
    return <div className="py-24 text-center text-muted-foreground">Event not found.</div>;
  }

  const isPast = event.status === "past";

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button variant="ghost" asChild className="mb-4 -ml-4 gap-2 text-muted-foreground hover:text-foreground">
        <Link href="/events"><ChevronLeft size={16} /> Back to Events</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="uppercase tracking-wider font-semibold border-primary/20 text-primary bg-primary/5">
              {event.eventType}
            </Badge>
            <h1 className="text-4xl font-serif font-bold leading-tight">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium">
              <span className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                {format(new Date(event.startAt), "EEEE, MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                {format(new Date(event.startAt), "h:mm a")} - {format(new Date(event.endAt), "h:mm a")}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm space-y-6">
            <h2 className="text-2xl font-serif font-semibold">About this event</h2>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-lg">
              {event.description}
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin size={18} className="text-primary" /> Location
                </div>
                <div className="text-muted-foreground pl-7">{event.location}</div>
              </div>
              {event.meetingUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Video size={18} className="text-primary" /> Virtual Link
                  </div>
                  <div className="pl-7">
                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-semibold flex items-center gap-2">
              <Users size={24} /> Attendees
              <Badge variant="secondary" className="ml-2 font-normal text-sm">{event.rsvpCounts.going || 0} going</Badge>
            </h2>
            
            {rsvpsLoading ? (
              <div className="py-8"><Loader2 className="animate-spin text-primary opacity-50" /></div>
            ) : rsvps && rsvps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rsvps.filter(r => r.status === 'going').map(rsvp => (
                  <Link key={rsvp.userId} href={`/students/${rsvp.userId}`}>
                    <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-transparent hover:border-border/50 shadow-none cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={rsvp.photoUrl || undefined} />
                        <AvatarFallback>{getInitials(rsvp.studentName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{rsvp.studentName}</div>
                        {rsvp.studentCollege && <div className="text-xs text-muted-foreground">{rsvp.studentCollege}</div>}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-4 italic">No one has RSVP'd yet.</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24 border-primary/20 shadow-md">
            {!isPast ? (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h3 className="font-serif font-semibold text-xl">Are you going?</h3>
                  {event.myRsvp && (
                    <p className="text-sm text-muted-foreground">You answered: <span className="font-bold text-foreground capitalize">{event.myRsvp}</span></p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full rounded-xl" 
                    variant={event.myRsvp === 'going' ? 'default' : 'outline'}
                    onClick={() => handleRsvp(RsvpInputStatus.going)}
                    disabled={rsvpMutation.isPending}
                  >
                    Yes, I'm going
                  </Button>
                  <Button 
                    className="w-full rounded-xl" 
                    variant={event.myRsvp === 'maybe' ? 'secondary' : 'outline'}
                    onClick={() => handleRsvp(RsvpInputStatus.maybe)}
                    disabled={rsvpMutation.isPending}
                  >
                    Maybe
                  </Button>
                  <Button 
                    className="w-full rounded-xl" 
                    variant={event.myRsvp === 'notGoing' ? 'destructive' : 'outline'}
                    onClick={() => handleRsvp(RsvpInputStatus.notGoing)}
                    disabled={rsvpMutation.isPending}
                  >
                    Not going
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Info size={32} className="mx-auto text-muted-foreground opacity-50" />
                <h3 className="font-serif font-semibold text-xl text-muted-foreground">Event has ended</h3>
                <p className="text-sm text-muted-foreground">This event is in the past. Thanks to everyone who attended!</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Event Stats</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted p-2 rounded-lg">
                  <div className="text-xl font-bold">{event.rsvpCounts.going || 0}</div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Going</div>
                </div>
                <div className="bg-muted p-2 rounded-lg">
                  <div className="text-xl font-bold">{event.rsvpCounts.maybe || 0}</div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Maybe</div>
                </div>
                <div className="bg-muted p-2 rounded-lg">
                  <div className="text-xl font-bold">{event.rsvpCounts.notGoing || 0}</div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">No</div>
                </div>
              </div>
              {event.capacity && (
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Capacity: {event.capacity} people
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
