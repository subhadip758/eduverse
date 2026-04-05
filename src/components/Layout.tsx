import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  BookOpen, 
  CalendarCheck, 
  GraduationCap, 
  Wallet, 
  MessageSquare, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Stars, Float, Icosahedron } from "@react-three/drei";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LogoSVG = ({ className, onClick }: any) => (
  <svg className={className} onClick={onClick} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="url(#blueGreen)" strokeWidth="8"/>
    <path d="M30 40 Q50 50 70 40 L70 70 Q50 80 30 70 Z" fill="url(#blueGreen)"/>
    <path d="M50 45 L50 75" stroke="white" strokeWidth="4"/>
    <path d="M15 75 Q 50 110 95 25" stroke="url(#blueGreen)" strokeWidth="6" strokeLinecap="round"/>
    <path d="M85 15 L90 5 L95 15 L105 20 L95 25 L90 35 L85 25 L75 20 Z" fill="url(#blueGreen)"/>
    <defs>
      <linearGradient id="blueGreen" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#0284c7" />
        <stop offset="1" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
  </svg>
);

export function Layout() {
  const { profile, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isSpinning, setIsSpinning] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
    { name: "Students", path: "/students", icon: Users, roles: ["admin", "teacher"] },
    { name: "Teachers", path: "/teachers", icon: UserRound, roles: ["admin"] },
    { name: "Courses", path: "/courses", icon: BookOpen, roles: ["admin"] },
    { name: "Attendance", path: "/attendance", icon: CalendarCheck, roles: ["admin", "teacher", "student"] },
    { name: "Results", path: "/results", icon: GraduationCap, roles: ["admin", "teacher", "student"] },
    { name: "Fees", path: "/fees", icon: Wallet, roles: ["admin", "student"] },
    { name: "Chat", path: "/chat", icon: MessageSquare, roles: ["teacher", "student"] },
    { name: "Settings", path: "/settings", icon: SettingsIcon, roles: ["admin", "teacher", "student"] },
  ];

  const filteredNavItems = navItems.filter(item => profile?.role ? item.roles.includes(profile.role) : true);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans overflow-hidden relative">
      {/* 3D Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Stars radius={50} depth={50} count={4000} factor={4} saturation={1} fade speed={2} />
          <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            <Icosahedron args={[1, 1]} position={[-4, 2, -5]}>
              <meshStandardMaterial color="#10b981" wireframe />
            </Icosahedron>
          </Float>
          <Float speed={3} rotationIntensity={3} floatIntensity={1}>
            <Icosahedron args={[1.5, 0]} position={[5, -2, -8]}>
               <meshStandardMaterial color="#0284c7" wireframe />
            </Icosahedron>
          </Float>
          <Float speed={1.5} rotationIntensity={1} floatIntensity={3}>
            <Icosahedron args={[0.8, 1]} position={[0, -4, -3]}>
               <meshStandardMaterial color="#14b8a6" wireframe />
            </Icosahedron>
          </Float>
        </Canvas>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-zinc-900/60 backdrop-blur-2xl border-zinc-800/50 transition-all duration-300 lg:relative overflow-hidden shadow-2xl shadow-black",
          isSidebarOpen ? "w-64 border-r translate-x-0" : "w-0 -translate-x-full border-none"
        )}
      >
        <div className="h-full flex flex-col w-64">
          <div className="p-6 flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              EduVerse
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "group-hover:scale-110 transition-transform")} />
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="h-16 bg-zinc-900/40 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between px-6 sticky top-0 z-40 shadow-lg shadow-black/20">
          <div className="flex items-center gap-4">
            <LogoSVG 
              className={cn(
                "w-10 h-10 cursor-pointer transition-transform duration-700 ease-in-out shrink-0",
                isSpinning && "rotate-[360deg]"
              )}
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
                setIsSpinning(true);
                setTimeout(() => setIsSpinning(false), 700);
              }}
            />
            <h1 className="text-lg font-semibold text-zinc-100 ml-2">
              {filteredNavItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-900"></span>
            </button>
            {isNotifOpen && (
              <div className="absolute top-12 right-12 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                  <h4 className="font-bold text-zinc-100">Notifications</h4>
                  <span className="text-xs text-emerald-500 font-medium">1 New</span>
                </div>
                <div className="p-4 hover:bg-zinc-800/50 transition-colors border-l-2 border-emerald-500">
                  <p className="text-sm text-zinc-100 font-medium mb-1">Welcome to EduVerse</p>
                  <p className="text-xs text-zinc-400">Your portal is fully localized and interactive. Start managing your campus!</p>
                  <p className="text-[10px] text-zinc-500 mt-2">Just now</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-zinc-100">{profile?.displayName}</p>
                <p className="text-xs text-zinc-500 capitalize">{profile?.role}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center overflow-hidden">
                <UserRound className="w-6 h-6 text-zinc-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
