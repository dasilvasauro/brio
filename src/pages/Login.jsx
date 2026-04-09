import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { Shield, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [view, setView] = useState('DEFAULT');
  const [email, setEmail] = useState('');
  const [qaCode, setQaCode] = useState('');
  
  const setUser = useUserStore((state) => state.setUser);
  const enableQA = useUserStore((state) => state.enableQA);
  const animationsEnabled = useUserStore((state) => state.preferences.animationsEnabled);

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ uid: '123', email: 'user@brio.com' });
  };

  const handleQARequest = (e) => {
    e.preventDefault();
    if (email) setView('QA_VALIDATE');
  };

  const handleQAValidate = (e) => {
    e.preventDefault();
    if (qaCode === 'brio123') {
      enableQA();
      setUser({ uid: 'qa-admin', email, isQA: true });
    } else {
      alert('Senha incorreta!');
    }
  };

  // Configuração dinâmica das animações baseada na escolha do usuário
  const animProps = animationsEnabled ? {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: "easeInOut" }
  } : {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: 0 },
    transition: { duration: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl glass z-10 overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Brio</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Coragem e energia para o seu dia.</p>
        </div>

        {/* AnimatePresence gerencia os elementos que entram e saem da tela */}
        <AnimatePresence mode="wait">
          {view === 'DEFAULT' && (
            <motion.form key="default" {...animProps} onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-200">E-mail</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-200">Senha</label>
                <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full py-3 mt-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 skeuo-btn transition-all">
                Entrar
              </button>
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={() => setView('QA_REQUEST')} className="flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Shield size={14} className="mr-1" /> Acesso QA
                </button>
              </div>
            </motion.form>
          )}

          {view === 'QA_REQUEST' && (
            <motion.form key="qa_request" {...animProps} onSubmit={handleQARequest} className="space-y-4">
              <div className="text-center mb-4">
                <Shield className="mx-auto mb-2 text-slate-400" size={32} />
                <h2 className="text-lg font-semibold dark:text-slate-100">Modo de Qualidade</h2>
                <p className="text-xs text-slate-500">Insira seu e-mail autorizado para receber a chave de acesso.</p>
              </div>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="qa@brio.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 skeuo-btn transition-all">
                Enviar Chave
              </button>
              <button type="button" onClick={() => setView('DEFAULT')} className="w-full py-3 flex justify-center items-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <ArrowLeft size={16} className="mr-2" /> Voltar
              </button>
            </motion.form>
          )}

          {view === 'QA_VALIDATE' && (
            <motion.form key="qa_validate" {...animProps} onSubmit={handleQAValidate} className="space-y-4">
              <div className="text-center mb-4">
                <KeyRound className="mx-auto mb-2 text-blue-500" size={32} />
                <h2 className="text-lg font-semibold dark:text-slate-100">Chave Enviada</h2>
                <p className="text-xs text-slate-500">Verifique a caixa de entrada de {email}</p>
              </div>
              <div>
                <input type="text" value={qaCode} onChange={(e) => setQaCode(e.target.value)} required placeholder="Insira a chave recebida" className="w-full px-4 py-3 text-center tracking-widest uppercase rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 skeuo-btn transition-all">
                Validar e Acessar
              </button>
              <button type="button" onClick={() => setView('QA_REQUEST')} className="w-full py-3 flex justify-center items-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <ArrowLeft size={16} className="mr-2" /> Alterar E-mail
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}