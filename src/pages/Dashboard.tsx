import React, { useState } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../context/DatabaseContext";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const data = [
  { name: "Mon", attendance: 85, performance: 70 },
  { name: "Tue", attendance: 88, performance: 75 },
  { name: "Wed", attendance: 92, performance: 82 },
  { name: "Thu", attendance: 90, performance: 80 },
  { name: "Fri", attendance: 85, performance: 78 },
];

export function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { students, attendance, courses, sessions, addSession } = useDatabase();
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ date: "", time: "", topic: "" });

  const handleGenerateReport = () => {
    import("jspdf").then(({ jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129);
        doc.text("EduVerse Official Report", 14, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("System Analytics", 14, 45);
        
        doc.setFontSize(11);
        doc.text(`Total Active Students: ${students.length}`, 14, 55);
        doc.text(`Total Active Courses: ${courses.length}`, 14, 62);
        
        autoTable(doc, {
          startY: 80,
          head: [['ID', 'Name', 'Course', 'Status']],
          body: students.map(s => [s.id, s.name, s.course, s.status]),
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }
        });
        
        doc.save("eduverse_report.pdf");
      });
    });
  };
  
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({ ...scheduleForm, addedBy: profile?.displayName });
    alert(`Session scheduled for ${scheduleForm.date} at ${scheduleForm.time} on ${scheduleForm.topic}!`);
    setIsScheduleModalOpen(false);
    setScheduleForm({ date: "", time: "", topic: "" });
  };

  const totalRecords = attendance.length;
  const presentRecords = attendance.filter(a => a.status === 'present').length;
  const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
  
  // Calculate true at-risk students (< 75% attendance)
  const studentAttendance: Record<string, { total: number, absent: number }> = {};
  attendance.forEach(a => {
    if (!studentAttendance[a.studentId]) studentAttendance[a.studentId] = { total: 0, absent: 0 };
    studentAttendance[a.studentId].total++;
    if (a.status === 'absent') studentAttendance[a.studentId].absent++;
  });
  
  const atRiskStudentIds = Object.keys(studentAttendance).filter(id => {
    const { total, absent } = studentAttendance[id];
    return ((total - absent) / total) < 0.75;
  });
  
  const atRiskStudents = students.filter(s => atRiskStudentIds.includes(s.id));

  const stats = [
    { name: "Total Students", value: students.length.toString(), change: "+0%", trend: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Active Courses", value: courses.length.toString(), change: "+0", trend: "up", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Avg. Attendance", value: `${avgAttendance}%`, change: "-0%", trend: "down", icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Risk Alerts", value: atRiskStudents.length.toString(), change: "-0", trend: "up", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Welcome back, {profile?.displayName?.split(" ")[0]}!</h2>
          <p className="text-zinc-400">Here's what's happening in EduVerse today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400">
            Term: Spring 2026
          </div>
          <button 
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-sm font-bold transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {stat.change}
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">{stat.name}</p>
            <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Performance Trends
            </h3>
            <select className="bg-zinc-800 border-none rounded-lg text-xs font-medium text-zinc-400 px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Area type="monotone" dataKey="performance" stroke="#10b981" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Attendance Overview
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px" }}
                  cursor={{ fill: "#27272a" }}
                />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp className="w-32 h-32 text-emerald-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-500 font-bold mb-4 uppercase tracking-widest text-xs">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            AI Insight Engine
          </div>
          <h3 className="text-2xl font-bold text-zinc-100 mb-4">Predictive Performance Analysis</h3>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Based on current attendance trends, the following students have fallen below the 75% attendance threshold and are at high risk of failure:
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 max-h-40 overflow-y-auto">
            {atRiskStudents.length > 0 ? (
              <ul className="space-y-2">
                {atRiskStudents.map(student => (
                  <li key={student.id} className="text-rose-500 font-medium text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {student.name} ({student.course})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-500 font-medium text-sm">No student found</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate("/students")}
              className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-2xl hover:bg-emerald-400 transition-all">
              View All Students
            </button>
            {profile?.role !== "student" && (
              <button 
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-6 py-3 bg-zinc-800 text-zinc-100 font-bold rounded-2xl hover:bg-zinc-700 transition-all">
                Schedule Session
              </button>
            )}
          </div>
        </div>
      </div>

      {sessions && sessions.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-6 text-zinc-100 font-bold">
            <Clock className="w-5 h-5 text-blue-500" /> Upcoming Sessions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sessions.map((session, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                <p className="text-emerald-500 font-medium mb-1">{session.topic}</p>
                <div className="text-zinc-400 text-sm space-y-1">
                  <p>Date: {session.date}</p>
                  <p>Time: {session.time}</p>
                  <p className="text-xs text-zinc-500 mt-2">By: {session.addedBy || "Admin"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">Schedule Session</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                <input type="date" required value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Time</label>
                <input type="time" required value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Topic</label>
                <input type="text" required value={scheduleForm.topic} onChange={e => setScheduleForm({...scheduleForm, topic: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="e.g., Data Structures Review" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition-colors">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
