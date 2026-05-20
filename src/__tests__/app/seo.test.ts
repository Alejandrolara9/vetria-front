import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

describe("robots()", () => {
  it("permite todo el crawling", () => {
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("apunta al sitemap correcto", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://vetria.cloud/sitemap.xml");
  });
});

describe("sitemap()", () => {
  const REQUIRED_URLS = [
    "https://vetria.cloud",
    "https://vetria.cloud/register",
    "https://vetria.cloud/login",
    "https://vetria.cloud/terminos",
    "https://vetria.cloud/privacidad",
  ];

  it("incluye todas las URLs requeridas", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);
    REQUIRED_URLS.forEach((url) => expect(urls).toContain(url));
  });

  it("la URL raíz tiene priority 1", () => {
    const result = sitemap();
    const root = result.find((e) => e.url === "https://vetria.cloud");
    expect(root?.priority).toBe(1);
  });

  it("todas las entradas tienen changeFrequency", () => {
    const result = sitemap();
    result.forEach((entry) => expect(entry.changeFrequency).toBeDefined());
  });
});
