"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AsyncState,
  CandidateContextValue,
  CandidateFormValues,
  CandidateNote,
  CandidateRecordDetail,
  CandidateRecordSummary,
  CandidateStage,
  CandidateStatus,
  MutationResult,
} from "@/types";

const API_BASE = "https://playground.4geeks.com/tracker/api/v1";

const CandidateContext = createContext<CandidateContextValue | undefined>(undefined);

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<CandidateRecordSummary[]>([]);
  const [details, setDetails] = useState<Record<string, CandidateRecordDetail>>({});
  const [listState, setListState] = useState<AsyncState>({ status: "idle" });
  const [createState, setCreateState] = useState<AsyncState>({ status: "idle" });
  const [detailStates, setDetailStates] = useState<Record<string, AsyncState>>({});
  const [updateStates, setUpdateStates] = useState<Record<string, AsyncState>>({});
  const [statusPatchStates, setStatusPatchStates] = useState<Record<string, AsyncState>>({});
  const [stagePatchStates, setStagePatchStates] = useState<Record<string, AsyncState>>({});
  const [noteCreateStates, setNoteCreateStates] = useState<Record<string, AsyncState>>({});
  const [noteDeleteStates, setNoteDeleteStates] = useState<Record<string, Record<string, AsyncState>>>({});

  useEffect(() => {
    if (listState.status === "idle") {
      void fetchCandidates();
    }
  }, [listState.status]);

  const fetchCandidates = async () => {
    setListState({ status: "loading", message: "Cargando candidaturas..." });

    try {
      const response = await fetch(`${API_BASE}/records`, { cache: "no-store" });
      const data = await parseResponse<CandidateRecordSummary[]>(response);
      const normalized = Array.isArray(data) ? data.map(normalizeRecordSummary) : [];
      setCandidates(normalized);
      setListState({ status: "success", message: "Candidaturas actualizadas." });
    } catch (error) {
      setListState({
        status: "error",
        message: getErrorMessage(error, "No se pudieron cargar las candidaturas."),
      });
    }
  };

  const fetchCandidate = async (id: string) => {
    setDetailStates((current) => ({
      ...current,
      [id]: { status: "loading", message: "Cargando detalle del candidato..." },
    }));

    try {
      const [recordResponse, notesResponse] = await Promise.all([
        fetch(`${API_BASE}/records/${id}`, { cache: "no-store" }),
        fetch(`${API_BASE}/records/${id}/notes`, { cache: "no-store" }),
      ]);
      const recordData = await parseResponse<Partial<CandidateRecordDetail>>(recordResponse);
      const notesData = await parseResponse<CandidateNote[]>(notesResponse);
      const detail = normalizeRecordDetail(recordData, Array.isArray(notesData) ? notesData : []);

      setDetails((current) => ({ ...current, [id]: detail }));
      setCandidates((current) => upsertSummary(current, detail));
      setDetailStates((current) => ({
        ...current,
        [id]: { status: "success", message: "Detalle actualizado." },
      }));
    } catch (error) {
      setDetailStates((current) => ({
        ...current,
        [id]: {
          status: "error",
          message: getErrorMessage(error, "No se pudo cargar el detalle del candidato."),
        },
      }));
    }
  };

  const createCandidate = async (values: CandidateFormValues): Promise<MutationResult> => {
    setCreateState({ status: "loading", message: "Creando candidatura..." });

    const clientId = crypto.randomUUID();
    const appliedAt = new Date().toISOString();
    const payload = {
      id: clientId,
      applied_at: appliedAt,
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      linkedin_url: values.linkedin_url || null,
      cv_url: values.cv_url || null,
      experience_years: values.experience_years,
      status: "received",
      stage: "pending",
    };

    try {
      const response = await fetch(`${API_BASE}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseResponse<Partial<CandidateRecordSummary>>(response);
      const summary = normalizeRecordSummary({
        ...payload,
        ...data,
        id: data?.id ?? clientId,
        applied_at: data?.applied_at ?? appliedAt,
        status: (data?.status as CandidateStatus | undefined) ?? "received",
        stage: (data?.stage as CandidateStage | undefined) ?? "pending",
      });

      setCandidates((current) => [summary, ...current.filter((item) => item.id !== summary.id)]);
      setDetails((current) => ({
        ...current,
        [summary.id]: {
          ...summary,
          notes: [],
        },
      }));
      setCreateState({ status: "success", message: "Candidatura creada correctamente." });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo crear la candidatura.");
      setCreateState({ status: "error", message });
      return { success: false, error: message };
    }
  };

  const updateCandidate = async (id: string, values: CandidateFormValues): Promise<MutationResult> => {
    setUpdateStates((current) => ({
      ...current,
      [id]: { status: "loading", message: "Guardando cambios del perfil..." },
    }));

    const payload = {
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      linkedin_url: values.linkedin_url || null,
      cv_url: values.cv_url || null,
      experience_years: values.experience_years,
    };

    try {
      const response = await fetch(`${API_BASE}/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseResponse<Partial<CandidateRecordSummary>>(response);
      const currentDetail = details[id];
      const summary = normalizeRecordSummary({
        ...currentDetail,
        ...payload,
        ...data,
        id,
        status: (data?.status as CandidateStatus | undefined) ?? currentDetail?.status ?? "received",
        stage: (data?.stage as CandidateStage | undefined) ?? currentDetail?.stage ?? "pending",
        notes_count: data?.notes_count ?? currentDetail?.notes_count ?? 0,
        applied_at: data?.applied_at ?? currentDetail?.applied_at ?? new Date().toISOString(),
      });

      setCandidates((current) => upsertSummary(current, summary));
      setDetails((current) => ({
        ...current,
        [id]: {
          ...summary,
          notes: current[id]?.notes ?? [],
        },
      }));
      setUpdateStates((current) => ({
        ...current,
        [id]: { status: "success", message: "Perfil actualizado correctamente." },
      }));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "No se pudieron guardar los cambios.");
      setUpdateStates((current) => ({
        ...current,
        [id]: { status: "error", message },
      }));
      return { success: false, error: message };
    }
  };

  const patchCandidateStatus = async (id: string, status: CandidateStatus) => {
    setStatusPatchStates((current) => ({
      ...current,
      [id]: { status: "loading", message: "Actualizando estado..." },
    }));

    try {
      const response = await fetch(`${API_BASE}/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await parseResponse<Partial<CandidateRecordSummary>>(response, true);

      applyLocalRecordUpdate(id, {
        status,
        updated_at: data?.updated_at ?? new Date().toISOString(),
      });
      setStatusPatchStates((current) => ({
        ...current,
        [id]: { status: "success", message: "Estado actualizado." },
      }));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo actualizar el estado.");
      setStatusPatchStates((current) => ({
        ...current,
        [id]: { status: "error", message },
      }));
      return { success: false, error: message };
    }
  };

  const patchCandidateStage = async (id: string, stage: CandidateStage) => {
    setStagePatchStates((current) => ({
      ...current,
      [id]: { status: "loading", message: "Actualizando etapa..." },
    }));

    try {
      const response = await fetch(`${API_BASE}/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const data = await parseResponse<Partial<CandidateRecordSummary>>(response, true);

      applyLocalRecordUpdate(id, {
        stage,
        updated_at: data?.updated_at ?? new Date().toISOString(),
      });
      setStagePatchStates((current) => ({
        ...current,
        [id]: { status: "success", message: "Etapa actualizada." },
      }));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo actualizar la etapa.");
      setStagePatchStates((current) => ({
        ...current,
        [id]: { status: "error", message },
      }));
      return { success: false, error: message };
    }
  };

  const addNote = async (id: string, content: string): Promise<MutationResult> => {
    setNoteCreateStates((current) => ({
      ...current,
      [id]: { status: "loading", message: "Guardando nota..." },
    }));

    try {
      const response = await fetch(`${API_BASE}/records/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await parseResponse<Partial<CandidateNote>>(response);
      const note: CandidateNote = {
        id: data?.id ?? crypto.randomUUID(),
        record_id: data?.record_id ?? id,
        content: data?.content ?? content,
        created_at: data?.created_at ?? new Date().toISOString(),
      };

      setDetails((current) => {
        const detail = current[id];
        if (!detail) {
          return current;
        }
        return {
          ...current,
          [id]: {
            ...detail,
            notes: [note, ...detail.notes],
            notes_count: detail.notes_count + 1,
            updated_at: new Date().toISOString(),
          },
        };
      });
      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id === id
            ? {
                ...candidate,
                notes_count: candidate.notes_count + 1,
                updated_at: new Date().toISOString(),
              }
            : candidate,
        ),
      );
      setNoteCreateStates((current) => ({
        ...current,
        [id]: { status: "success", message: "Nota agregada correctamente." },
      }));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo agregar la nota.");
      setNoteCreateStates((current) => ({
        ...current,
        [id]: { status: "error", message },
      }));
      return { success: false, error: message };
    }
  };

  const deleteNote = async (id: string, noteId: string): Promise<MutationResult> => {
    setNoteDeleteStates((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? {}),
        [noteId]: { status: "loading", message: "Eliminando nota..." },
      },
    }));

    try {
      const response = await fetch(`${API_BASE}/records/${id}/notes/${noteId}`, {
        method: "DELETE",
      });
      await parseResponse(response, true);

      setDetails((current) => {
        const detail = current[id];
        if (!detail) {
          return current;
        }
        return {
          ...current,
          [id]: {
            ...detail,
            notes: detail.notes.filter((note) => note.id !== noteId),
            notes_count: Math.max(0, detail.notes_count - 1),
            updated_at: new Date().toISOString(),
          },
        };
      });
      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id === id
            ? {
                ...candidate,
                notes_count: Math.max(0, candidate.notes_count - 1),
                updated_at: new Date().toISOString(),
              }
            : candidate,
        ),
      );
      setNoteDeleteStates((current) => ({
        ...current,
        [id]: {
          ...(current[id] ?? {}),
          [noteId]: { status: "success", message: "Nota eliminada." },
        },
      }));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "No se pudo eliminar la nota.");
      setNoteDeleteStates((current) => ({
        ...current,
        [id]: {
          ...(current[id] ?? {}),
          [noteId]: { status: "error", message },
        },
      }));
      return { success: false, error: message };
    }
  };

  const applyLocalRecordUpdate = (id: string, updates: Partial<CandidateRecordSummary>) => {
    setCandidates((current) =>
      current.map((candidate) => (candidate.id === id ? normalizeRecordSummary({ ...candidate, ...updates }) : candidate)),
    );
    setDetails((current) => {
      const detail = current[id];
      if (!detail) {
        return current;
      }
      return {
        ...current,
        [id]: normalizeRecordDetail({ ...detail, ...updates }, detail.notes),
      };
    });
  };

  const value: CandidateContextValue = {
    candidates,
    listState,
    createState,
    fetchCandidates,
    fetchCandidate,
    createCandidate,
    updateCandidate,
    patchCandidateStatus,
    patchCandidateStage,
    addNote,
    deleteNote,
    getCandidateDetail: (id) => details[id],
    getDetailState: (id) => detailStates[id] ?? { status: "idle" },
    getUpdateState: (id) => updateStates[id] ?? { status: "idle" },
    getStatusPatchState: (id) => statusPatchStates[id] ?? { status: "idle" },
    getStagePatchState: (id) => stagePatchStates[id] ?? { status: "idle" },
    getNoteCreateState: (id) => noteCreateStates[id] ?? { status: "idle" },
    getNoteDeleteState: (id, noteId) => noteDeleteStates[id]?.[noteId] ?? { status: "idle" },
  };

  return <CandidateContext.Provider value={value}>{children}</CandidateContext.Provider>;
}

export function useCandidates() {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error("useCandidates debe usarse dentro de CandidateProvider.");
  }
  return context;
}

async function parseResponse<T>(response: Response): Promise<T>;
async function parseResponse<T>(response: Response, allowEmpty: true): Promise<T | undefined>;
async function parseResponse<T>(response: Response, allowEmpty = false): Promise<T | undefined> {
  if (!response.ok) {
    let message = `La petición falló con código ${response.status}.`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = String(payload.detail);
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (allowEmpty || response.status === 204) {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : undefined;
  }

  return (await response.json()) as T;
}

function normalizeRecordSummary(record: Partial<CandidateRecordSummary>): CandidateRecordSummary {
  return {
    id: record.id ?? crypto.randomUUID(),
    full_name: record.full_name ?? "Sin nombre",
    email: record.email ?? "",
    phone: record.phone ?? "",
    position: record.position ?? "",
    linkedin_url: record.linkedin_url ?? "",
    cv_url: record.cv_url ?? "",
    status: (record.status as CandidateStatus | undefined) ?? "received",
    stage: (record.stage as CandidateStage | undefined) ?? "pending",
    experience_years: Number(record.experience_years ?? 0),
    notes_count: Number(record.notes_count ?? 0),
    applied_at: record.applied_at ?? new Date().toISOString(),
    updated_at: record.updated_at ?? record.applied_at ?? new Date().toISOString(),
  };
}

function normalizeRecordDetail(
  record: Partial<CandidateRecordDetail>,
  notes: CandidateNote[],
): CandidateRecordDetail {
  const summary = normalizeRecordSummary(record);
  return {
    ...summary,
    notes,
    notes_count: Number(record.notes_count ?? notes.length),
  };
}

function upsertSummary(current: CandidateRecordSummary[], summary: CandidateRecordSummary) {
  const exists = current.some((item) => item.id === summary.id);
  if (!exists) {
    return [summary, ...current];
  }
  return current.map((item) => (item.id === summary.id ? summary : item));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}