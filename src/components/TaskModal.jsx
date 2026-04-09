import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Ticket, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useUserStore } from '../store/useUserStore';
import { encryptData } from '../utils/crypto';
import { useAppDate } from '../hooks/useAppDate';
import { differenceInMinutes, differenceInDays, parseISO } from 'date-fns';

export function TaskModal({ isOpen, onClose, taskToEdit = null, onSuccess }) {
  const { getNow } = useAppDate();
  
  const tasks = useTaskStore(state => state.tasks);
  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const removeTask = useTaskStore(state => state.removeTask);
  const folders = useTaskStore(state => state.folders);
  
  const vouchers = useUserStore(state => state.vouchers);
  const addVouchers = useUserStore(state => state.addVouchers);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P2');
  const [type, setType] = useState('normal');
  const [folderId, setFolderId] = useState('inbox');
  const [error, setError] = useState('');
  
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [duration, setDuration] = useState(25);
  
  // Novos estados para Sprint e Subtarefas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!taskToEdit;
  const minutesSinceCreation = isEditing ? differenceInMinutes(getNow(), new Date(taskToEdit.createdAt)) : 0;
  const isFreeEdit = minutesSinceCreation <= 10;

  useEffect(() => {
    if (isOpen && taskToEdit) {
      setTitle(taskToEdit.titleDecrypted || '');
      setDescription(taskToEdit.descDecrypted || '');
      setPriority(taskToEdit.priority);
      setType(taskToEdit.type);
      setFolderId(taskToEdit.folderId);
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setStartDate(taskToEdit.startDate || '');
      setEndDate(taskToEdit.endDate || '');
      setSubtasks(taskToEdit.subtasks || []);
      setDuration(taskToEdit.duration || 25);
    } else {
      setTitle('');
      setDescription('');
      setPriority('P2');
      setType('normal');
      setFolderId('inbox');
      setDueDate('');
      setDueTime('');
      setStartDate('');
      setEndDate('');
      setSubtasks([]);
    }
    setIsSubmitting(false);
    setError('');
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  // Lógica de Subtarefas
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: crypto.randomUUID(), text: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('O nome da tarefa é obrigatório.');

    const activeTasks = tasks.filter(t => !t.completed && t.id !== taskToEdit?.id);
    
    // Verificações
    if (priority === 'P0' && activeTasks.filter(t => t.priority === 'P0').length >= 4) return setError('Limite máximo de 4 tarefas P0 atingido.');
    if (priority === 'P1' && activeTasks.filter(t => t.priority === 'P1').length >= 6) return setError('Limite máximo de 6 tarefas P1 atingido.');

    if (type === 'sprint') {
      const hasSprint = activeTasks.some(t => t.type === 'sprint');
      if (hasSprint) return setError('Você só pode ter uma Sprint ativa por vez.');
      if (!startDate || !endDate) return setError('Sprints requerem data de início e fim.');
      if (differenceInDays(parseISO(endDate), parseISO(startDate)) > 31) return setError('Uma Sprint não pode ultrapassar 31 dias.');
      if (subtasks.length === 0) return setError('Uma Sprint precisa de pelo menos uma subtarefa.');
    }

    if (isEditing && !isFreeEdit) {
      if (vouchers < 1) return setError('Você precisa de 1 Voucher para editar após 10 minutos.');
      addVouchers(-1);
    }

    setIsSubmitting(true);

    const taskData = {
      id: isEditing ? taskToEdit.id : crypto.randomUUID(),
      titleEncrypted: encryptData(title),
      descEncrypted: encryptData(description),
      titleDecrypted: title, 
      descDecrypted: description,
      priority,
      type,
      folderId,
      createdAt: isEditing ? taskToEdit.createdAt : getNow().toISOString(),
      updatedAt: getNow().toISOString(),
      completed: isEditing ? taskToEdit.completed : false,
      duration: type === 'tempo' ? Number(duration) : null,
      dueDate: (type === 'desafio' || type === 'surpresa' || type === 'sprint') ? null : dueDate,
      dueTime: (type === 'desafio' || type === 'surpresa' || type === 'sprint') ? null : dueTime,
      startDate: type === 'sprint' ? startDate : null,
      endDate: type === 'sprint' ? endDate : null,
      subtasks: (type === 'sprint' || subtasks.length > 0) ? subtasks : []
    };

    setTimeout(() => {
      if (isEditing) updateTask(taskToEdit.id, taskData);
      else addTask(taskData);
      
      onSuccess?.(isEditing ? 'Tarefa atualizada!' : 'Tarefa criada com sucesso!');
      onClose();
    }, 400);
  };

  const handleDelete = () => {
    const confirmMessage = isFreeEdit 
      ? "Tem certeza que deseja excluir esta tarefa?" 
      : `Tem certeza? Esta exclusão custará 1 Voucher.\nSeu saldo atual é: ${vouchers}`;
      
    if (!window.confirm(confirmMessage)) return;

    if (!isFreeEdit) {
      if (vouchers < 1) return setError('Você precisa de 1 Voucher para excluir esta tarefa.');
      addVouchers(-1);
    }
    removeTask(taskToEdit.id);
    onSuccess?.('Tarefa excluída!');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg glass-solid dark:bg-slate-900 rounded-3xl p-6 relative shadow-2xl border border-slate-200 dark:border-slate-700 my-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-slate-100">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition"><X size={20} /></button>
          </div>

          {isEditing && (
            <div className={`mb-4 p-3 rounded-xl flex items-start gap-3 text-sm ${isFreeEdit ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>{isFreeEdit ? `Edição gratuita. Mais ${10 - minutesSinceCreation} min de carência.` : <span>Custará <strong>1 Voucher</strong>. Saldo: {vouchers} <Ticket size={14} className="inline mb-0.5"/></span>}</div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" placeholder="O que precisa ser feito?" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent text-lg font-semibold border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 pb-2 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400" maxLength={100} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Prioridade</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none dark:text-white text-sm">
                  <option value="P0">P0 (Crítica)</option>
                  <option value="P1">P1 (Alta)</option>
                  <option value="P2">P2 (Média)</option>
                  <option value="P3">P3 (Baixa)</option>
                  <option value="P4">P4 (Opcional)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tipo</label>
                <select value={type} onChange={e => setType(e.target.value)} disabled={taskToEdit?.type === 'surpresa'} className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none dark:text-white text-sm disabled:opacity-50">
                  <option value="normal">Normal</option>
                  <option value="desafio">Desafio Diário</option>
                  <option value="sprint">Sprint</option>
                  <option value="tempo">Tempo (Foco)</option>
                  {taskToEdit?.type === 'surpresa' && <option value="surpresa">Surpresa</option>}
                </select>
              </div>
            </div>

            {type !== 'desafio' && type !== 'surpresa' && type !== 'sprint' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Data</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Hora</label>
                  <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none dark:text-white text-sm" />
                </div>
              </div>
            )}

            {type === 'sprint' && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div>
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 block">Início da Sprint</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border-none outline-none dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 block">Fim (Máx 31d)</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border-none outline-none dark:text-white text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Pasta</label>
              <select value={folderId} onChange={e => setFolderId(e.target.value)} className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none dark:text-white text-sm">
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            {(type === 'sprint' || type === 'ambicioso_normal') && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Subtarefas (Progresso)</label>
                <div className="flex gap-2">
                  <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(e)} placeholder="Adicionar passo..." className="flex-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none text-sm dark:text-white" />
                  <button type="button" onClick={handleAddSubtask} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition"><PlusCircle size={20} /></button>
                </div>
                {subtasks.length > 0 && (
                  <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
                    {subtasks.map(s => (
                      <li key={s.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                        <input type="checkbox" checked={s.completed} onChange={() => toggleSubtask(s.id)} className="accent-blue-500 w-4 h-4 cursor-pointer" />
                        <span className={`flex-1 ${s.completed ? 'line-through text-slate-400' : 'dark:text-slate-200'}`}>{s.text}</span>
                        <button type="button" onClick={() => removeSubtask(s.id)} className="text-red-400 hover:text-red-600"><MinusCircle size={16} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div>
              <textarea placeholder="Detalhes adicionais (opcional, máx 1500 caracteres)..." value={description} onChange={e => setDescription(e.target.value)} maxLength={1500} className="w-full h-20 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none text-sm text-slate-700 dark:text-slate-200 resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {isEditing && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center mr-auto">
                  <Trash2 size={18} className="mr-1" /> Excluir
                </button>
              )}
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold skeuo-btn hover:bg-blue-500 disabled:opacity-70">
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar Tarefa')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}