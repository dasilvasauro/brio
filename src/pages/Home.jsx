import { useState, useEffect } from 'react';
import { useAppDate } from '../hooks/useAppDate';
import { format, addDays, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, List, Sun, Smile, Meh, Frown, ThumbsDown, CheckCircle2, Trash2, Layers, Zap, Gift, Target } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useUserStore } from '../store/useUserStore';
import { TaskModal } from '../components/TaskModal';
import { encryptData } from '../utils/crypto'; // <-- Adicionado o import do encryptData

const moods = [
  { id: 'radiant', label: 'Radiante', icon: Sun, color: 'text-yellow-500' },
  { id: 'happy', label: 'Feliz', icon: Smile, color: 'text-green-500' },
  { id: 'normal', label: 'Normal', icon: Meh, color: 'text-blue-500' },
  { id: 'bothered', label: 'Incomodado', icon: Frown, color: 'text-orange-500' },
  { id: 'disappointed', label: 'Decepcionado', icon: ThumbsDown, color: 'text-red-500' },
];

const tabs = ['Hoje', 'Amanhã', 'Essa semana', 'Esse mês', 'Geral'];

export default function Home() {
  const animationsEnabled = useUserStore(state => state.preferences.animationsEnabled);
  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);

  const folders = useTaskStore(state => state.folders);
  const dailyMood = useTaskStore(state => state.dailyMood);
  const setDailyMood = useTaskStore(state => state.setDailyMood);
  const addFolder = useTaskStore(state => state.addFolder);
  const removeFolder = useTaskStore(state => state.removeFolder); 

  const [activeTab, setActiveTab] = useState('Hoje');
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // <-- CORRIGIDO: Adicionado o isNewDay na desestruturação
  const { getNow, isNewDay } = useAppDate();
  const addTask = useTaskStore(state => state.addTask);

  // Controle dinâmico das animações
  const animProps = animationsEnabled ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 1, y: 0 },
    transition: { duration: 0 }
  };

  const openNewTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditTask = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleFolderCreate = (e) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      addFolder({ id: crypto.randomUUID(), name: newFolderName, color: 'blue' });
      setNewFolderName('');
      setIsCreatingFolder(false);
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false);
    }
  };

  // Gerador de Tarefas Surpresa
  useEffect(() => {
    const lastAccess = localStorage.getItem('brio_last_access');
    
    if (isNewDay(lastAccess)) {
      if (Math.random() <= 0.15) {
        const surprises = [
          "Coma uma fruta", "Leia um artigo de 5 min", "Beba um copo d'água agora", 
          "Faça um alongamento", "Escreva uma linha sobre ontem"
        ];
        const randomText = surprises[Math.floor(Math.random() * surprises.length)];
        
        addTask({
          id: crypto.randomUUID(),
          titleEncrypted: encryptData(randomText),
          descEncrypted: encryptData("Tarefa gerada automaticamente. Válida apenas para o dia de hoje!"),
          titleDecrypted: randomText,
          descDecrypted: "Tarefa gerada automaticamente. Válida apenas para o dia de hoje!",
          priority: 'P2',
          type: 'surpresa',
          folderId: 'inbox',
          createdAt: getNow().toISOString(),
          updatedAt: getNow().toISOString(),
          completed: false,
          dueDate: null, dueTime: null
        });
      }
      localStorage.setItem('brio_last_access', getNow().toISOString());
    }
  }, [getNow, isNewDay, addTask]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000); 
  };

  // Filtra as tarefas
  const now = getNow();
  const todayStr = format(now, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(now, 1), 'yyyy-MM-dd');

  const filteredTasks = tasks.filter(task => {
    if (activeFolder !== 'all' && task.folderId !== activeFolder) return false;
    if (activeTab === 'Geral') return true;

    const taskDateStr = task.dueDate;

    if (activeTab === 'Hoje') {
      if (task.type === 'desafio' || task.type === 'surpresa') return true;
      if (!taskDateStr) return true; 
      return taskDateStr <= todayStr; 
    }

    if (activeTab === 'Amanhã') {
      return taskDateStr === tomorrowStr;
    }

    if (!taskDateStr) return false; 

    const taskDate = parseISO(taskDateStr);

    if (activeTab === 'Essa semana') {
      const isThisWeek = isSameWeek(taskDate, now, { weekStartsOn: 1 }); 
      return isThisWeek && taskDateStr !== todayStr && taskDateStr !== tomorrowStr;
    }

    if (activeTab === 'Esse mês') {
      const isThisMonth = isSameMonth(taskDate, now);
      const isThisWeek = isSameWeek(taskDate, now, { weekStartsOn: 1 });
      return isThisMonth && !isThisWeek;
    }

    return false;
  });

  const handleDeleteFolder = (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir a pasta "${name}"?\nAs tarefas contidas nela serão movidas para a Entrada.`)) {
      removeFolder(id);
      if (activeFolder === id) setActiveFolder('inbox'); 
      showToast('Pasta excluída!');
    }
  };

  const handleToggleComplete = (e, task) => {
    e.stopPropagation(); // Evita abrir o modal de edição ao clicar no check
    updateTask(task.id, { completed: !task.completed, updatedAt: getNow().toISOString() });
    
    if (!task.completed) {
      showToast(task.type === 'sprint' ? 'Sprint Finalizada! Épico!' : 'Tarefa concluída! Bom trabalho.');
    }
  };

  return (
    <div className="pb-16 pt-2">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 glass-solid bg-emerald-50 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-700 px-4 py-3 rounded-2xl flex items-center shadow-lg"
          >
            <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 mr-2" size={20} />
            <span className="font-medium text-emerald-800 dark:text-emerald-100 text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <header className="mb-8">
        <div className="glass p-4 rounded-2xl">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            Como você está se sentindo hoje?
          </p>
          <div className="flex justify-between items-center max-w-md">
            {moods.map(mood => {
              const isSelected = dailyMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setDailyMood(mood.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white/80 dark:bg-slate-800 scale-110 shadow-sm' 
                      : 'hover:bg-white/50 dark:hover:bg-slate-800/50 opacity-60 hover:opacity-100'
                  }`}
                  title={mood.label}
                >
                  <mood.icon size={28} className={mood.color} />
                  {isSelected && (
                    <span className="text-[10px] mt-1 font-bold dark:text-slate-200">
                      {mood.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        
        <aside className="w-full md:w-48 shrink-0">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pastas</h2>
            <button onClick={() => setIsCreatingFolder(true)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            
            <button
              onClick={() => setActiveFolder('all')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 md:shrink mb-1 ${
                activeFolder === 'all' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers size={16} className={activeFolder === 'all' ? 'text-blue-500' : 'text-slate-400'} />
              Todas as Pastas
            </button>

            {folders.map(folder => (
              <div key={folder.id} className="relative group flex items-center shrink-0 md:shrink">
                <button
                  onClick={() => setActiveFolder(folder.id)}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap pr-8 ${
                    activeFolder === folder.id 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Folder size={16} className={activeFolder === folder.id ? 'text-blue-500' : 'text-slate-400'} />
                  {folder.name}
                </button>
                
                {folder.id !== 'inbox' && (
                  <button
                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Excluir Pasta"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            {isCreatingFolder && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 min-w-[120px] shrink-0 md:shrink mt-1">
                <Folder size={16} className="text-slate-400" />
                <input 
                  autoFocus
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleFolderCreate}
                  onBlur={() => setIsCreatingFolder(false)}
                  placeholder="Nome..."
                  className="w-full bg-transparent text-sm outline-none dark:text-white"
                />
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          
          <div className="flex space-x-1 glass rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeFolder}-${activeTab}`} 
              {...animProps}
              className="space-y-3"
            >
              {filteredTasks.length === 0 ? (
                <div className="glass p-8 rounded-2xl text-center border-dashed border-2 border-slate-300 dark:border-slate-700/50">
                  <List size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold dark:text-slate-200 mb-2">Nenhuma tarefa por aqui</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    {activeFolder === 'all' 
                      ? `Nenhuma tarefa encontrada em todas as pastas para a visualização "${activeTab}".`
                      : `A pasta "${folders.find(f => f.id === activeFolder)?.name}" está vazia para a visualização "${activeTab}".`
                    }
                  </p>
                </div>
              ) : (
                // Lista de Tarefas Renderizada
                filteredTasks.map(task => {
                  const isSprint = task.type === 'sprint';
                  const totalSub = task.subtasks?.length || 0;
                  const doneSub = task.subtasks?.filter(s => s.completed).length || 0;
                  const sprintProgress = totalSub > 0 ? (doneSub / totalSub) * 100 : 0;
                  const isCompleted = task.completed;

                  return (
                    <div 
                      key={task.id} 
                      onClick={() => openEditTask(task)}
                      className={`
                        relative cursor-pointer transition-all duration-300 flex items-start gap-3 
                        ${isCompleted ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:-translate-y-0.5'}
                        ${isSprint 
                          ? 'p-5 rounded-2xl border-2 border-blue-400/50 dark:border-blue-500/50 bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-slate-800 dark:to-blue-900/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]' 
                          : 'glass-solid p-4 rounded-xl border-l-4'
                        }
                      `}
                      style={!isSprint ? { borderLeftColor: { P0: '#ef4444', P1: '#f97316', P2: '#3b82f6', P3: '#22c55e', P4: '#64748b' }[task.priority] || '#cbd5e1' } : {}}
                    >
                      {/* BOTÃO DE CHECK (CONCLUIR) */}
                      <button 
                        onClick={(e) => handleToggleComplete(e, task)}
                        className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500 bg-transparent'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 size={16} strokeWidth={3} />}
                      </button>

                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isSprint ? 'bg-blue-200/50 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                              {task.priority} 
                              {task.type === 'desafio' && <><Zap size={10} className="text-yellow-500"/> Desafio</>}
                              {task.type === 'surpresa' && <><Gift size={10} className="text-purple-500"/> Surpresa</>}
                              {task.type === 'sprint' && <><Target size={10} className="text-blue-600 dark:text-blue-400"/> SPRINT</>}
                              {task.type === 'normal' && '• Normal'}
                              {task.type === 'tempo' && '• Tempo'}
                            </span>
                            
                            {activeFolder === 'all' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center gap-1 bg-white/50 dark:bg-slate-800/50">
                                <Folder size={10} />
                                {folders.find(f => f.id === task.folderId)?.name || 'Desconhecida'}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h4 className={`font-bold text-lg ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'} ${isSprint ? 'text-xl text-blue-900 dark:text-blue-100' : ''}`}>
                            {task.titleDecrypted}
                          </h4>
                          {task.descDecrypted && (
                            <p className={`text-sm line-clamp-2 mt-1 ${isCompleted ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              {task.descDecrypted}
                            </p>
                          )}
                        </div>

                        {/* Barra de Progresso Visível Exclusiva para Sprints */}
                        {isSprint && (
                          <div className="w-full mt-3 p-3 bg-white/60 dark:bg-slate-950/40 rounded-xl border border-white/50 dark:border-slate-800/50 backdrop-blur-sm">
                            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">
                              <span>Progresso do Projeto</span>
                              <span>{doneSub} / {totalSub} Tarefas</span>
                            </div>
                            <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-400 to-indigo-500" 
                                style={{ width: `${sprintProgress}%` }} 
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-medium uppercase">
                              <span>Início: {task.startDate ? format(parseISO(task.startDate), 'dd/MM') : '--'}</span>
                              <span>Prazo: {task.endDate ? format(parseISO(task.endDate), 'dd/MM') : '--'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )} {/* <-- AQUI ESTAVA FALTANDO O FECHAMENTO DO TERNÁRIO E DO MAP */}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <motion.button
        onClick={openNewTask}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-6 md:bottom-28 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_8px_30px_rgb(59,130,246,0.5)] flex items-center justify-center skeuo-btn z-[60]"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>
      
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        taskToEdit={taskToEdit} 
        onSuccess={showToast}
      />
      
    </div>
  );
}