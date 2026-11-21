import { useState } from "react";

let cached: boolean | undefined;

/**
 * Probes for WebGL once per page load. The probe context is released straight
 * away so it doesn't count against the browser's limit on live contexts —
 * the 3D scenes create their own.
 */
function detectWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    cached = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

/**
 * Reports whether the browser can render WebGL.
 *
 * Decided synchronously on the first render (client-only app, no server
 * render). It used to default to `true` and correct itself in an effect, so
 * on a device without WebGL the first render still started loading the
 * three.js chunk and tried to create a 3D scene before falling back.
 */
export function useWebGLSupport(): boolean {
  const [supported] = useState(detectWebGL);
  return supported;
}
