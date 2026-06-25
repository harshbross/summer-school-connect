import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { OnboardingInputYear } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const basicInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  pronouns: z.string().optional(),
  homeCity: z.string().optional(),
});

const academicInfoSchema = z.object({
  college: z.string().min(2, "College is required"),
  year: z.enum([
    OnboardingInputYear.freshman,
    OnboardingInputYear.sophomore,
    OnboardingInputYear.junior,
    OnboardingInputYear.senior,
    OnboardingInputYear.grad,
  ]),
  major: z.string().min(2, "Major is required"),
});

const aboutYouSchema = z.object({
  bio: z.string().min(10, "Tell us a bit more about yourself (min 10 chars)"),
  funFact: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  interestTags: z.string(), // We'll split this by comma
});

const fullSchema = basicInfoSchema.merge(academicInfoSchema).merge(aboutYouSchema);

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const completeOnboarding = useCompleteOnboarding();

  const form = useForm<z.infer<typeof fullSchema>>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fullName: "",
      pronouns: "",
      homeCity: "",
      college: "",
      year: OnboardingInputYear.freshman,
      major: "",
      bio: "",
      funFact: "",
      linkedinUrl: "",
      interestTags: "",
    },
    mode: "onChange",
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["fullName", "pronouns", "homeCity"]);
    } else if (step === 2) {
      isValid = await form.trigger(["college", "year", "major"]);
    }

    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  function onSubmit(values: z.infer<typeof fullSchema>) {
    const tags = values.interestTags.split(",").map(t => t.trim()).filter(Boolean);
    
    completeOnboarding.mutate({
      data: {
        ...values,
        interestTags: tags,
      }
    }, {
      onSuccess: () => {
        window.location.href = "/";
      },
      onError: (error) => {
        toast({
          title: "Error saving profile",
          description: error.error || "Something went wrong",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2 w-12 rounded-full transition-colors duration-300 ${
                  step >= i ? 'bg-primary' : 'bg-muted'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
        </div>

        <div className="bg-card border rounded-3xl p-8 shadow-xl shadow-black/5 relative overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-foreground">Welcome. Let's get to know you.</h2>
                      <p className="text-muted-foreground">The basics to set up your profile.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} className="h-12 bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pronouns"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pronouns (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="she/her" {...field} className="h-12 bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="homeCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home City (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Chicago, IL" {...field} className="h-12 bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-foreground">Academic Background</h2>
                      <p className="text-muted-foreground">Where and what are you studying?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="college"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College / University</FormLabel>
                          <FormControl>
                            <Input placeholder="State University" {...field} className="h-12 bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-background">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="freshman">Freshman</SelectItem>
                                <SelectItem value="sophomore">Sophomore</SelectItem>
                                <SelectItem value="junior">Junior</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                                <SelectItem value="grad">Graduate</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="major"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Major</FormLabel>
                            <FormControl>
                              <Input placeholder="Computer Science" {...field} className="h-12 bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-foreground">The Fun Stuff</h2>
                      <p className="text-muted-foreground">Help others discover what you're about.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Bio</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Passionate about UI engineering and sustainable tech..." className="resize-none bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="interestTags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests (comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="design, robotics, hiking" {...field} className="h-12 bg-background" />
                          </FormControl>
                          <FormDescription>We use these to help you find like-minded peers.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="funFact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fun Fact (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="I can juggle 4 apples" {...field} className="h-12 bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-6 border-t mt-8">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </Button>
                
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className="gap-2 rounded-full px-6">
                    Continue <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button type="submit" disabled={completeOnboarding.isPending} className="gap-2 rounded-full px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    {completeOnboarding.isPending ? "Saving..." : "Complete Profile"} <CheckCircle2 size={16} />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
