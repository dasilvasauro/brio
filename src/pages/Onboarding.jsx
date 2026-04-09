import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { ChevronRight, ChevronLeft, Target, Zap, Clock, Maximize, Palette, Settings } from 'lucide-react';

// Dados do Carrossel (Passos 2 a 4)
const slides = [
  { title: "Sóbrio e Direto", desc: "Sem jargões infantis. O Brio transforma a sua disciplina em resultados quantificáveis através de um sistema de experiência e recompensas." },
  { title: "Foco Absoluto", desc: "Use Sprints para grandes projetos e o Modo Foco para tarefas baseadas em tempo. Proteja sua atenção." },
  { title: "Visão de Futuro", desc: "Defina características para abandonar, habilidades para adquirir e mantenha seus grandes objetivos sempre no horizonte." }
];

// Classes do Modus Operandi
const modusCards = [
  { id: 'multitarefa', name: 'Multitarefa', desc: 'Ganha mais XP e moedas ao completar tarefas conforme o volume.', activeClass: 'border-purple-400 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30', iconColor: 'text-indigo-500', icon: Target },
  { id: 'minimalista', name: 'Minimalista', desc: 'Bônus proporcional quanto menos tarefas ativas você mantiver.', activeClass: 'border-teal-400 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-teal-500/30', iconColor: 'text-emerald-500', icon: Zap },
  { id: 'pontual', name: 'Pontual', desc: 'Bônus de recompensa ao completar tarefas com data e hora no prazo.', activeClass: 'border-cyan-400 bg-gradient-to-br from-blue-400 to-cyan-600 shadow-lg shadow-cyan-500/30', iconColor: 'text-blue-500', icon: Clock },
  { id: 'ambicioso', name: 'Ambicioso', desc: 'Bônus ao completar Sprints e tarefas com múltiplas subtarefas.', activeClass: 'border-orange-400 bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-orange-500/30', iconColor: 'text-rose-500', icon: Maximize },
];

export default function Onboarding() {
  const [step, setStep] = useState(0); // 0 a 7
  
  // Estado local para guardar as escolhas antes de confirmar
  const [draft, setDraft] = useState({
    name: '',
    modusOperandi: null,
    theme: 'dark',
    font: 'sans',
    accentColor: 'blue',
    animationsEnabled: true,
    transparencyEnabled: true,
  });

  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const updatePreferences = useUserStore((state) => state.updatePreferences);

  const nextStep = () => setStep((s) => Math.min(s + 1, 7));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = () => {
    updatePreferences(draft);
    // Atualiza o nome do usuário no objeto user
    setUser({ ...user, name: draft.name });
  };

  const animProps = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Background Liquid Glass Global */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl p-8 rounded-3xl glass z-10 relative min-h-[500px] flex flex-col">
        
        {/* Barra de Progresso */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="bg-blue-500 h-full" 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / 8) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Passo 0: Bem-vindo */}
            {step === 0 && (
              <motion.div key="step0" {...animProps} className="text-center">
                <h1 className="text-4xl font-bold mb-4 dark:text-slate-100">Bem-vindo ao Brio</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  Organizar a correria do dia a dia não precisa ser caótico. O Brio foi desenhado para te dar clareza, recompensar sua disciplina e proteger seu foco.
                </p>
                <button onClick={nextStep} className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 skeuo-btn">
                  Começar Jornada
                </button>
              </motion.div>
            )}

            {/* Passos 1 a 3: Carrossel */}
            {[1, 2, 3].includes(step) && (
              <motion.div key={`carousel-${step}`} {...animProps} className="text-center">
                <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                  {step === 1 && <Target size={32} className="text-blue-500" />}
                  {step === 2 && <Clock size={32} className="text-blue-500" />}
                  {step === 3 && <Target size={32} className="text-blue-500" />}
                </div>
                <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">{slides[step-1].title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">{slides[step-1].desc}</p>
                <button onClick={nextStep} className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 skeuo-btn">
                  Continuar
                </button>
              </motion.div>
            )}

            {/* Passo 4: Nome */}
            {step === 4 && (
              <motion.div key="step4" {...animProps} className="text-center">
                <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">Como devemos te chamar?</h2>
                <input 
                  type="text" 
                  value={draft.name}
                  onChange={(e) => setDraft({...draft, name: e.target.value})}
                  placeholder="Seu nome ou apelido"
                  className="w-full max-w-sm px-4 py-3 mt-4 text-center text-lg rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  autoFocus
                />
                <div className="mt-8">
                  <button onClick={nextStep} disabled={!draft.name.trim()} className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 skeuo-btn disabled:opacity-50">
                    Avançar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Passo 5: Modus Operandi */}
            {step === 5 && (
              <motion.div key="step5" {...animProps} className="w-full">
                <h2 className="text-2xl font-bold text-center mb-2 dark:text-slate-100">Modus Operandi</h2>
                <p className="text-sm text-center text-slate-500 mb-6">Escolha a classe que melhor reflete seu estilo de produtividade.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modusCards.map((card) => {
                    const isSelected = draft.modusOperandi === card.id;
                    return (
                      <div 
                        key={card.id}
                        onClick={() => setDraft({...draft, modusOperandi: card.id})}
                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected ? `${card.activeClass} text-white scale-[1.02]` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 glass'}`}
                      >
                        <card.icon size={24} className={isSelected ? 'text-white mb-2' : `${card.iconColor} mb-2`} />
                        <h3 className="font-bold">{card.name}</h3>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>{card.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-center">
                  <button onClick={nextStep} disabled={!draft.modusOperandi} className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 skeuo-btn disabled:opacity-50">Confirmar Classe</button>
                </div>
              </motion.div>
            )}

            {/* Passo 6: Customização */}
            {step === 6 && (
              <motion.div key="step6" {...animProps} className="w-full">
                <h2 className="text-2xl font-bold text-center mb-6 dark:text-slate-100">Personalize seu Brio</h2>
                
                <div className="space-y-6 max-w-md mx-auto">
                  {/* Tema & Fonte */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tema</label>
                      <select value={draft.theme} onChange={(e) => setDraft({...draft, theme: e.target.value})} className="w-full p-2 rounded-lg bg-white/50 dark:bg-slate-800 border dark:border-slate-700 dark:text-white">
                        <option value="dark">Escuro</option>
                        <option value="light">Claro</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Fonte</label>
                      <select value={draft.font} onChange={(e) => setDraft({...draft, font: e.target.value})} className="w-full p-2 rounded-lg bg-white/50 dark:bg-slate-800 border dark:border-slate-700 dark:text-white">
                        <option value="sans">Moderna (Sans)</option>
                        <option value="serif">Clássica (Serif)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles de Performance */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 glass rounded-xl cursor-pointer">
                      <span className="text-sm font-medium dark:text-slate-200">Efeito Vidro (Transparência)</span>
                      <input type="checkbox" checked={draft.transparencyEnabled} onChange={(e) => setDraft({...draft, transparencyEnabled: e.target.checked})} className="w-5 h-5 accent-blue-500" />
                    </label>
                    <label className="flex items-center justify-between p-3 glass rounded-xl cursor-pointer">
                      <span className="text-sm font-medium dark:text-slate-200">Animações de Interface</span>
                      <input type="checkbox" checked={draft.animationsEnabled} onChange={(e) => setDraft({...draft, animationsEnabled: e.target.checked})} className="w-5 h-5 accent-blue-500" />
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button onClick={nextStep} className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 skeuo-btn">Ver Resumo</button>
                </div>
              </motion.div>
            )}

            {/* Passo 7: Resumo Final */}
            {step === 7 && (
              <motion.div key="step7" {...animProps} className="w-full text-center">
                <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">Tudo Pronto, {draft.name}!</h2>
                
                <div className="glass p-6 rounded-2xl mb-8 text-left space-y-4 max-w-md mx-auto border border-blue-500/30">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Classe</span>
                    <span className="font-bold capitalize dark:text-slate-100">{draft.modusOperandi}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Tema Visual</span>
                    <span className="font-bold capitalize dark:text-slate-100">{draft.theme}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500">Performance</span>
                    <span className="font-bold dark:text-slate-100 text-right text-sm">
                      {draft.transparencyEnabled ? 'Vidro' : 'Sólido'} / {draft.animationsEnabled ? 'Animado' : 'Estático'}
                    </span>
                  </div>
                </div>

                <button onClick={handleFinish} className="w-full max-w-md py-4 rounded-xl font-bold text-lg text-white bg-green-600 hover:bg-green-500 skeuo-btn transition-all">
                  Entrar no Brio
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botão de Voltar (oculto no primeiro e último passo) */}
        {step > 0 && step < 7 && (
          <div className="absolute top-6 left-6">
            <button onClick={prevStep} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <ChevronLeft size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}