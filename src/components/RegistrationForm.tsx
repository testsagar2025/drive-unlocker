import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, GraduationCap, Loader2, ArrowRight } from "lucide-react";

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
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-gold" />

      <div className="p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1">Get Started</h2>
          <p className="text-sm text-muted-foreground">Enter your details to access free study materials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-card ${errors.name ? "border-destructive" : ""}`}
              maxLength={100}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="class" className="text-xs font-medium flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Class
            </Label>
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger className={`h-11 rounded-xl bg-muted/50 border-border/50 ${errors.class ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.class && <p className="text-xs text-destructive">{errors.class}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile" className="text-xs font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" /> Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-card ${errors.mobile ? "border-destructive" : ""}`}
              maxLength={10}
            />
            {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl mt-2"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}