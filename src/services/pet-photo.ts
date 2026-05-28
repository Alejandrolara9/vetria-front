const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function validateFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Solo se permiten JPG, PNG o WEBP");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La foto no puede superar 5 MB");
  }
}

async function uploadPhoto(url: string, file: File): Promise<string> {
  validateFile(file);
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(url, { method: "PATCH", body: form, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? "Error al subir la foto");
  }
  const data = await res.json() as { photoUrl: string };
  return data.photoUrl;
}

export function uploadPetPhotoVet(petId: string, file: File): Promise<string> {
  return uploadPhoto(`${process.env.NEXT_PUBLIC_API_URL}/pets/${petId}/photo`, file);
}

export function uploadPetPhotoOwner(petId: string, file: File): Promise<string> {
  return uploadPhoto(`${process.env.NEXT_PUBLIC_API_URL}/portal/owner/pets/${petId}/photo`, file);
}
