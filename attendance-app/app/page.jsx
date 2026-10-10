"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Upload, 
  Download, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  X
} from 'lucide-react';

// Konfigurasi Jam Pelajaran
const SCHEDULES = {
  'VIII C': {
    'Bahasa Inggris': 'Senin, 07:30 - 09:00 WITA',
  },
  'VIII D': {
    'Bahasa Inggris': 'Selasa, 09:15 - 10:45 WITA',
    'TIK': 'Kamis, 11:00 - 12:30 WITA'
  }
};

export default function App() {
  // State Utama
  const [currentClass, setCurrentClass] = useState('VIII C');
  const [currentSubject, setCurrentSubject] = useState('Bahasa Inggris');
  const [students, setStudents] = useState([]);
  
  // State untuk Modal Tambah Siswa
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ nisn: '', name: '' });
  const fileInputRef = useRef(null);

  // Update pilihan mapel jika kelas berubah (karena VIII C tidak ada TIK)
  useEffect(() => {
    if (currentClass === 'VIII C' && currentSubject === 'TIK') {
      setCurrentSubject('Bahasa Inggris');
    }
  }, [currentClass]);

  // Data siswa yang difilter berdasarkan kelas yang dipilih
  const filteredStudents = students.filter(s => s.className === currentClass);

  // Fungsi untuk mengubah status presensi
  const handleAttendanceChange = (studentId, status) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  // Fungsi Import CSV
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      
      const newStudents = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [nisn, name, className] = line.split(',');
        if (nisn && name && className) {
          newStudents.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            nisn: nisn.trim(),
            name: name.trim(),
            className: className.trim().toUpperCase(),
            status: null
          });
        }
      }
      
      setStudents(prev => [...prev, ...newStudents]);
      alert(`${newStudents.length} siswa berhasil diimpor!`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Fungsi Export ke CSV (Excel)
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert("Tidak ada data siswa untuk diexport di kelas ini.");
      return;
    }

    const headers = ['NISN', 'Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Status Kehadiran', 'Tanggal'];
    const dateToday = new Date().toLocaleDateString('id-ID');
    
    const rows = filteredStudents.map(s => [
      s.nisn,
      `"${s.name}"`,
      s.className,
      currentSubject,
      s.status || 'Belum Diabsen',
      dateToday
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Presensi_${currentClass}_${currentSubject}_${dateToday.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.nisn || !newStudent.name) return;

    const addedStudent = {
      id: Date.now().toString(),
      nisn: newStudent.nisn,
      name: newStudent.name,
      className: currentClass,
      status: null
    };

    setStudents(prev => [...prev, addedStudent]);
    setNewStudent({ nisn: '', name: '' });
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      {/* Decorative Vector Backgrounds */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse pointer-events-none"></div>
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-3 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <header className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="bg-white/50 backdrop-blur-md border border-white/60 p-4 sm:p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 mb-2">
              Panel Presensi Digital
            </h1>
            <p className="text-slate-600 flex items-center font-medium text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
              Guru Pengampu: <span className="font-bold ml-1 text-indigo-800">Syawal Saputra S.</span>
            </p>
          </div>

          {/* Jam Pelajaran Card */}
          <div className="bg-white/50 backdrop-blur-md border border-white/60 p-4 sm:p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="bg-indigo-100 p-2 sm:p-3 rounded-full text-indigo-600 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-0.5 sm:mb-1">Informasi Jam Pelajaran</p>
              <p className="font-bold text-slate-800 text-sm sm:text-base">
                {SCHEDULES[currentClass]?.[currentSubject] || "Jadwal Belum Ditentukan"}
              </p>
            </div>
          </div>
        </header>

        {/* Controls Section */}
        <div className="bg-white/50 backdrop-blur-lg border border-white/60 p-4 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-6 sm:mb-8 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center w-full xl:w-auto">
            {/* Filter Kelas */}
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Kelas</label>
              <div className="flex bg-white/50 rounded-xl p-1 shadow-sm border border-white/60">
                {['VIII C', 'VIII D'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setCurrentClass(cls)}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                      currentClass === cls 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Mata Pelajaran */}
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Mata Pelajaran</label>
              <div className="flex bg-white/50 rounded-xl p-1 shadow-sm border border-white/60">
                <button
                  onClick={() => setCurrentSubject('Bahasa Inggris')}
                  className={`flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
                    currentSubject === 'Bahasa Inggris' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> B. Inggris
                </button>
                
                {currentClass === 'VIII D' && (
                  <button
                    onClick={() => setCurrentSubject('TIK')}
                    className={`flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
                      currentSubject === 'TIK' 
                        ? 'bg-cyan-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> TIK
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
             <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportCSV} 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2.5 sm:py-2 bg-white/70 hover:bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm transition-all font-semibold text-sm"
              >
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all font-semibold text-sm"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all font-semibold text-sm"
              >
                <UserPlus className="w-4 h-4" /> Tambah Siswa
              </button>
          </div>
        </div>

        {/* MOBILE VIEW: Cards (Visible only on small screens) */}
        <div className="md:hidden space-y-4 mb-8">
          {filteredStudents.length === 0 ? (
             <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-8 text-center shadow-sm">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">Belum ada data siswa untuk kelas {currentClass}.</p>
             </div>
          ) : (
            filteredStudents.map((student, index) => (
              <div key={student.id} className="bg-white/60 backdrop-blur-xl border border-white/80 p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-3 border-b border-slate-200/50 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{student.name}</h3>
                    <p className="text-slate-500 font-mono text-sm mt-1">{student.nisn}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {index + 1}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAttendanceChange(student.id, 'Hadir')}
                    className={`flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      student.status === 'Hadir' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-emerald-600 border border-emerald-100'
                    }`}>
                    <CheckCircle className="w-4 h-4" /> Hadir
                  </button>
                  <button onClick={() => handleAttendanceChange(student.id, 'Sakit')}
                    className={`flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      student.status === 'Sakit' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-blue-600 border border-blue-100'
                    }`}>
                    <Info className="w-4 h-4" /> Sakit
                  </button>
                  <button onClick={() => handleAttendanceChange(student.id, 'Izin')}
                    className={`flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      student.status === 'Izin' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-amber-600 border border-amber-100'
                    }`}>
                    <AlertCircle className="w-4 h-4" /> Izin
                  </button>
                  <button onClick={() => handleAttendanceChange(student.id, 'Alpa')}
                    className={`flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      student.status === 'Alpa' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-rose-600 border border-rose-100'
                    }`}>
                    <XCircle className="w-4 h-4" /> Alpa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP VIEW: Table (Visible only on medium screens and up) */}
        <div className="hidden md:block bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/40 border-b border-white/50">
                  <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider w-16 text-center">No</th>
                  <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider w-40">NISN</th>
                  <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Nama Siswa</th>
                  <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider text-center">Keterangan Presensi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="font-medium text-lg">Belum ada data siswa untuk kelas {currentClass}.</p>
                        <p className="text-sm mt-1">Silakan "Import CSV" atau "Tambah Siswa" secara manual.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className="border-b border-white/30 hover:bg-white/30 transition-colors">
                      <td className="p-5 text-center font-medium text-slate-500">{index + 1}</td>
                      <td className="p-5 font-mono text-slate-600">{student.nisn}</td>
                      <td className="p-5 font-bold text-slate-800">{student.name}</td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Hadir')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                              student.status === 'Hadir' 
                                ? 'bg-emerald-500 text-white shadow-md scale-105' 
                                : 'bg-white/70 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" /> Hadir
                          </button>
                          
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Sakit')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                              student.status === 'Sakit' 
                                ? 'bg-blue-500 text-white shadow-md scale-105' 
                                : 'bg-white/70 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            <Info className="w-4 h-4" /> Sakit
                          </button>
                          
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Izin')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                              student.status === 'Izin' 
                                ? 'bg-amber-500 text-white shadow-md scale-105' 
                                : 'bg-white/70 text-amber-600 hover:bg-amber-100'
                            }`}
                          >
                            <AlertCircle className="w-4 h-4" /> Izin
                          </button>
                          
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Alpa')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                              student.status === 'Alpa' 
                                ? 'bg-rose-500 text-white shadow-md scale-105' 
                                : 'bg-white/70 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            <XCircle className="w-4 h-4" /> Alpa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah Siswa */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <UserPlus className="text-indigo-600 w-6 h-6" />
                Tambah Siswa {currentClass}
              </h2>
              
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={newStudent.nisn}
                    onChange={(e) => setNewStudent({...newStudent, nisn: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
                    placeholder="Contoh: 0081234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full sm:flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors order-2 sm:order-1"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all order-1 sm:order-2"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}