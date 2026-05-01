import { api } from "./api";

export interface Attachment {
  id: string;
  petId: string;
  clinicalNoteId: string | null;
  filename: string;
  fileType: "IMAGE" | "PDF";
  mimeType: string;
  fileSize: number;
  aiAnalysis: string | null;
  aiModel: string | null;
  aiAnalyzedAt: string | null;
  createdAt: string;
  analysisError?: string;
}

export async function listAttachments(petId: string): Promise<Attachment[]> {
  const res = await api.get(`/pets/${petId}/attachments`);
  return res.data;
}

export async function uploadAttachment(
  petId: string,
  file: File,
  clinicalNoteId?: string
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  const url = clinicalNoteId
    ? `/pets/${petId}/attachments?clinicalNoteId=${clinicalNoteId}`
    : `/pets/${petId}/attachments`;
  const res = await api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getAttachmentViewUrl(attachmentId: string): Promise<string> {
  const res = await api.get(`/attachments/${attachmentId}/view`);
  return res.data.url;
}

export async function reanalyzeAttachment(attachmentId: string): Promise<Attachment> {
  const res = await api.post(`/attachments/${attachmentId}/analyze`);
  return res.data;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await api.delete(`/attachments/${attachmentId}`);
}
