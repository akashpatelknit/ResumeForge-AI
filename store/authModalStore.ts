import { create } from "zustand";

export type AuthModalView = "sign-in" | "sign-up";

interface AuthModalStore {
  isOpen: boolean;
  view: AuthModalView;
  open: (view?: AuthModalView) => void;
  close: () => void;
  setView: (view: AuthModalView) => void;
}

// Single global modal mounted once in app/layout.tsx (see components/auth/AuthModal.tsx)
// and opened from any trigger — navbar links, the dropzone's rate-limit gate,
// useAuthGatedSave — in place of Clerk's openSignIn()/<SignInButton mode="modal">.
export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: "sign-in",
  open: (view = "sign-in") => set({ isOpen: true, view }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
