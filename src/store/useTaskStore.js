import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      folders: [{ id: 'inbox', name: 'Entrada', color: 'gray' }], // Pasta padrão
      dailyMood: null,

      // Ações
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updatedData) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updatedData } : t)
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
      setDailyMood: (mood) => set({ dailyMood: mood }),
      removeFolder: (folderId) => set((state) => ({
        folders: state.folders.filter(f => f.id !== folderId),
        tasks: state.tasks.map(t => t.folderId === folderId ? { ...t, folderId: 'inbox' } : t)
      })),
    }),
    {
      name: 'brio-task-storage',
    }
  )
);