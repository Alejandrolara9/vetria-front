import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  createClinicalNote,
  generateClinicalNote,
  reviewClinicalNote,
  listClinicalNotes,
  getClinicalNotesByPet,
  getClinicalNoteById,
  deleteClinicalNote,
  streamClinicalNote,
} from "../../services/clinical-notes";

const mock = new MockAdapter(api);
const note = {
  id: "n1",
  petId: "p1",
  status: "DRAFT" as const,
  rawInput: "Perro con tos y fiebre",
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});
afterAll(() => mock.restore());

describe("createClinicalNote", () => {
  it("POSTs to /clinical-notes", async () => {
    mock.onPost("/clinical-notes").reply(201, note);
    const result = await createClinicalNote({ petId: "p1", rawInput: "Perro con tos y fiebre" });
    expect(result).toEqual(note);
  });
});

describe("generateClinicalNote", () => {
  it("POSTs to /clinical-notes/:id/generate", async () => {
    mock.onPost("/clinical-notes/n1/generate").reply(200, { ...note, status: "GENERATING" });
    const result = await generateClinicalNote("n1");
    expect(result.status).toBe("GENERATING");
  });
});

describe("reviewClinicalNote", () => {
  it("PATCHes /clinical-notes/:id/review with APPROVED status", async () => {
    mock.onPatch("/clinical-notes/n1/review").reply(200, { ...note, status: "APPROVED" });
    const result = await reviewClinicalNote("n1", { status: "APPROVED" });
    expect(result.status).toBe("APPROVED");
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ status: "APPROVED" });
  });
});

describe("listClinicalNotes", () => {
  it("GETs /clinical-notes", async () => {
    mock.onGet("/clinical-notes").reply(200, [note]);
    expect(await listClinicalNotes()).toEqual([note]);
  });
});

describe("getClinicalNotesByPet", () => {
  it("GETs /clinical-notes/pet/:petId", async () => {
    mock.onGet("/clinical-notes/pet/p1").reply(200, [note]);
    expect(await getClinicalNotesByPet("p1")).toEqual([note]);
  });
});

describe("getClinicalNoteById", () => {
  it("GETs /clinical-notes/:id", async () => {
    mock.onGet("/clinical-notes/n1").reply(200, note);
    expect(await getClinicalNoteById("n1")).toEqual(note);
  });
});

describe("deleteClinicalNote", () => {
  it("DELETEs /clinical-notes/:id", async () => {
    mock.onDelete("/clinical-notes/n1").reply(204);
    await expect(deleteClinicalNote("n1")).resolves.toBeUndefined();
  });
});

describe("streamClinicalNote", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function makeBody(lines: string[]) {
    let index = 0;
    return {
      getReader() {
        return {
          async read(): Promise<{ done: boolean; value: Buffer | undefined }> {
            if (index < lines.length) {
              return { done: false, value: Buffer.from(lines[index++]) };
            }
            return { done: true, value: undefined };
          },
        };
      },
    };
  }

  it("calls onToken and onComplete for valid SSE events", async () => {
    const completedNote = { ...note, status: "APPROVED" as const };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: makeBody([
        `data: {"type":"token","text":"Hello "}\n\n`,
        `data: {"type":"complete","note":${JSON.stringify(completedNote)}}\n\n`,
      ]),
    });

    const onToken = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();

    await streamClinicalNote("n1", { onToken, onComplete, onError });

    expect(onToken).toHaveBeenCalledWith("Hello ");
    expect(onComplete).toHaveBeenCalledWith(completedNote);
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError for error SSE event", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: makeBody([`data: {"type":"error","message":"AI service unavailable"}\n\n`]),
    });

    const onError = jest.fn();
    await streamClinicalNote("n1", { onToken: jest.fn(), onComplete: jest.fn(), onError });
    expect(onError).toHaveBeenCalledWith("AI service unavailable");
  });

  it("calls onError when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, body: null });

    const onError = jest.fn();
    await streamClinicalNote("n1", { onToken: jest.fn(), onComplete: jest.fn(), onError });
    expect(onError).toHaveBeenCalledWith("Error al conectar con el servidor de IA");
  });

  it("sends Authorization header with token from localStorage", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: makeBody([]),
    });

    await streamClinicalNote("n1", { onToken: jest.fn(), onComplete: jest.fn(), onError: jest.fn() });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/clinical-notes/n1/stream"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });
});
