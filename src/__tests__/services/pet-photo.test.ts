import { uploadPetPhotoVet, uploadPetPhotoOwner } from "../../services/pet-photo";

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const makeFile = (name = "photo.jpg", type = "image/jpeg", sizeBytes = 100) => {
  return new File([new ArrayBuffer(sizeBytes)], name, { type });
};

describe("uploadPetPhotoVet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects files larger than 5MB before fetching", async () => {
    const bigFile = makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024);
    await expect(uploadPetPhotoVet("pet-1", bigFile)).rejects.toThrow("La foto no puede superar 5 MB");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects unsupported file types before fetching", async () => {
    const gifFile = makeFile("anim.gif", "image/gif", 100);
    await expect(uploadPetPhotoVet("pet-1", gifFile)).rejects.toThrow("Solo se permiten JPG, PNG o WEBP");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls PATCH /pets/:petId/photo and returns photoUrl", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photoUrl: "https://s3.example.com/presigned" }),
    } as Response);
    const file = makeFile("photo.jpg", "image/jpeg", 100);
    const url = await uploadPetPhotoVet("pet-1", file);
    expect(url).toBe("https://s3.example.com/presigned");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/pets/pet-1/photo"),
      expect.objectContaining({ method: "PATCH" })
    );
  });
});

describe("uploadPetPhotoOwner", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls PATCH /portal/owner/pets/:petId/photo and returns photoUrl", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photoUrl: "https://s3.example.com/owner-presigned" }),
    } as Response);
    const file = makeFile("photo.png", "image/png", 100);
    const url = await uploadPetPhotoOwner("pet-2", file);
    expect(url).toBe("https://s3.example.com/owner-presigned");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/portal/owner/pets/pet-2/photo"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("throws server error message when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "No tienes permiso para cambiar esta foto" }),
    } as Response);
    const file = makeFile("photo.png", "image/png", 100);
    await expect(uploadPetPhotoOwner("pet-2", file)).rejects.toThrow(
      "No tienes permiso para cambiar esta foto"
    );
  });
});
