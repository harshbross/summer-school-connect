import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Directory from "@/pages/directory";
import StudentProfile from "@/pages/student-profile";
import ProfileEdit from "@/pages/profile-edit";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Admin from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function HomeWrapped() { return <AppLayout><Home /></AppLayout>; }
function DirectoryWrapped() { return <AppLayout><Directory /></AppLayout>; }
function StudentProfileWrapped() { return <AppLayout><StudentProfile /></AppLayout>; }
function ProfileEditWrapped() { return <AppLayout><ProfileEdit /></AppLayout>; }
function EventsWrapped() { return <AppLayout><Events /></AppLayout>; }
function EventDetailWrapped() { return <AppLayout><EventDetail /></AppLayout>; }
function AdminWrapped() { return <AppLayout><Admin /></AppLayout>; }

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/" component={HomeWrapped} />
      <Route path="/directory" component={DirectoryWrapped} />
      <Route path="/profile/edit" component={ProfileEditWrapped} />
      <Route path="/students/:id" component={StudentProfileWrapped} />
      <Route path="/events" component={EventsWrapped} />
      <Route path="/events/:id" component={EventDetailWrapped} />
      <Route path="/admin" component={AdminWrapped} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
