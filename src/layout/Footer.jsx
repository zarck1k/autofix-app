export default function Footer(){
  return (
    <footer className="px-4 md:px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-200 bg-white shrink-0">
      © {new Date().getFullYear()} AutoFix — Sistema de gestión de taller mecánico
    </footer>
  );
}