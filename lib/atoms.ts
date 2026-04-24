import { atom } from 'jotai';

export const keywordAtom = atom('Tesla');
export const platformAtom = atom<'x' | 'facebook'>('x');
export const useLiveAtom = atom(true);
export const chatbotOpenAtom = atom(false);
