import { api } from "./api";

export interface BrandingConfig {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  defaultSignatureUrl: string | null;
  watermarkUrl: string | null;
  watermarkOpacity: number;
  watermarkEnabled: boolean;
  clinicPhone: string | null;
  clinicAddress: string | null;
  clinicCity: string | null;
}

export interface UpdateBrandingDto {
  primaryColor?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicCity?: string;
  watermarkOpacity?: number;
  watermarkEnabled?: boolean;
}

export async function getBranding(): Promise<BrandingConfig> {
  const res = await api.get<BrandingConfig>("/tenants/me/branding");
  return res.data;
}

export async function updateBranding(data: UpdateBrandingDto): Promise<BrandingConfig> {
  const res = await api.patch<BrandingConfig>("/tenants/me/branding", data);
  return res.data;
}

export async function uploadBrandingAsset(
  asset: "logo" | "signature" | "watermark",
  file: File
): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ key: string }>(`/tenants/me/branding/${asset}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
