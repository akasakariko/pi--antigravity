import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertSafeAspectRatio,
  assertSafeImageModel,
  buildImageGenerateRequest,
  collectImagesFromSse,
  parseImageCommandArgs,
  resolveImageSavePath,
} from "../src/image/index.js";

function fail(message: string): never {
  throw new Error(message);
}

function assert(condition: unknown, message: string): void {
  if (!condition) fail(`FAILED: ${message}`);
}

function sse(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n`;
}

function responseFromChunks(chunks: string[]): Response {
  const encoder = new TextEncoder();
  let i = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[i]!));
      i += 1;
    },
  });
  return new Response(body);
}

async function main() {
  const parsed = parseImageCommandArgs("--ratio 16:9 --model gemini-3-pro-image a sunset over mountains");
  assert(parsed.prompt === "a sunset over mountains", "prompt parsed");
  assert(parsed.aspectRatio === "16:9", "ratio parsed");
  assert(parsed.model === "gemini-3-pro-image", "model parsed");

  const withPath = parseImageCommandArgs("--path out/cat.png --ratio 1:1 a cat");
  assert(withPath.path === "out/cat.png", "path parsed");
  assert(withPath.prompt === "a cat", "prompt after flags");

  assert(parseImageCommandArgs("").prompt === "", "empty args");
  assert(assertSafeImageModel("gemini-3-pro-image") === "gemini-3-pro-image", "allow gemini image model");
  assert(assertSafeImageModel("gemini-3.1-flash-image") === "gemini-3.1-flash-image", "allow gemini 3.1 flash image");
  assert(assertSafeImageModel("imagen-3.0-generate-002") === "imagen-3.0-generate-002", "allow imagen");
  try {
    assertSafeImageModel("claude-opus-4-6");
    fail("expected unsafe model to throw");
  } catch (error) {
    assert(error instanceof Error && /Unsupported image model/.test(error.message), "reject chat model");
  }
  try {
    assertSafeImageModel("https://evil.example/x");
    fail("expected url model to throw");
  } catch {
    // expected
  }

  assert(assertSafeAspectRatio("16:9") === "16:9", "allow 16:9");
  try {
    assertSafeAspectRatio("99:1");
    fail("expected bad ratio to throw");
  } catch (error) {
    assert(error instanceof Error && /Unsupported aspect ratio/.test(error.message), "reject ratio");
  }

  const req = buildImageGenerateRequest("a lighthouse", "gemini-3-pro-image", "proj-1", "16:9");
  assert(req.model === "gemini-3-pro-image", "request model");
  assert(req.project === "proj-1", "request project");
  assert(req.request.generationConfig.imageConfig.aspectRatio === "16:9", "aspect ratio");
  assert(req.request.contents[0]?.parts[0]?.text === "a lighthouse", "prompt text");
  assert(/^agent\//.test(req.requestId), "agent request id");

  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString("base64");
  const body =
    sse({ response: { candidates: [{ content: { parts: [{ text: "ok" }] } }] } }) +
    sse({
      response: {
        candidates: [{ content: { parts: [{ inlineData: { mimeType: "image/png", data: png } }] } }],
      },
    }) +
    "data: [DONE]\n";
  const parsedSse = await collectImagesFromSse(responseFromChunks([body.slice(0, 40), body.slice(40)]));
  assert(parsedSse.images.length === 1, "one image");
  assert(parsedSse.images[0]?.mimeType === "image/png", "png mime");
  assert(parsedSse.images[0]?.data === png, "png data");
  assert(parsedSse.text.join("") === "ok", "sse text");

  const tmp = await mkdtemp(join(tmpdir(), "pi-antigravity-image-"));
  try {
    const saved = resolveImageSavePath(tmp, "out/cat.png");
    assert(saved === join(tmp, "out/cat.png"), `save path ${saved}`);
    const dirSaved = resolveImageSavePath(tmp, "images", "image/jpeg", 0);
    assert(dirSaved.endsWith("-1.jpg"), `dir save ${dirSaved}`);
    assert(dirSaved.startsWith(join(tmp, "images")), "dir stays in cwd");
    try {
      resolveImageSavePath(tmp, "../escape.png");
      fail("expected path traversal to throw");
    } catch (error) {
      assert(
        error instanceof Error && /inside the working directory/.test(error.message),
        "reject traversal",
      );
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  console.log("image gen: command parsing, model/path guards, request shape, and SSE parse passed");
}

void main();
