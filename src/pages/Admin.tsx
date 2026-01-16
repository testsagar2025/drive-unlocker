import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Eye, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Shield,
  Loader2,
  RefreshCw,
  Download
} from "lucide-react";
import { format } from "date-fns";

interface SessionData {
  id: string;
  student_name: string | null;
  student_class: string | null;
  student_mobile: string | null;
  registration_completed: boolean;
  step1_verified: boolean;
  step2_verified: boolean;
  drive_link_accessed: boolean;
  created_at: string;
  registration_completed_at: string | null;
  step1_verified_at: string | null;
  step2_verified_at: string | null;
  drive_link_accessed_at: string | null;
}

interface Stats {
  totalViews: number;
  totalRegistrations: number;
  step1Verified: number;
  step2Verified: number;
  driveAccessed: number;
}

const ADMIN_PASSWORD = "Admin@2026";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    totalRegistrations: 0,
    step1Verified: 0,
    step2Verified: 0,
    driveAccessed: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
      sessionStorage.setItem("procbse_admin_auth", "true");
    } else {
      setPasswordError("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("procbse_admin_auth");
    setPassword("");
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("user_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch page views count
      const { count: viewsCount, error: viewsError } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });

      if (viewsError) throw viewsError;

      const typedSessions = sessionsData as SessionData[];
      setSessions(typedSessions);

      // Calculate stats
      setStats({
        totalViews: viewsCount || 0,
        totalRegistrations: typedSessions.filter(s => s.registration_completed).length,
        step1Verified: typedSessions.filter(s => s.step1_verified).length,
        step2Verified: typedSessions.filter(s => s.step2_verified).length,
        driveAccessed: typedSessions.filter(s => s.drive_link_accessed).length,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Class", "Mobile", "Registered", "Step 1", "Step 2", "Drive Accessed", "Created At"];
    const rows = sessions.map(s => [
      s.student_name || "-",
      s.student_class || "-",
      s.student_mobile || "-",
      s.registration_completed ? "Yes" : "No",
      s.step1_verified ? "Yes" : "No",
      s.step2_verified ? "Yes" : "No",
      s.drive_link_accessed ? "Yes" : "No",
      format(new Date(s.created_at), "dd/MM/yyyy HH:mm"),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procbse_students_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    a.click();
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("procbse_admin_auth") === "true";
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Enter password to access admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? "border-destructive" : ""}
                />
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient-gold">PRO CBSE Admin</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                  <p className="text-xs text-muted-foreground">Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.step1Verified}</p>
                  <p className="text-xs text-muted-foreground">Step 1 Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <CheckCircle2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.step2Verified}</p>
                  <p className="text-xs text-muted-foreground">Step 2 Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Download className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.driveAccessed}</p>
                  <p className="text-xs text-muted-foreground">Drive Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>
              All registered students and their verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered At</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        No students registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.student_name || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {session.student_class || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {session.student_mobile || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {session.registration_completed ? (
                            <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                              Registered
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {session.registration_completed_at ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.registration_completed_at), "dd MMM yyyy, HH:mm")}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={session.step1_verified ? "default" : "outline"} 
                              className={`text-xs ${session.step1_verified ? 'bg-green-500/20 text-green-500' : ''}`}
                            >
                              S1
                            </Badge>
                            <Badge 
                              variant={session.step2_verified ? "default" : "outline"} 
                              className={`text-xs ${session.step2_verified ? 'bg-green-500/20 text-green-500' : ''}`}
                            >
                              S2
                            </Badge>
                            <Badge 
                              variant={session.drive_link_accessed ? "default" : "outline"} 
                              className={`text-xs ${session.drive_link_accessed ? 'bg-primary/20 text-primary' : ''}`}
                            >
                              Drive
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
