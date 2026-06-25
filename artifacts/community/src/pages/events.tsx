import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { Event } from "@workspace/api-client-react";

export function EventCard({ event }: { event: Event }) {
  const isPast = event.status === "past";

  return (
    <Card className={`overflow-hidden flex flex-col sm:flex-row transition-all duration-300 hover:shadow-md ${isPast ? 'opacity-75' : ''}`}>
      <div className="sm:w-48 bg-muted border-r border-border/50 flex flex-col justify-center items-center p-6 text-center">
        <div className="text-sm font-bold text-primary uppercase tracking-wider">
          {format(new Date(event.startAt), "MMM")}
        </div>
        <div className="text-4xl font-serif font-bold text-foreground my-1">
          {format(new Date(event.startAt), "dd")}
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          {format(new Date(event.startAt), "EEEE")}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider font-semibold border-primary/20 text-primary bg-primary/5">
              {event.eventType}
            </Badge>
            <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-y-2 mt-6">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Clock size={14} className="text-muted-foreground" />
            {format(new Date(event.startAt), "h:mm a")} - {format(new Date(event.endAt), "h:mm a")}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Users size={14} className="text-muted-foreground" />
            {event.rsvpCounts.going || 0} going
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            {event.myRsvp && (
              <Badge variant="secondary" className={event.myRsvp === 'going' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}>
                You answered: {event.myRsvp}
              </Badge>
            )}
          </div>
          <Button variant={isPast ? "outline" : "default"} className="rounded-full" asChild>
            <Link href={`/events/${event.id}`}>
              {isPast ? "View Details" : "RSVP & Details"} <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Events() {
  const { data: upcomingEvents, isLoading: loadingUpcoming } = useListEvents(
    { upcoming: true },
    { query: { queryKey: getListEventsQueryKey({ upcoming: true }) } }
  );

  const { data: pastEvents, isLoading: loadingPast } = useListEvents(
    { upcoming: false },
    { query: { queryKey: getListEventsQueryKey({ upcoming: false }) } }
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground text-lg">Workshops, social gatherings, and field trips.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full max-w-md h-12 rounded-full bg-card border p-1 mb-8">
          <TabsTrigger value="upcoming" className="rounded-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="rounded-full flex-1">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-6">
          {loadingUpcoming ? (
            <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50 h-8 w-8" /></div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="py-24 text-center text-muted-foreground bg-card rounded-2xl border border-dashed">
              No upcoming events scheduled.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6">
          {loadingPast ? (
            <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50 h-8 w-8" /></div>
          ) : pastEvents && pastEvents.length > 0 ? (
            pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="py-24 text-center text-muted-foreground bg-card rounded-2xl border border-dashed">
              No past events.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
