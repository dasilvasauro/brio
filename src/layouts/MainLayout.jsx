import { Outlet, useLocation, NavLink, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, CheckSquare, ShoppingBag, User } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

// Componente da Navbar (igual ao anterior)
function Navigation() {
  const navItems = [
    { icon: HomeIcon, label: 'Início', path: '/' },
    { icon: CheckSquare, label: 'Hábitos', path: '/habitos' },
    { icon: ShoppingBag, label: 'Loja', path: '/loja' },
    { icon: User, label: 'Perfil', path: '/perfil' },
  ];

  return (
    <nav className="fixed bottom-0 w-full glass border-t border-white/20 dark:border-slate-800/50 pb-safe z-50">
      <div className="max-w-md mx-auto px-6 py-3 flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 scale-110' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`
            }
          >
            <item.icon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// Mapa de Títulos por Rota
const routeTitles = {
  '/': 'Olá, {name}!',
  '/habitos': 'Hábitos',
  '/loja': 'Loja do Brio',
  '/perfil': 'Seu Perfil',
};

export function MainLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const userName = useUserStore(state => state.user?.name || 'Brio');
  const animationsEnabled = useUserStore(state => state.preferences.animationsEnabled);

  // Obtém o título da rota atual e substitui o nome se necessário
  let currentTitle = routeTitles[location.pathname] || 'Brio';
  if (currentTitle.includes('{name}')) {
    currentTitle = currentTitle.replace('{name}', userName);
  }

  // Configuração da transição fluida (Fade In/Out)
  const pageTransition = animationsEnabled ? {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: { duration: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors relative">
      {/* Background Global Glass (mantido) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* CONTAINER PRINCIPAL CORRIGIDO (Largura e Margens) */}
      <div className="max-w-screen-lg mx-auto px-6 pt-10 pb-24">
        
        {/* HEADER FIXO (Não anima, resolve o alinhamento) */}
        <header className="mb-10 h-10 flex items-center">
          <h1 className="text-3xl font-extrabold dark:text-slate-100 tracking-tight">
            {currentTitle}
          </h1>
        </header>

        {/* AnimatePresence monitora a mudança do location.pathname */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            {...pageTransition}
            className="w-full"
          >
            {currentOutlet}
          </motion.main>
        </AnimatePresence>
      </div>

      <Navigation />
    </div>
  );
}