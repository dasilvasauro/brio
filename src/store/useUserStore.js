import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      // Perfil
      user: null,
      isQA: false,
      
      // Economia e Gamificação
      gold: 0,
      vouchers: 0,
      xp: 0,
      level: 1,

      // Personalização (Onboarding)
      preferences: {
        theme: 'dark',
        font: 'sans',
        accentColor: 'blue',
        animationsEnabled: true,
        transparencyEnabled: true,
        modusOperandi: null,
      },

      // Ações
      setUser: (userData) => set({ user: userData }),
      enableQA: () => set({ isQA: true }),
      addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
      addVouchers: (amount) => set((state) => ({ vouchers: state.vouchers + amount })),
      updatePreferences: (newPrefs) => set((state) => ({ 
        preferences: { ...state.preferences, ...newPrefs } 
      })),
    }),
    {
      name: 'brio-user-storage', // Nome da chave no localStorage
    }
  )
);