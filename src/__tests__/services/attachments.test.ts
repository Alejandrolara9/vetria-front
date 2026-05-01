import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  listAttachments,
  uploadAttachment,
  getAttachmentViewUrl,
  reanalyzeAttachment,
  deleteAttachment,
} from "../../services/attachments";

const mock = new MockAdapter(api);
const attachment = {
  id: "att1",
  petId: "p1",
  clinicalNoteId: null,
  filename: "xray.jpg",
  fileType: "IMAGE" as const,
  mimeType: "image/jpeg",
  fileSize: 12345,
  aiAnalysis: null,
  aiModel: null,
  aiAnalyzedAt: null,
  createdAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("listAttachments", () => {
  it("GETs /pets/:petId/attachments", async () => {
    mock.onGet("/pets/p1/attachments").reply(200, [attachment]);
    expect(await listAttachments("p1")).toEqual([attachment]);
  });
});

describe("uploadAttachment", () => {
  it("POSTs to /pets/:petId/attachments without clinicalNoteId", async () => {
    mock.onPost("/pets/p1/attachments").reply(201, attachment);
    const file = new File(["content"], "xray.jpg", { type: "image/jpeg" });
    const result = await uploadAttachment("p1", file);
    expect(result).toEqual(attachment);
    expect(mock.history.post[0].url).toBe("/pets/p1/attachments");
  });

  it("POSTs to /pets/:petId/attachments?clinicalNoteId=... when provided", async () => {
    mock.onPost("/pets/p1/attachments?clinicalNoteId=cn1").reply(201, attachment);
    const file = new File(["content"], "xray.jpg", { type: "image/jpeg" });
    const result = await uploadAttachment("p1", file, "cn1");
    expect(result).toEqual(attachment);
    expect(mock.history.post[0].url).toBe("/pets/p1/attachments?clinicalNoteId=cn1");
  });
});

describe("getAttachmentViewUrl", () => {
  it("GETs /attachments/:id/view and returns url", async () => {
    mock.onGet("/attachments/att1/view").reply(200, { url: "https://s3.example.com/att1.jpg" });
    const url = await getAttachmentViewUrl("att1");
    expect(url).toBe("https://s3.example.com/att1.jpg");
  });
});

describe("reanalyzeAttachment", () => {
  it("POSTs to /attachments/:id/analyze", async () => {
    mock.onPost("/attachments/att1/analyze").reply(200, { ...attachment, aiAnalysis: "No fractures detected" });
    const result = await reanalyzeAttachment("att1");
    expect(result.aiAnalysis).toBe("No fractures detected");
  });
});

describe("deleteAttachment", () => {
  it("DELETEs /attachments/:id", async () => {
    mock.onDelete("/attachments/att1").reply(204);
    await expect(deleteAttachment("att1")).resolves.toBeUndefined();
  });
});
