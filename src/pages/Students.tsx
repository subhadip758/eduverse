import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

export function Students() {
  const { students, addStudent, updateStudent, deleteStudent } = useDatabase();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    course: "Computer Science",
    status: "Active"
  });

  const handleOpenModal = (student?: any) => {
    if (student) {
      setFormData(student);
      setEditingId(student.id);
    } else {
      setFormData({
        id: "S" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        name: "",
        email: "",
        course: "Computer Science",
        status: "Active"
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
        await updateStudent(formData as any);
      } else {
        await addStudent(formData as any);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save to Firestore. Please check permissions.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete from Firestore.");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Student Management</h2>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Student
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="pb-4 font-semibold text-zinc-400">Name</th>
              <th className="pb-4 font-semibold text-zinc-400">ID</th>
              <th className="pb-4 font-semibold text-zinc-400">Course</th>
              <th className="pb-4 font-semibold text-zinc-400">Status</th>
              {isAdmin && <th className="pb-4 font-semibold text-zinc-400 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {students.length === 0 ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-zinc-500">No students found.</td></tr>
            ) : students.map((student) => (
              <tr key={student.id} className="group hover:bg-zinc-800/50 transition-all">
                <td className="py-4 font-medium text-zinc-100">{student.name}</td>
                <td className="py-4 text-zinc-400">{student.id}</td>
                <td className="py-4 text-zinc-400">{student.course}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase ${
                    student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {student.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-4 text-right transition-opacity">
                    <button onClick={() => handleOpenModal(student)} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors ml-2">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">{editingId ? "Edit Student" : "Add New Student"}</h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Student ID</label>
                <input type="text" value={formData.id} readOnly className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl px-4 py-2 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Course</label>
                <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500">
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500">
                  <option>Active</option>
                  <option>Inactive</option>
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
