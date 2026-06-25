import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useLogout } from "@workspace/api-client-react";
import { Home, Users, Calendar, Settings, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/login";
      }
    });
  };

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Users, label: "Directory", href: "/directory" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Settings, label: "Profile", href: "/profile/edit" },
  ];

  if (user?.role === "admin") {
    navItems.push({ icon: Shield, label: "Admin", href: "/admin" });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full max-w-7xl mx-auto">
      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b sticky top-0 z-50">
        <div className="font-serif font-bold text-xl text-primary tracking-tight">Oasis</div>
        <div className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "p-2 rounded-full transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              )}>
                <Icon size={20} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col gap-8 p-6 sticky top-0 h-screen border-r bg-card/50 backdrop-blur-sm">
        <div className="font-serif font-bold text-3xl text-primary tracking-tight">Oasis</div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground w-full" onClick={handleLogout}>
          <LogOut size={20} />
          Sign Out
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 min-h-screen pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
