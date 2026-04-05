import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Download, Search, CheckCircle2, ChevronRight, BarChart, Plus, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Results() {
  const { results, addResult, students } = useDatabase();
  const { profile } = useAuth();
  
  const isTeacher = profile?.role === "teacher";
  const isAdmin = profile?.role === "admin";
  const isTeacherOrAdmin = isTeacher || isAdmin;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    exam: "Final Exam",
    score: 0
  });

  const getGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    if (!student) return alert("Student not found. Use a valid ID.");
    
    try {
      await addResult({
        id: "R" + Date.now(),
        studentId: student.id,
        studentName: student.name,
        exam: formData.exam,
        score: formData.score,
        grade: getGrade(formData.score),
        status: formData.score >= 60 ? "Passed" : "Failed"
      } as any);
      setIsModalOpen(false);
    } catch(err) {
        console.error(err);
    }
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.text("EduVerse Official Examination Report", 14, 15);
    
    const tableData = displayResults.map(r => [
      r.studentName,
      r.studentId,
      r.exam,
      `${r.score}/100`,
      r.grade,
      r.status
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["Student Name", "ID", "Exam", "Score", "Grade", "Status"]],
      body: tableData,
    });

    const filename = isTeacherOrAdmin ? "Class_Master_Report.pdf" : `${profile?.displayName?.replace(/\s+/g, '_')}_Report.pdf`;
    doc.save(filename);
  };

  // If student, view only own results
  let displayResults = isTeacherOrAdmin 
    ? results 
    : results.filter(r => r.studentName === profile?.displayName || r.studentId === profile?.uid);

  if (searchQuery.trim() !== "") {
    displayResults = displayResults.filter(r => 
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Exam & Results</h2>
          <p className="text-zinc-500 text-sm">
            {isTeacherOrAdmin ? "Manage student grades and performance reports" : "View your grades and exam performance"}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {isTeacherOrAdmin && (
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..." 
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
          {isTeacherOrAdmin && (
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Mark
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-zinc-200 mb-4">{isTeacherOrAdmin ? "Recent Results" : "My Results"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 font-semibold text-zinc-400">Student Name</th>
                  <th className="pb-4 font-semibold text-zinc-400">Exam Details</th>
                  <th className="pb-4 font-semibold text-zinc-400">Score</th>
                  <th className="pb-4 font-semibold text-zinc-400">Grade</th>
                  <th className="pb-4 font-semibold text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {displayResults.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-zinc-500">No results found.</td></tr>
                ) : displayResults.map((result) => (
                  <tr key={result.id} className="group hover:bg-zinc-800/50 transition-all">
                    <td className="py-4">
                      <div className="font-medium text-zinc-100">{result.studentName}</div>
                      <div className="text-xs text-zinc-500">{result.studentId}</div>
                    </td>
                    <td className="py-4 text-zinc-400 text-sm">{result.exam}</td>
                    <td className="py-4 font-medium text-zinc-200">{result.score}/100</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                        result.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-500' :
                        result.grade.startsWith('B') ? 'bg-blue-500/20 text-blue-500' :
                        result.grade.startsWith('C') ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase ${
                        result.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {isTeacherOrAdmin && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-zinc-200">Class Overview</h3>
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Pass Rate</p>
                  <p className="text-2xl font-bold text-zinc-100">85%</p>
                </div>
              </div>
            </div>
            {isTeacherOrAdmin ? (
              <button onClick={handleGenerateReport} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-medium py-3 rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Generate Master Report
              </button>
            ) : (
              <button onClick={handleGenerateReport} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-medium py-3 rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download My Report
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">Upload Mark</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddResult} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Student ID</label>
                <input type="text" required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} placeholder="e.g. S001" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Exam Type</label>
                <input type="text" required value={formData.exam} onChange={e => setFormData({...formData, exam: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Score (0-100)</label>
                <input type="number" min="0" max="100" required value={formData.score} onChange={e => setFormData({...formData, score: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition-colors">Save Score</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
