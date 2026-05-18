import { create } from 'zustand';

interface AuthGateState {
  isOpen: boolean;
  openGate: () => void;
  closeGate: () => void;
}

export const useAuthGateStore = create<AuthGateState>((set) => ({
  isOpen: false,
  openGate: () => set({ isOpen: true }),
  closeGate: () => set({ isOpen: false }),
}));

