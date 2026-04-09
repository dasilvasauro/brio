import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHabitStore = create(
  persist(
    (set) => ({
      habits: [],
      generalStreak: 0,
      
      // Ações
      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (id, updatedData) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updatedData } : h)
      })),
      updateGeneralStreak: (days) => set({ generalStreak: days }),
    }),
    {
      name: 'brio-habit-storage',
    }
  )
);