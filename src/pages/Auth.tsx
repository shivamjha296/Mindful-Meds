import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Lock, Mail, User, Heart } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register: registerUser, currentUser, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'dearOne'>('patient');
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      const userType = await login(loginEmail, loginPassword);
      
      // Redirect based on user type
      if (userType === 'dearOne') {
        navigate('/dear-ones-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is already handled in the AuthContext
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }
    
    try {
      setIsLoading(true);
      await registerUser(registerEmail, registerPassword, registerName, userType);
      
      // Reset form and switch to login tab
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setUserType('patient');
      document.getElementById('login-tab')?.click();
      
      toast.success(`Account created successfully as a ${userType === 'patient' ? 'Patient' : 'Caregiver'}`);
    } catch (error) {
      // Error is already handled in the AuthContext
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If auth is still initializing, show loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md shadow-lg glassmorphism">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Welcome to MedTracker</CardTitle>
          <CardDescription>
            Manage your medications safely and securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger id="login-tab" value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe" 
                      className="pl-10"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                </div>
                
                <div className="space-y-2">
                  <Label>I am registering as a:</Label>
                  <RadioGroup 
                    value={userType} 
                    onValueChange={(value) => setUserType(value as 'patient' | 'dearOne')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="patient" id="patient" />
                      <Label htmlFor="patient" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Patient
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dearOne" id="dearOne" />
                      <Label htmlFor="dearOne" className="flex items-center">
                        <Heart className="h-4 w-4 mr-2" />
                        Caregiver
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    {userType === 'patient' 
                      ? "Register as a patient to manage your medications and add caregivers." 
                      : "Register as a caregiver to monitor and help manage a patient's medications."}
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
