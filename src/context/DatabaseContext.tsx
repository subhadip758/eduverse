import React, { createContext, useContext, useState, useEffect } from "react";

interface DatabaseContextType {
  students: any[];
  teachers: any[];
  attendance: any[];
  results: any[];
  fees: any[];
  messages: any[];
  addStudent: (s: any) => Promise<void>;
  updateStudent: (s: any) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (t: any) => Promise<void>;
  updateTeacher: (t: any) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addAttendance: (a: any) => Promise<void>;
  updateAttendance: (a: any) => Promise<void>;
  addResult: (r: any) => Promise<void>;
  updateFeeStatus: (id: string, status: string) => Promise<void>;
  addMessage: (m: any) => Promise<void>;
  courses: any[];
  sessions: any[];
  addCourse: (c: any) => Promise<void>;
  updateCourse: (c: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addSession: (s: any) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({} as DatabaseContextType);
export const useDatabase = () => useContext(DatabaseContext);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const loadData = (key: string) => JSON.parse(localStorage.getItem(`eduverse_${key}`) || "[]");
  const saveData = (key: string, data: any[]) => localStorage.setItem(`eduverse_${key}`, JSON.stringify(data));

  const [students, setStudents] = useState<any[]>(loadData("students"));
  const [teachers, setTeachers] = useState<any[]>(loadData("teachers"));
  const [attendance, setAttendance] = useState<any[]>(loadData("attendance"));
  const [results, setResults] = useState<any[]>(loadData("results"));
  const [fees, setFees] = useState<any[]>(loadData("fees"));
  const [messages, setMessages] = useState<any[]>(loadData("messages"));
  const [courses, setCourses] = useState<any[]>(loadData("courses"));
  const [sessions, setSessions] = useState<any[]>(loadData("sessions"));

  // Listen for storage events specifically to sync across tabs!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eduverse_students") setStudents(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_teachers") setTeachers(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_attendance") setAttendance(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_results") setResults(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_fees") setFees(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_messages") setMessages(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_courses") setCourses(JSON.parse(e.newValue || "[]"));
      if (e.key === "eduverse_sessions") setSessions(JSON.parse(e.newValue || "[]"));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateAndSave = (key: string, data: any[], setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(data);
    saveData(key, data);
  };

  // STUDENTS
  const addStudent = async (student: any) => {
    const newDoc = { id: Date.now().toString(), ...student, createdAt: new Date().toISOString() };
    updateAndSave("students", [...students, newDoc], setStudents);
  };
  const updateStudent = async (s: any) => {
    updateAndSave("students", students.map(st => st.id === s.id ? { ...st, ...s, updatedAt: new Date().toISOString() } : st), setStudents);
  };
  const deleteStudent = async (id: string) => {
    updateAndSave("students", students.filter(st => st.id !== id), setStudents);
  };

  // TEACHERS
  const addTeacher = async (teacher: any) => {
    const newDoc = { id: Date.now().toString(), ...teacher, createdAt: new Date().toISOString() };
    updateAndSave("teachers", [...teachers, newDoc], setTeachers);
  };
  const updateTeacher = async (t: any) => {
    updateAndSave("teachers", teachers.map(th => th.id === t.id ? { ...th, ...t, updatedAt: new Date().toISOString() } : th), setTeachers);
  };
  const deleteTeacher = async (id: string) => {
    updateAndSave("teachers", teachers.filter(th => th.id !== id), setTeachers);
  };

  // ATTENDANCE
  const addAttendance = async (record: any) => {
    // Rely on record.id generated in Attendance.tsx or a fallback
    const id = record.id || `${record.date}-${record.course}-${record.studentId}`;
    const exists = attendance.some(a => a.id === id);
    if (!exists) {
        updateAndSave("attendance", [...attendance, { ...record, id }], setAttendance);
    }
  };
  const updateAttendance = async (a: any) => {
    const id = a.id || `${a.date}-${a.course}-${a.studentId}`;
    updateAndSave("attendance", attendance.map(att => att.id === id ? { ...att, ...a } : att), setAttendance);
  };

  // COURSES
  const addCourse = async (course: any) => {
    const newDoc = { id: Date.now().toString(), ...course, createdAt: new Date().toISOString() };
    updateAndSave("courses", [...courses, newDoc], setCourses);
  };
  const updateCourse = async (c: any) => {
    updateAndSave("courses", courses.map(cr => cr.id === c.id ? { ...cr, ...c, updatedAt: new Date().toISOString() } : cr), setCourses);
  };
  const deleteCourse = async (id: string) => {
    updateAndSave("courses", courses.filter(cr => cr.id !== id), setCourses);
  };

  // SESSIONS
  const addSession = async (session: any) => {
    const newDoc = { id: Date.now().toString(), ...session, createdAt: new Date().toISOString() };
    updateAndSave("sessions", [...sessions, newDoc], setSessions);
  };

  // RESULTS
  const addResult = async (result: any) => {
    const newDoc = { id: Date.now().toString(), ...result, createdAt: new Date().toISOString() };
    updateAndSave("results", [...results, newDoc], setResults);
  };

  // FEES
  const updateFeeStatus = async (id: string, status: string) => {
    // If it's a completely fake ID passed in from nowhere, we need to create it! 
    // Wait, Fees.tsx uses IDs from the mock data originally.
    let target = fees.find(f => f.id === id);
    if (!target) {
        // Find them in students to fabricate an invoice, or just update the one provided by default
        return;
    }
    updateAndSave("fees", fees.map(f => f.id === id ? { ...f, status } : f), setFees);
  };
  
  // MESSAGES
  const addMessage = async (msg: any) => {
    const newDoc = { id: Date.now().toString(), ...msg };
    updateAndSave("messages", [...messages, newDoc], setMessages);
  };

  // GENERATE SOME FAKE DATA VERY FIRST TIME IF EMPTY
  useEffect(() => {
    if (fees.length === 0) {
      updateAndSave("fees", [
        { id: "F1", studentId: "local-test@test.com", studentName: "Test User", type: "Tuition Fee", amount: 5000, dueDate: "2024-04-15", status: "Pending", date: new Date().toISOString().split('T')[0] },
        { id: "F2", studentId: "local-test@test.com", studentName: "Test User", type: "Library Fee", amount: 150, dueDate: "2024-04-15", status: "Completed", date: new Date().toISOString().split('T')[0] }
      ], setFees);
    }
    if (courses.length === 0) {
      updateAndSave("courses", [
        { id: "1", name: "Introduction to Computer Science", code: "CS101", instructor: "Dr. Sarah Miller", students: 124, duration: "12 Weeks", rating: 4.8, progress: 65, color: "emerald", status: "Active" },
        { id: "2", name: "Advanced Calculus", code: "MAT201", instructor: "Prof. James Wilson", students: 86, duration: "16 Weeks", rating: 4.5, progress: 40, color: "blue", status: "Active" },
        { id: "3", name: "Modern Physics", code: "PHY301", instructor: "Dr. Emily Chen", students: 54, duration: "14 Weeks", rating: 4.9, progress: 85, color: "purple", status: "Active" },
        { id: "4", name: "World History", code: "HIS102", instructor: "Dr. Michael Taylor", students: 156, duration: "10 Weeks", rating: 4.2, progress: 25, color: "amber", status: "Active" },
      ], setCourses);
    }
  }, []);

  return (
    <DatabaseContext.Provider value={{
      students, teachers, attendance, results, fees, messages, courses, sessions,
      addStudent, updateStudent, deleteStudent,
      addTeacher, updateTeacher, deleteTeacher,
      addCourse, updateCourse, deleteCourse, addSession,
      addAttendance, updateAttendance, addResult, updateFeeStatus, addMessage
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}
