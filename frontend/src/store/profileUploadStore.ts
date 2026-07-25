/**
 * profileUploadStore – Zustand slice that tracks the freelancer's stored
 * Experience (CV skills + portfolio link) so it can be reflected in the UI.
 * The actual CV text lives server-side in the database — this store only
 * mirrors the summary info (filename, detected skills, portfolio link).
 */

import { create } from "zustand";

export interface ProfileState {
  /** Skills detected from CV by the backend */
  cvSkills: string[];
  /** Filename of the currently stored CV, if any */
  cvFilename: string | null;
  /** Whether a CV is currently stored in the database */
  cvUploaded: boolean;

  /** Portfolio link stored in the database */
  portfolioUrl: string;
  /** Whether the profile has been loaded from the backend at least once */
  loaded: boolean;
}

export interface ProfileActions {
  setExperience: (data: {
    cv_filename: string | null;
    cv_skills: string[];
    has_cv: boolean;
    portfolio_url: string | null;
  }) => void;
  resetAll: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

const INITIAL_STATE: ProfileState = {
  cvSkills: [],
  cvFilename: null,
  cvUploaded: false,
  portfolioUrl: "",
  loaded: false,
};

export const useProfileStore = create<ProfileStore>((set) => ({
  ...INITIAL_STATE,

  setExperience: (data) =>
    set({
      cvFilename: data.cv_filename,
      cvSkills: data.cv_skills,
      cvUploaded: data.has_cv,
      portfolioUrl: data.portfolio_url ?? "",
      loaded: true,
    }),

  resetAll: () => set(INITIAL_STATE),
}));
