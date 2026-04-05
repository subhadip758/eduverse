import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Mail, Phone, BookOpen, GraduationCap, Plus, Edit2, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

export function Teachers() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useDatabase();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    department: "Computer Science",
    email: "",
    phone: "",
    status: "Active",
    courses: 1
  });

  const handleOpenModal = (teacher?: any) => {
    if (teacher) {
      setFormData(teacher);
      setEditingId(teacher.id);
    } else {
      setFormData({
        id: "T" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        name: "",
        department: "Computer Science",
        email: "",
        phone: "",
        status: "Active",
        courses: 1
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingId) {
          await updateTeacher(formData as any);
        } else {
          await addTeacher(formData as any);
        }
        handleCloseModal();
    } catch(err) {
        console.error(err);
        alert("Failed to save to Firestore.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this teacher? They will also be removed from active chat contacts.")) {
      try {
        await deleteTeacher(id);
      } catch(err) {
          console.error(err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Teacher Management</h2>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Teacher
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="pb-4 font-semibold text-zinc-400">Name & ID</th>
              <th className="pb-4 font-semibold text-zinc-400">Department</th>
              <th className="pb-4 font-semibold text-zinc-400">Contact Info</th>
              <th className="pb-4 font-semibold text-zinc-400 text-center">Courses</th>
              <th className="pb-4 font-semibold text-zinc-400">Status</th>
              {isAdmin && <th className="pb-4 font-semibold text-zinc-400 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {teachers.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-zinc-500">No teachers found.</td></tr>
            ) : teachers.map((teacher) => (
              <tr key={teacher.id} className="group hover:bg-zinc-800/50 transition-all">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <GraduationCap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100">{teacher.name}</div>
                      <div className="text-xs text-zinc-500">{teacher.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-zinc-400">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-500" />
                    {teacher.department}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors">
                      <Mail className="w-3 h-3" />
                      {teacher.email}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors">
                      <Phone className="w-3 h-3" />
                      {teacher.phone}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-100 font-medium">
                    {teacher.courses}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase ${
                    teacher.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {teacher.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-4 text-right transition-opacity whitespace-nowrap">
                    <button onClick={() => handleOpenModal(teacher)} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(teacher.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">{editingId ? "Edit Teacher" : "Add New Teacher"}</h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Teacher ID</label>
                  <input type="text" value={formData.id} readOnly className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl px-4 py-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Department</label>
                  <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500">
                    <option>Computer Science</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>English Literature</option>
                    <option>History</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Courses Count</label>
                  <input type="number" min="1" max="10" required value={formData.courses} onChange={e => setFormData({...formData, courses: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500">
                  <option>Active</option>
                  <option>On Leave</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition-colors">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
