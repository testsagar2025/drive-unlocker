import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/hooks/useTheme";
import {
  Users, Eye, CheckCircle2, Clock, LogOut, Shield, Loader2, RefreshCw, Download,
  Moon, Sun, FolderOpen, TrendingUp, UserCheck, Search, Trash2
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Admin@2026";

export default function Admin() {
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<Stats>({ totalViews: 0, totalRegistrations: 0, step1Verified: 0, step2Verified: 0, driveAccessed: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
      sessionStorage.setItem("procbse_admin_auth", "true");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("procbse_admin_auth");
    setUsername("");
    setPassword("");
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: sessionsData, error: sessionsError } = await supabase.from("user_sessions").select("*").order("created_at", { ascending: false });
      if (sessionsError) throw sessionsError;
      const { count: viewsCount, error: viewsError } = await supabase.from("page_views").select("*", { count: "exact", head: true });
      if (viewsError) throw viewsError;
      const typedSessions = sessionsData as SessionData[];
      setSessions(typedSessions);
      setStats({
        totalViews: viewsCount || 0,
        totalRegistrations: typedSessions.filter((s) => s.registration_completed).length,
        step1Verified: typedSessions.filter((s) => s.step1_verified).length,
        step2Verified: typedSessions.filter((s) => s.step2_verified).length,
        driveAccessed: typedSessions.filter((s) => s.drive_link_accessed).length,
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
    const rows = sessions.map((s) => [
      s.student_name || "-", s.student_class || "-", s.student_mobile || "-",
      s.registration_completed ? "Yes" : "No", s.step1_verified ? "Yes" : "No",
      s.step2_verified ? "Yes" : "No", s.drive_link_accessed ? "Yes" : "No",
      format(new Date(s.created_at), "dd/MM/yyyy HH:mm"),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procbse_students_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    a.click();
  };

  useEffect(() => {
    if (sessionStorage.getItem("procbse_admin_auth") === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) { setLoading(true); fetchData(); }
  }, [isAuthenticated]);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .in("id", Array.from(selectedIds));
      if (error) throw error;
      toast.success(`Deleted ${selectedIds.size} student${selectedIds.size > 1 ? "s" : ""}`);
      setSelectedIds(new Set());
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete students");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map((s) => s.id)));
    }
  };

  // Only show students who actually registered (have name filled in)
  const registeredSessions = useMemo(() => {
    return sessions.filter((s) => s.registration_completed && s.student_name);
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return registeredSessions;
    const q = searchQuery.toLowerCase();
    return registeredSessions.filter(
      (s) =>
        s.student_name?.toLowerCase().includes(q) ||
        s.student_class?.toLowerCase().includes(q) ||
        s.student_mobile?.includes(q)
    );
  }, [registeredSessions, searchQuery]);

  // Funnel conversion rates
  const funnelData = useMemo(() => {
    const total = stats.totalRegistrations || 1;
    return [
      { label: "Registered", count: stats.totalRegistrations, pct: 100, icon: Users, color: "bg-primary" },
      { label: "Step 1 Verified", count: stats.step1Verified, pct: Math.round((stats.step1Verified / total) * 100), icon: CheckCircle2, color: "bg-emerald-500" },
      { label: "Step 2 Verified", count: stats.step2Verified, pct: Math.round((stats.step2Verified / total) * 100), icon: CheckCircle2, color: "bg-violet-500" },
      { label: "Drive Unlocked", count: stats.driveAccessed, pct: Math.round((stats.driveAccessed / total) * 100), icon: FolderOpen, color: "bg-accent" },
    ];
  }, [stats]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-3 sm:p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-gold" />
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">Admin Login</h1>
                <p className="text-xs text-muted-foreground mt-1">Sign in to access the dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-card"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-card"
                    autoComplete="current-password"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-destructive text-center bg-destructive/10 rounded-lg py-2">{loginError}</p>
                )}

                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl">
                  <Shield className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
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
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gradient-gold shrink-0">PRO CBSE</h1>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={refreshing} className="rounded-xl h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
            <Button variant="outline" size="icon" onClick={exportToCSV} className="rounded-xl h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
            <Button variant="destructive" size="icon" onClick={handleLogout} className="rounded-xl h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Stat Cards Row */}
        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {[
            { label: "Total Views", value: stats.totalViews, icon: Eye, gradient: "from-blue-500 to-blue-600" },
            { label: "Step 1 Verified", value: stats.step1Verified, icon: UserCheck, gradient: "from-emerald-500 to-emerald-600" },
            { label: "Step 2 Verified", value: stats.step2Verified, icon: CheckCircle2, gradient: "from-violet-500 to-violet-600" },
            { label: "Drive Unlocked", value: stats.driveAccessed, icon: FolderOpen, gradient: "from-amber-500 to-orange-500" },
          ].map(({ label, value, icon: Icon, gradient }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/50 rounded-2xl shadow-sm overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06]`} />
                <CardContent className="pt-6 pb-5 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Funnel Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50 rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </div>
              <CardDescription>Student progress through each step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {funnelData.map(({ label, count, pct, icon: Icon, color }) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{count}</span>
                        <Badge variant="outline" className="text-xs">{pct}%</Badge>
                      </div>
                    </div>
                    <Progress value={pct} className="h-2.5 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Student Details</CardTitle>
                  <CardDescription>{filteredSessions.length} student{filteredSessions.length !== 1 ? "s" : ""} registered</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={deleting}
                      className="rounded-xl"
                    >
                      {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      Delete ({selectedIds.size})
                    </Button>
                  )}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name, class, mobile..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={filteredSessions.length > 0 && selectedIds.size === filteredSessions.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead className="text-center">Step 1</TableHead>
                      <TableHead className="text-center">Step 2</TableHead>
                      <TableHead className="text-center">Drive</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                          {searchQuery ? "No matching students found" : "No students registered yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSessions.map((session, index) => (
                        <TableRow key={session.id} className={`group ${selectedIds.has(session.id) ? "bg-primary/5" : ""}`}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(session.id)}
                              onCheckedChange={() => toggleSelect(session.id)}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {session.student_name || <span className="text-muted-foreground italic">Unknown</span>}
                          </TableCell>
                          <TableCell>
                            {session.student_class ? (
                              <Badge variant="secondary" className="text-xs font-normal">{session.student_class}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{session.student_mobile || <span className="text-muted-foreground">-</span>}</TableCell>
                          <TableCell className="text-center">
                            <StepBadge done={session.step1_verified} timestamp={session.step1_verified_at} />
                          </TableCell>
                          <TableCell className="text-center">
                            <StepBadge done={session.step2_verified} timestamp={session.step2_verified_at} />
                          </TableCell>
                          <TableCell className="text-center">
                            <StepBadge done={session.drive_link_accessed} timestamp={session.drive_link_accessed_at} variant="drive" />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {session.created_at ? (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {format(new Date(session.created_at), "dd MMM yy, HH:mm")}
                              </div>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function StepBadge({ done, timestamp, variant = "step" }: { done: boolean; timestamp: string | null; variant?: "step" | "drive" }) {
  if (!done) {
    return <span className="inline-block w-3 h-3 rounded-full bg-muted border border-border" title="Not completed" />;
  }

  const title = timestamp ? format(new Date(timestamp), "dd MMM yyyy, HH:mm") : "Completed";
  const colorClass = variant === "drive"
    ? "bg-accent text-accent-foreground"
    : "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]";

  return (
    <span title={title} className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colorClass}`}>
      <CheckCircle2 className="h-3.5 w-3.5" />
    </span>
  );
}