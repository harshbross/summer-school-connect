import { 
  useGetDashboardSummary, 
  useAdminListStudents, 
  useAdminGetInviteCode, 
  useAdminRegenerateInviteCode, 
  useAdminDeactivateStudent,
  getAdminListStudentsQueryKey,
  getAdminGetInviteCodeQueryKey
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Calendar, MessageSquare, KeyRound, RefreshCw, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: students, isLoading: studentsLoading } = useAdminListStudents();
  const { data: inviteCode, isLoading: codeLoading } = useAdminGetInviteCode();

  const regenCodeMutation = useAdminRegenerateInviteCode();
  const deactivateStudentMutation = useAdminDeactivateStudent();

  const handleRegenCode = () => {
    regenCodeMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminGetInviteCodeQueryKey() });
        toast({ title: "Invite code regenerated" });
      }
    });
  };

  const handleDeactivate = (id: number) => {
    if (confirm("Are you sure you want to deactivate this student?")) {
      deactivateStudentMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListStudentsQueryKey() });
          toast({ title: "Student deactivated" });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Manage the cohort and view engagement metrics.</p>
      </div>

      {summaryLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 flex flex-col items-center text-center gap-2 border-primary/20 bg-primary/5">
            <Users className="text-primary h-8 w-8 mb-2" />
            <div className="text-3xl font-bold">{summary.totalStudents}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Students</div>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center gap-2 border-primary/20 bg-primary/5">
            <MessageSquare className="text-primary h-8 w-8 mb-2" />
            <div className="text-3xl font-bold">{summary.totalPosts}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Posts</div>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center gap-2 border-primary/20 bg-primary/5">
            <Calendar className="text-primary h-8 w-8 mb-2" />
            <div className="text-3xl font-bold">{summary.totalEvents}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Events</div>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center gap-2 border-primary/20 bg-primary/5">
            <Calendar className="text-primary h-8 w-8 mb-2" />
            <div className="text-3xl font-bold">{summary.upcomingEventsCount}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming Events</div>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-serif font-bold border-b pb-2">Student Directory</h2>
          
          <Card className="overflow-hidden border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8"><Loader2 className="animate-spin text-primary inline" /></TableCell>
                  </TableRow>
                ) : students && students.length > 0 ? (
                  students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium">{student.profileName || "Pending Setup"}</div>
                        <div className="text-xs text-muted-foreground">{student.college || "N/A"}</div>
                      </TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? "default" : "destructive"} className={student.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {!student.onboardingComplete && <Badge variant="outline" className="ml-2">Incomplete</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.isActive && student.role !== 'admin' && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeactivate(student.id)}>
                            <ShieldAlert size={14} className="mr-2" /> Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold border-b pb-2">Cohort Access</h2>
          
          <Card className="p-6 bg-secondary/5 border-secondary/20">
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="text-secondary" />
              <h3 className="font-semibold text-lg">Invite Code</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Share this code with incoming students so they can register for the platform.
            </p>

            {codeLoading ? (
              <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : inviteCode ? (
              <div className="space-y-4">
                <div className="bg-background border-2 border-dashed border-secondary/30 p-4 rounded-xl text-center">
                  <span className="font-mono text-3xl font-bold tracking-widest text-secondary">{inviteCode.code}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRegenCode}
                  disabled={regenCodeMutation.isPending}
                >
                  <RefreshCw size={16} className={`mr-2 ${regenCodeMutation.isPending ? 'animate-spin' : ''}`} /> 
                  Regenerate Code
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Regenerating will invalidate the old code immediately.
                </p>
              </div>
            ) : (
              <div className="text-sm text-destructive">Failed to load code</div>
            )}
          </Card>

          {summary && summary.collegeBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Colleges</h3>
              <div className="space-y-3">
                {summary.collegeBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-4">{item.college}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
