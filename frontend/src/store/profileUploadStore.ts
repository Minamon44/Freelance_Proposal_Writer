/**
 * profileUploadStore – Zustand slice that tracks CV and LinkedIn profile data
 * so it can be injected into proposal generation requests.
 */

import { create } from "zustand";

export interface ProfileState {
  /** Raw text extracted from the uploaded CV */
  cvText: string;
  /** Skills detected from CV by the backend */
  cvSkills: string[];
  /** Whether a CV has been successfully uploaded */
  cvUploaded: boolean;

  /** LinkedIn profile data */
  linkedInName: string;
  linkedInHeadline: string;
  linkedInSkills: string[];
  linkedInFetched: boolean;

  /** Merged skill list (CV + LinkedIn, de-duplicated) */
  mergedSkills: string[];
}

export interface ProfileActions {
  setCvData: (text: string, skills: string[]) => void;
  setLinkedInData: (name: string, headline: string, skills: string[]) => void;
  clearCv: () => void;
  clearLinkedIn: () => void;
  resetAll: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

const INITIAL_STATE: ProfileState = {
  cvText: "",
  cvSkills: [],
  cvUploaded: false,
  linkedInName: "",
  linkedInHeadline: "",
  linkedInSkills: [],
  linkedInFetched: false,
  mergedSkills: [],
};

/** Merge two skill arrays, lower-case & de-duplicate */
function mergeSkills(a: string[], b: string[]): string[] {
  const set = new Set([...a, ...b].map((s) => s.toLowerCase().trim()));
  return Array.from(set).sort();
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...INITIAL_STATE,

  setCvData: (text, skills) =>
    set((state) => ({
      cvText: text,
      cvSkills: skills,
      cvUploaded: true,
      mergedSkills: mergeSkills(skills, state.linkedInSkills),
    })),

  setLinkedInData: (name, headline, skills) =>
    set((state) => ({
      linkedInName: name,
      linkedInHeadline: headline,
      linkedInSkills: skills,
      linkedInFetched: true,
      mergedSkills: mergeSkills(state.cvSkills, skills),
    })),

  clearCv: () =>
    set((state) => ({
      cvText: "",
      cvSkills: [],
      cvUploaded: false,
      mergedSkills: mergeSkills([], state.linkedInSkills),
    })),

  clearLinkedIn: () =>
    set((state) => ({
      linkedInName: "",
      linkedInHeadline: "",
      linkedInSkills: [],
      linkedInFetched: false,
      mergedSkills: mergeSkills(state.cvSkills, []),
    })),

  resetAll: () => set(INITIAL_STATE),
}));
