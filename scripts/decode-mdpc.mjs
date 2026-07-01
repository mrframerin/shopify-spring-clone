// Build-time decoder for the hero point cloud.
//
// The original site ships the forest as a custom ".mdpc" (mdpc-ycbcr-v1) binary:
// a 4-byte little-endian header length, a JSON meta block, then four brotli-
// compressed payloads — positions (varint-delta-encoded Morton codes, dequantized
// against the bbox) and YCbCr color (luma Y + chroma-subsampled Cb/Cr, converted to
// RGB with the BT.601 matrix). We decode it here (Node has native brotli) and emit a
// compact runtime binary: [uint32 count][float32 positions*3][uint8 colors*3], with
// positions renormalized to a unit-ish cube exactly like the runtime does
// (center on the cloud, scale so the longest axis spans 2*radius, radius = 2.5).
//
// This mirrors the original decode 1:1 but moves the expensive brotli/varint work to
// build time, so the browser just fetches typed arrays. Run: node scripts/decode-mdpc.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { brotliDecompressSync, inflateSync, inflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCENE = join(HERE, "..", "public", "scene");
// The exact geometry bounding box the original engine renders (read live from the
// running bundle via a WebGL probe): a wide, short, medium-depth forest slab.
const ENGINE_MIN = [-2.5, -0.9476, -1.5258];
const ENGINE_MAX = [2.5, 0.9476, 1.7227];

/** Parse the header + slice the four compressed blocks. */
function parse(buf) {
  const headerLen = new DataView(buf.buffer, buf.byteOffset, 4).getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(buf.subarray(4, 4 + headerLen)));
  if (!meta.format?.startsWith("mdpc-")) throw new Error(`Unsupported format: ${meta.format}`);
  let r = 4 + headerLen;
  const take = (len) => {
    const b = buf.subarray(r, r + len);
    r += len;
    return b;
  };
  return {
    meta,
    pos: take(meta.posLen),
    y: take(meta.yLen),
    cb: take(meta.cbLen),
    cr: take(meta.crLen),
  };
}

// Blocks are compressed with the header's codec: "deflate" (mdpc-2) or brotli (default,
// mdpc-ycbcr-v1). DecompressionStream("deflate") expects zlib-wrapped data; fall back to
// raw deflate just in case.
function inflate(block, codec) {
  if (codec === "deflate") {
    try {
      return new Uint8Array(inflateSync(block));
    } catch {
      return new Uint8Array(inflateRawSync(block));
    }
  }
  return new Uint8Array(brotliDecompressSync(block));
}

/** Positions: LEB128 varint deltas accumulate into a Morton code that de-interleaves
 *  into per-axis quantized indices, then dequantized against the bbox. (fn `q`) */
function decodePositions(bytes, meta) {
  const [minX, minY, minZ, maxX, maxY, maxZ] = meta.bbox;
  const f = (1 << meta.qpPos) - 1;
  const dx = (maxX - minX) / f;
  const dy = (maxY - minY) / f;
  const dz = (maxZ - minZ) / f;
  const out = new Float32Array(meta.N * 3);
  let acc = 0n;
  let e = 0;
  for (let b = 0; b < meta.N; b++) {
    let v = 0n;
    let shift = 0n;
    for (;;) {
      const a = bytes[e++] ?? 0;
      v |= BigInt(a & 127) << shift;
      if (!(a & 128)) break;
      shift += 7n;
    }
    acc += v;
    let sx = 0;
    let sy = 0;
    let sz = 0;
    for (let a = 0; a < meta.qpPos; a++) {
      if ((acc >> BigInt(a * 3)) & 1n) sx |= 1 << a;
      if ((acc >> BigInt(a * 3 + 1)) & 1n) sy |= 1 << a;
      if ((acc >> BigInt(a * 3 + 2)) & 1n) sz |= 1 << a;
    }
    out[b * 3] = minX + sx * dx;
    out[b * 3 + 1] = minY + sy * dy;
    out[b * 3 + 2] = minZ + sz * dz;
  }
  return out;
}

/** Color: YCbCr → RGB (BT.601), chroma subsampled by meta.chromaSub. (fn `D`) */
function decodeColors(y, cb, cr, meta) {
  const out = new Uint8Array(meta.N * 3);
  const clamp = (e) => (e < 0 ? 0 : e > 255 ? 255 : e);
  for (let s = 0; s < meta.N; s++) {
    const c = y[s] ?? 0;
    const i = (cb[Math.min(cb.length - 1, Math.floor(s / meta.chromaSub))] ?? 128) - 128;
    const f = (cr[Math.min(cr.length - 1, Math.floor(s / meta.chromaSub))] ?? 128) - 128;
    out[s * 3] = clamp(Math.round(c + 1.402 * f));
    out[s * 3 + 1] = clamp(Math.round(c - 0.344136 * i - 0.714136 * f));
    out[s * 3 + 2] = clamp(Math.round(c + 1.772 * i));
  }
  return out;
}

/** Renormalize positions into the render-space box. mdpc-2 ships the exact target box as
 *  `fitBounds`; older clouds fall back to the engine's measured box. Either way the
 *  decoded bbox is mapped per-axis onto that target. */
function renormalize(positions, count, meta) {
  const bMin = [meta.bbox[0], meta.bbox[1], meta.bbox[2]];
  const bMax = [meta.bbox[3], meta.bbox[4], meta.bbox[5]];
  const fit = meta.fitBounds;
  const tMin = fit ? [fit[0], fit[1], fit[2]] : ENGINE_MIN;
  const tMax = fit ? [fit[3], fit[4], fit[5]] : ENGINE_MAX;
  for (let i = 0; i < count; i++) {
    for (let a = 0; a < 3; a++) {
      const t = (positions[i * 3 + a] - bMin[a]) / (bMax[a] - bMin[a] || 1);
      positions[i * 3 + a] = tMin[a] + t * (tMax[a] - tMin[a]);
    }
  }
  return { target: [tMin, tMax] };
}

function build(srcName, outName) {
  const buf = readFileSync(join(SCENE, `${srcName}.mdpc`));
  const { meta, pos, y, cb, cr } = parse(new Uint8Array(buf));
  const codec = meta.codec;
  const positions = decodePositions(inflate(pos, codec), meta);
  const colors = decodeColors(inflate(y, codec), inflate(cb, codec), inflate(cr, codec), meta);
  const info = renormalize(positions, meta.N, meta);

  // Emit [uint32 count][float32 positions*3][uint8 colors*3].
  const out = Buffer.alloc(4 + positions.byteLength + colors.byteLength);
  out.writeUInt32LE(meta.N, 0);
  Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength).copy(out, 4);
  Buffer.from(colors.buffer, colors.byteOffset, colors.byteLength).copy(out, 4 + positions.byteLength);
  const outPath = join(SCENE, `${outName}.f32`);
  writeFileSync(outPath, out);

  // Validation stats.
  let r = 0, g = 0, bl = 0;
  const sample = Math.min(meta.N, 20000);
  for (let i = 0; i < sample; i++) {
    r += colors[i * 3]; g += colors[i * 3 + 1]; bl += colors[i * 3 + 2];
  }
  console.log(`[${outName}] ${meta.format} N=${meta.N} qpPos=${meta.qpPos} chromaSub=${meta.chromaSub} codec=${meta.codec}`);
  console.log(`  fit target min=[${info.target[0].map((v) => v.toFixed(2)).join(", ")}] max=[${info.target[1].map((v) => v.toFixed(2)).join(", ")}]`);
  console.log(`  mean color rgb=(${(r / sample).toFixed(0)}, ${(g / sample).toFixed(0)}, ${(bl / sample).toFixed(0)})`);
  console.log(`  wrote ${outPath} (${(out.byteLength / 1e6).toFixed(2)} MB)`);
}

// Hero cloud → runtime binary. cloud-512 (mdpc-ycbcr-v1) normalizes to the measured
// engine box and frames correctly with the captured camera; the live "moretrees" cloud
// (mdpc-2, with its own fitBounds/camera) is available as forest-moretrees-512.
build("cloud-512", "cloud-512");
