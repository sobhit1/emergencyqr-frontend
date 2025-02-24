import {create} from 'zustand';
import { persist } from 'zustand/middleware';


const userStore = create(
  persist(
    (set) => ({
     user: undefined,
     setUser: (data) => set({ user: data })
     
    }),
    { name: 'user' }
  )
);

export { userStore };