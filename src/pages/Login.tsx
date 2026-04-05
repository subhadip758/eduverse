import React, { useState, useRef } from "react";
import { useAuth } from "../App";
import { GraduationCap, ArrowRight, Github, Mail, Lock, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, PresentationControls } from "@react-three/drei";

// 3D Scene Components
function FloatingShapes() {
  const torusRef = useRef<any>(null);
  const sphereRef = useRef<any>(null);
  const boxRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (torusRef.current) torusRef.current.rotation.y = t * 0.2;
    if (sphereRef.current) sphereRef.current.rotation.x = t * 0.3;
    if (boxRef.current) boxRef.current.rotation.z = t * 0.15;
  });

  return (
    <group>
      <PresentationControls global rotation={[0.13, 0.1, 0]} polar={[-0.4, 0.2]} azimuth={[-1, 0.75]}>
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
          <mesh ref={torusRef} position={[-2, 1, -2]} scale={1.5}>
            <torusGeometry args={[1, 0.3, 16, 100]} />
            <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.8} />
          </mesh>
        </Float>

        <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
          <mesh ref={sphereRef} position={[2, -1, 1]} scale={1.2}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.5} wireframe />
          </mesh>
        </Float>

        <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
          <mesh ref={boxRef} position={[0, -2, -3]} scale={1.5}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.4} />
          </mesh>
        </Float>

        {/* Central Logo Representation */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <group position={[0, 0.5, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
              <meshStandardMaterial color="#059669" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <boxGeometry args={[1.5, 0.1, 1.5]} />
              <meshStandardMaterial color="#047857" metalness={0.6} roughness={0.2} />
            </mesh>
          </group>
        </Float>
      </PresentationControls>

      <Environment preset="city" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
    </group>
  );
}

const LogoSVG = ({ className }: any) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginWithEmail(name, email, password);
    } else {
      registerWithEmail(email, password, name, role);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans overflow-hidden">
      {/* Left Panel: 3D Animation (Hidden on very small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden items-center justify-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
        
        <div className="absolute inset-0 z-10 pointer-events-none p-12 flex flex-col justify-between">
          <div>
            <LogoSVG className="w-16 h-16 mb-6 drop-shadow-2xl" />
            <h1 className="text-4xl font-bold text-zinc-100 mb-4 max-w-md">
              Welcome to the future of <span className="text-emerald-500">Education</span>.
            </h1>
            <p className="text-zinc-400 text-lg max-w-md">
              Manage your courses, track your progress, and collaborate in full 3D space.
            </p>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0 cursor-move">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <FloatingShapes />
          </Canvas>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20 bg-zinc-950">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden">
            <LogoSVG className="w-12 h-12 mb-4" />
            <h1 className="text-3xl font-bold text-zinc-100">EduVerse</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-zinc-100 mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-zinc-400">
              {isLogin ? "Enter your tracked Name and Email to proceed." : "Sign up with your exact Admin-tracked details."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="relative">
              <UserIcon className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            {!isLogin && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                  <input type="radio" name="role" value="student" checked={role === "student"} onChange={(e) => setRole(e.target.value)} className="accent-emerald-500" />
                  Student
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                  <input type="radio" name="role" value="teacher" checked={role === "teacher"} onChange={(e) => setRole(e.target.value)} className="accent-emerald-500" />
                  Teacher
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                  <input type="radio" name="role" value="admin" checked={role === "admin"} onChange={(e) => setRole(e.target.value)} className="accent-emerald-500" />
                  Admin
                </label>
              </div>
            )}
            
            <div className="relative">
              <Mail className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group shadow-lg shadow-emerald-500/20 mt-2"
            >
              <span>{isLogin ? "Sign In" : "Sign Up"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-zinc-400 mt-4">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
