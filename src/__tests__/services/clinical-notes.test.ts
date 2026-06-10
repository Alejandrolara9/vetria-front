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
  listArchivedClinicalNotes,
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

  it("incluye suggestion en la respuesta cuando el backend la devuelve", async () => {
    const mockSuggestion = { daysFromNow: 7, reason: "Control a los 7 días" };
    mock
      .onPatch("/clinical-notes/n1/review")
      .reply(200, { ...note, status: "APPROVED", suggestion: mockSuggestion });
    const result = await reviewClinicalNote("n1", { status: "APPROVED" });
    expect(result.suggestion).toEqual(mockSuggestion);
    expect(result.status).toBe("APPROVED");
  });

  it("suggestion es undefined cuando el backend no la incluye", async () => {
    mock.onPatch("/clinical-notes/n1/review").reply(200, { ...note, status: "REJECTED" });
    const result = await reviewClinicalNote("n1", { status: "REJECTED", vetFeedback: "rehacer" });
    expect(result.suggestion).toBeUndefined();
  });
});

const paginated = { data: [note], total: 1, page: 1, totalPages: 1 };

describe("listClinicalNotes", () => {
  it("GETs /clinical-notes con paginación y devuelve PaginatedResponse", async () => {
    mock.onGet("/clinical-notes").reply(200, paginated);
    const res = await listClinicalNotes(1, 20, "");
    expect(res).toEqual(paginated);
  });

  it("envía page, limit, search y status como query params", async () => {
    mock.onGet("/clinical-notes").reply(200, paginated);
    await listClinicalNotes(2, 10, "tobby", undefined, "APPROVED");
    const params = mock.history.get[0].params;
    expect(params).toEqual({ page: 2, limit: 10, search: "tobby", status: "APPROVED" });
  });

  it("omite search y status cuando están vacíos o ALL", async () => {
    mock.onGet("/clinical-notes").reply(200, paginated);
    await listClinicalNotes(1, 20, "", undefined, "ALL");
    const params = mock.history.get[0].params;
    expect(params.search).toBeUndefined();
    expect(params.status).toBeUndefined();
  });
});

describe("listArchivedClinicalNotes", () => {
  it("GETs /clinical-notes/archived con paginación", async () => {
    mock.onGet("/clinical-notes/archived").reply(200, paginated);
    const res = await listArchivedClinicalNotes(1, 20, "");
    expect(res).toEqual(paginated);
  });

  it("envía los query params a /archived", async () => {
    mock.onGet("/clinical-notes/archived").reply(200, paginated);
    await listArchivedClinicalNotes(3, 15, "rex", undefined, "REJECTED");
    const params = mock.history.get[0].params;
    expect(params).toEqual({ page: 3, limit: 15, search: "rex", status: "REJECTED" });
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
    expect(onComplete).toHaveBeenCalledWith(completedNote, "fallback");
    expect(onError).not.toHaveBeenCalled();
  });

  it("passes source='ai' when the SSE event includes source", async () => {
    const completedNote = { ...note, status: "APPROVED" as const };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: makeBody([
        `data: {"type":"complete","note":${JSON.stringify(completedNote)},"source":"ai"}\n\n`,
      ]),
    });

    const onComplete = jest.fn();
    await streamClinicalNote("n1", { onToken: jest.fn(), onComplete, onError: jest.fn() });

    expect(onComplete).toHaveBeenCalledWith(completedNote, "ai");
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

  it("sends credentials: include and no Authorization header", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: makeBody([]),
    });

    await streamClinicalNote("n1", { onToken: jest.fn(), onComplete: jest.fn(), onError: jest.fn() });

    const [, fetchOptions] = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchOptions.credentials).toBe("include");
    expect(fetchOptions.headers?.Authorization).toBeUndefined();
  });
});
