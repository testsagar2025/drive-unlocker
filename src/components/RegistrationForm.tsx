import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, Mail, Loader2, Sparkles } from "lucide-react";

interface RegistrationFormProps {
  sessionToken: string;
  onComplete: () => void;
}

export function RegistrationForm({ sessionToken, onComplete }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; mobile?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; mobile?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkMobileExists = async (mobileNumber: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("student_mobile", mobileNumber)
      .eq("registration_completed", true)
      .maybeSingle();
    
    return !!data && !error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Check if mobile number already exists
      const mobileExists = await checkMobileExists(mobile.trim());
      if (mobileExists) {
        setErrors({ mobile: "This mobile number is already registered" });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("user_sessions")
        .update({
          student_name: name.trim(),
          student_email: email.trim(),
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

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Welcome to <span className="text-gradient-gold">PRO CBSE</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your details to access exclusive CBSE study materials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`bg-background/50 border-border/50 focus:border-primary ${errors.name ? 'border-destructive' : ''}`}
              maxLength={100}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-primary" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-background/50 border-border/50 focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-primary" />
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={`bg-background/50 border-border/50 focus:border-primary ${errors.mobile ? 'border-destructive' : ''}`}
              maxLength={10}
            />
            {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            <p className="text-xs text-muted-foreground">One registration per mobile number</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Verification
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}
