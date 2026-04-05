import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function Attendance() {
  const { students, attendance: attendanceRecords = [], addAttendance, updateAttendance } = useDatabase();
  const { profile } = useAuth();
  
  const isTeacherOrAdmin = profile?.role === "teacher" || profile?.role === "admin";
  const [currentDate, setCurrentDate] = useState(new Date("2026-03-19"));
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formattedCurrentDate = formatDate(currentDate);

  const nextDay = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 1);
    setCurrentDate(next);
  };

  const prevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleMarkAttendance = async (studentId: string, studentName: string, status: "present" | "absent" | "late") => {
    const existingIndex = attendanceRecords.findIndex(r => r.date === formattedCurrentDate && r.studentId === studentId);
    
    try {
      if (existingIndex >= 0) {
        const record = attendanceRecords[existingIndex];
        await updateAttendance({ ...record, status } as any);
      } else {
        await addAttendance({
          id: "A" + Date.now() + studentId,
          date: formattedCurrentDate,
          studentId,
          studentName,
          course: "CS101",
          status
        } as any);
      }
    } catch(err) {
        console.error("Firestore error:", err);
    }
  };

  const getRecordForStudent = (studentId: string) => {
    return attendanceRecords.find(r => r.date === formattedCurrentDate && r.studentId === studentId);
  };

  // If student, only show their records across all dates.
  const myRecords = attendanceRecords.filter(r => r.studentName === profile?.displayName || r.studentId === profile?.uid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Attendance Tracking</h2>
          <p className="text-zinc-500 text-sm">
            {isTeacherOrAdmin ? "Record and monitor daily student attendance" : "View your attendance history"}
          </p>
        </div>
        
        {isTeacherOrAdmin && (
          <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-800">
            <button onClick={prevDay} className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 text-zinc-200 font-medium min-w-[150px] justify-center">
              <CalendarIcon className="w-4 h-4 text-emerald-500" />
              {formattedCurrentDate}
            </div>
            <button onClick={nextDay} className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        )}
      </div>

      {isTeacherOrAdmin ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-zinc-200">CS101 Roster ({formattedCurrentDate})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 font-semibold text-zinc-400">Student Name</th>
                  <th className="pb-4 font-semibold text-zinc-400">Student ID</th>
                  <th className="pb-4 font-semibold text-zinc-400 text-right">Action / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {students.map((student) => {
                  const record = getRecordForStudent(student.id);
                  return (
                    <tr key={student.id} className="group hover:bg-zinc-800/50 transition-all">
                      <td className="py-4 font-medium text-zinc-100">{student.name}</td>
                      <td className="py-4 text-zinc-400 text-sm">{student.id}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleMarkAttendance(student.id, student.name, "present")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${record?.status === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}>
                            Present
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(student.id, student.name, "late")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${record?.status === 'late' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}>
                            Late
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(student.id, student.name, "absent")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${record?.status === 'absent' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}>
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-lg font-semibold text-zinc-200 mb-6">My Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 font-semibold text-zinc-400">Date</th>
                  <th className="pb-4 font-semibold text-zinc-400">Course</th>
                  <th className="pb-4 font-semibold text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {myRecords.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-zinc-500">No attendance records found.</td></tr>
                ) : myRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="py-4 text-zinc-300">{r.date}</td>
                    <td className="py-4 text-zinc-400">{r.course}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase ${
                        r.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                        r.status === 'late' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
