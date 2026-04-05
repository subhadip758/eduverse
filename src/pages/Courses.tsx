import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Users, Clock, Calendar, ChevronRight, BarChart3, Star, Plus, X } from "lucide-react";

export function Courses() {
  const { courses, addCourse } = useDatabase();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", code: "", instructor: "", students: 0, duration: "12 Weeks", rating: 0, progress: 0, color: "emerald", status: "Active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourse(formData);
      setIsModalOpen(false);
      setFormData({ name: "", code: "", instructor: "", students: 0, duration: "12 Weeks", rating: 0, progress: 0, color: "emerald", status: "Active" });
    } catch (err) {
      console.error(err);
      alert("Failed to create course.");
    }
  };

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    };
    return map[color] || map.emerald;
  };

  const getProgressColor = (color: string) => {
    const map: Record<string, string> = {
      emerald: "bg-emerald-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      amber: "bg-amber-500",
      rose: "bg-rose-500",
      cyan: "bg-cyan-500",
    };
    return map[color] || map.emerald;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Course Catalog</h2>
          <p className="text-zinc-500 text-sm">Manage and monitor all active courses</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-5 h-5" /> Create Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-colors group cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getColorClasses(course.color)}`}>
                {course.code}
              </span>
              <div className="flex items-center gap-1 text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium">{course.rating}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
              {course.name}
            </h3>
            
            <p className="text-sm text-zinc-500 mb-6 flex-grow">
              Instructed by <span className="text-zinc-300">{course.instructor}</span>
            </p>
            
            <div className="space-y-4 mt-auto">
              <div className="flex items-center justify-between text-zinc-400 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span>{course.students} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span>{course.duration}</span>
                </div>
              </div>
              
              <div className="space-y-1.5 border-t border-zinc-800 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">Course Progress</span>
                  <span className="text-zinc-300 font-bold">{course.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(course.color)} rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">Create New Course</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Course Code</label>
                <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="e.g. CS101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Course Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Instructor</label>
                <input type="text" required value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Duration</label>
                <input type="text" required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="e.g. 12 Weeks" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
