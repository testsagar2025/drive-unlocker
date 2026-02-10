import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, GraduationCap, Loader2, Sparkles } from "lucide-react";

interface RegistrationFormProps {
  sessionToken: string;
  onComplete: () => void;
}

export function RegistrationForm({ sessionToken, onComplete }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; class?: string; mobile?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; class?: string; mobile?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    else if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    else if (name.trim().length > 100) newErrors.name = "Name must be less than 100 characters";
    if (!studentClass) newErrors.class = "Please select your class";
    if (!mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(mobile.trim())) newErrors.mobile = "Enter a valid 10-digit mobile number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          student_name: name.trim(),
          student_class: studentClass,
          student_mobile: mobile.trim(),
          registration_completed: true,
          registration_completed_at: new Date().toISOString(),
        })
        .eq("session_token", sessionToken);
      if (error) throw error;
      toast.success("Registration successful! 🎉");
      onComplete();
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Failed to save your details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const classes = [
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11 - Science", "Class 11 - Commerce",
    "Class 12 - Science", "Class 12 - Commerce",
  ];

  return (
    <Card className="border-border/50 rounded-2xl shadow-lg bg-card">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Welcome to <span className="text-gradient-gold">PRO CBSE</span>
        </CardTitle>
        <CardDescription>Enter your details to access exclusive CBSE study materials</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" /> Full Name
            </Label>
            <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)}
              className={`rounded-xl ${errors.name ? "border-destructive" : ""}`} maxLength={100} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class" className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-primary" /> Class
            </Label>
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger className={`rounded-xl ${errors.class ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>{classes.map((cls) => (<SelectItem key={cls} value={cls}>{cls}</SelectItem>))}</SelectContent>
            </Select>
            {errors.class && <p className="text-xs text-destructive">{errors.class}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-primary" /> Mobile Number
            </Label>
            <Input id="mobile" type="tel" placeholder="Enter 10-digit mobile number" value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`rounded-xl ${errors.mobile ? "border-destructive" : ""}`} maxLength={10} />
            {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
          </div>

          <Button type="submit" className="w-full bg-gradient-gold hover:opacity-90 text-white font-semibold py-6 rounded-xl" disabled={loading}>
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Start Verification</>)}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </CardContent>
    </Card>
  );
}
