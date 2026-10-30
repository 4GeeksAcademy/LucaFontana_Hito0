export const STATUS_LABELS = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
} as const;

export const STAGE_LABELS = {
  pending: "Pendiente de revisión",
  review: "En revisión",
  personal_interview: "Entrevista personal",
  technical_interview: "Entrevista técnica",
  offer_presented: "Oferta presentada",
} as const;

export type CandidateStatus = keyof typeof STATUS_LABELS;
export type CandidateStage = keyof typeof STAGE_LABELS;

export type AsyncState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

export type MutationResult = {
  success: boolean;
  error?: string;
};

export type CandidateNote = {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
};

export type CandidateRecordSummary = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
};

export type CandidateRecordDetail = CandidateRecordSummary & {
  notes: CandidateNote[];
};

export type CandidateFormValues = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  experience_years: number;
};

export type CandidateContextValue = {
  candidates: CandidateRecordSummary[];
  listState: AsyncState;
  createState: AsyncState;
  fetchCandidates: () => Promise<void>;
  fetchCandidate: (id: string) => Promise<void>;
  createCandidate: (values: CandidateFormValues) => Promise<MutationResult>;
  updateCandidate: (id: string, values: CandidateFormValues) => Promise<MutationResult>;
  patchCandidateStatus: (id: string, status: CandidateStatus) => Promise<MutationResult>;
  patchCandidateStage: (id: string, stage: CandidateStage) => Promise<MutationResult>;
  addNote: (id: string, content: string) => Promise<MutationResult>;
  deleteNote: (id: string, noteId: string) => Promise<MutationResult>;
  getCandidateDetail: (id: string) => CandidateRecordDetail | undefined;
  getDetailState: (id: string) => AsyncState;
  getUpdateState: (id: string) => AsyncState;
  getStatusPatchState: (id: string) => AsyncState;
  getStagePatchState: (id: string) => AsyncState;
  getNoteCreateState: (id: string) => AsyncState;
  getNoteDeleteState: (id: string, noteId: string) => AsyncState;
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));