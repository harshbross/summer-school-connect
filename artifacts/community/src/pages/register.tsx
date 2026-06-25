import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  inviteCode: z.string().min(1, { message: "Invite code is required" }),
});

export default function Register() {
  const { toast } = useToast();
  const register = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      inviteCode: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    register.mutate({ data: values }, {
      onSuccess: () => {
        window.location.href = "/onboarding";
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.error || "Please check your details and try again",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Form side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Join the Cohort</h2>
            <p className="text-muted-foreground">Use your invite code to set up your account.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invite Code</FormLabel>
                    <FormControl>
                      <Input placeholder="SUMMER25..." {...field} className="bg-card h-12 uppercase tracking-widest font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} className="bg-card h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-card h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={register.isPending}>
                {register.isPending ? "Joining..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Visual side */}
      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary/80 to-primary/20"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md text-secondary-foreground space-y-6"
        >
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight">The start of something great.</h1>
          <p className="text-xl opacity-90 font-medium">Connect, learn, and build with your peers.</p>
        </motion.div>
      </div>
    </div>
  );
}
