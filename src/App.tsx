import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DatabaseProvider } from "./context/DatabaseContext";
import { 
  Dashboard, Students, Teachers, Courses, Attendance, Results, Fees, Chat, Settings 
} from "./pages";
import { Login } from "./pages/Login";

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (n: string, e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, n: string, r: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("eduverse_user");
    const storedProfile = localStorage.getItem("eduverse_profile");

    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    // Fake Google Login that just yields a Student profile
    const fakeUser = { uid: "google-123", email: "google.user@eduverse.com" };
    const fakeProfile = {
      uid: "google-123",
      email: "google.user@eduverse.com",
      displayName: "Google User",
      role: "student",
      status: "active",
      photoURL: ""
    };
    
    localStorage.setItem("eduverse_user", JSON.stringify(fakeUser));
    localStorage.setItem("eduverse_profile", JSON.stringify(fakeProfile));
    setUser(fakeUser);
    setProfile(fakeProfile);
  };

  const loginWithEmail = async (name: string, email: string, pass: string) => {
    const fakeUser = { uid: `local-${email}`, email };
    // Check if profile exists locally
    const existingAccountsStr = localStorage.getItem("eduverse_accounts") || "[]";
    const accounts = JSON.parse(existingAccountsStr);
    
    let userProfile = accounts.find((a: any) => a.email === email && a.password === pass);
    
    if (!userProfile) {
      alert("Invalid email or password! Please sign up first.");
      return;
    }

    const studentsStr = localStorage.getItem("eduverse_students") || "[]";
    const teachersStr = localStorage.getItem("eduverse_teachers") || "[]";
    const allStudents = JSON.parse(studentsStr);
    const allTeachers = JSON.parse(teachersStr);

    if (userProfile.role === "student" && !allStudents.some((s: any) => s.name === name && s.email === email)) {
      alert("No student record found with this exact Name and Email in the Admin roster.");
      return;
    }
    if (userProfile.role === "teacher" && !allTeachers.some((t: any) => t.name === name && t.email === email)) {
      alert("No teacher record found with this exact Name and Email in the Admin roster.");
      return;
    }

    localStorage.setItem("eduverse_user", JSON.stringify(fakeUser));
    localStorage.setItem("eduverse_profile", JSON.stringify(userProfile));
    setUser(fakeUser);
    setProfile(userProfile);
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: string) => {
    const fakeUser = { uid: `local-${email}`, email };
    
    const newProfile = {
      uid: fakeUser.uid,
      email: email,
      password: pass, // Highly insecure, but this is a local mock!
      displayName: name,
      role: role,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const studentsStr = localStorage.getItem("eduverse_students") || "[]";
    const teachersStr = localStorage.getItem("eduverse_teachers") || "[]";
    const allStudents = JSON.parse(studentsStr);
    const allTeachers = JSON.parse(teachersStr);
    
    if (role === "student" && !allStudents.some((s: any) => s.name === name && s.email === email)) {
      alert("No student record found with this exact Name and Email. An Admin must add you first.");
      return;
    }
    if (role === "teacher" && !allTeachers.some((t: any) => t.name === name && t.email === email)) {
      alert("No teacher record found with this exact Name and Email. An Admin must add you first.");
      return;
    }

    const existingAccountsStr = localStorage.getItem("eduverse_accounts") || "[]";
    const accounts = JSON.parse(existingAccountsStr);
    
    if (accounts.some((a: any) => a.email === email)) {
      alert("Account already exists with this email!");
      return;
    }

    accounts.push(newProfile);
    localStorage.setItem("eduverse_accounts", JSON.stringify(accounts));

    localStorage.setItem("eduverse_user", JSON.stringify(fakeUser));
    localStorage.setItem("eduverse_profile", JSON.stringify(newProfile));
    setUser(fakeUser);
    setProfile(newProfile);
  };
  
  const updateProfile = async (updates: any) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem("eduverse_profile", JSON.stringify(updatedProfile));
    
    // Also patch global accounts array
    const existingAccountsStr = localStorage.getItem("eduverse_accounts") || "[]";
    let accounts = JSON.parse(existingAccountsStr);
    accounts = accounts.map((a: any) => a.uid === profile.uid ? updatedProfile : a);
    localStorage.setItem("eduverse_accounts", JSON.stringify(accounts));
  }

  const logout = async () => {
    localStorage.removeItem("eduverse_user");
    localStorage.removeItem("eduverse_profile");
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-emerald-500 mb-8">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 animate-pulse">Initializing Local Context...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      loginWithGoogle, loginWithEmail, registerWithEmail, updateProfile, logout 
    }}>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={user ? (
              <DatabaseProvider>
                <Layout />
              </DatabaseProvider>
            ) : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="courses" element={<Courses />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="results" element={<Results />} />
            <Route path="fees" element={<Fees />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
