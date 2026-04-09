import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeWrapper } from './components/ThemeWrapper';
import { MainLayout } from './layouts/MainLayout';
import { useUserStore } from './store/useUserStore';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';

// Componentes temporários (vamos substituí-los nas próximas fases)
// Componentes temporários com alinhamento rigoroso igual ao da Home
const TempPage = () => (
  <div className="glass p-10 rounded-3xl text-center border-dashed border-2 border-slate-300 dark:border-slate-700/50">
    <p className="text-slate-500 font-medium text-lg">Seção em construção...</p>
  </div>
);
const OnboardingTemp = () => <div className="p-4"><h1>Onboarding em construção...</h1></div>;

export default function App() {
  const user = useUserStore((state) => state.user);
  const preferences = useUserStore((state) => state.preferences);

  // Regra 1: Se não tem usuário, força ir pro Login
  if (!user) {
    return (
      <ThemeWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ThemeWrapper>
    );
  }

  // Regra 2: Se tem usuário, mas não escolheu o Modus Operandi, força Onboarding
  if (user && !preferences.modusOperandi) {
    return (
      <ThemeWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Onboarding />} />
          </Routes>
        </BrowserRouter>
      </ThemeWrapper>
    );
  }

  // Regra 3: Tudo certo, acessa o app normal
  return (
    <ThemeWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home title="Tarefas" />} />
            <Route path="habitos" element={<TempPage title="Hábitos" />} />
            <Route path="loja" element={<TempPage title="Loja" />} />
            <Route path="perfil" element={<TempPage title="Perfil" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  );
}