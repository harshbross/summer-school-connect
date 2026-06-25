import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  pronouns: z.string().optional(),
  homeCity: z.string().optional(),
  college: z.string().min(2, "College is required"),
  year: z.string().min(1, "Year is required"),
  major: z.string().min(2, "Major is required"),
  bio: z.string().min(10, "Tell us a bit more about yourself (min 10 chars)"),
  funFact: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  interestTags: z.string(),
});

export default function ProfileEdit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateMyProfile();

  const { data: profile, isLoading } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey() }
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      pronouns: "",
      homeCity: "",
      college: "",
      year: "",
      major: "",
      bio: "",
      funFact: "",
      linkedinUrl: "",
      instagramHandle: "",
      websiteUrl: "",
      interestTags: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        pronouns: profile.pronouns || "",
        homeCity: profile.homeCity || "",
        college: profile.college,
        year: profile.year,
        major: profile.major,
        bio: profile.bio,
        funFact: profile.funFact || "",
        linkedinUrl: profile.linkedinUrl || "",
        instagramHandle: profile.instagramHandle || "",
        websiteUrl: profile.websiteUrl || "",
        interestTags: profile.interestTags.join(", "),
      });
    }
  }, [profile, form]);

  function onSubmit(values: z.infer<typeof profileSchema>) {
    const tags = values.interestTags.split(",").map(t => t.trim()).filter(Boolean);
    
    updateProfile.mutate({
      data: {
        ...values,
        interestTags: tags,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      },
      onError: (error) => {
        toast({
          title: "Update failed",
          description: error.error || "Something went wrong",
          variant: "destructive",
        });
      }
    });
  }

  if (isLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary opacity-50 h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground text-lg">Update your information and how others see you.</p>
      </div>

      <div className="bg-card border rounded-3xl p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-semibold border-b pb-2">Basic Info</h3>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <FormLabel>Pronouns</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Home City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-semibold border-b pb-2">Academic Background</h3>
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College / University</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* About You */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-semibold border-b pb-2">About You</h3>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="h-24 resize-none" />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="funFact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fun Fact</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-semibold border-b pb-2">Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://linkedin.com/in/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagramHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="@username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Website</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={updateProfile.isPending} className="px-8 rounded-full gap-2">
                <Save size={16} />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
