import crypto from "node:crypto";

/**
 * Minimal RS256 JWT signer for video signed-playback tokens. SERVER ONLY –
 * this imports node:crypto and reads private signing keys; it must never be
 * bundled into a client component.
 *
 * Both Cloudflare Stream and Mux issue RSA signing keys and expect a compact
 * JWS (header.payload.signature) signed with RS256.
 */

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Accepts a PEM string directly, OR a base64-encoded PEM (which is how both
 * Cloudflare and Mux hand out the private key). Returns a usable PEM.
 */
export function normalizePrivateKey(key: string): string {
  const trimmed = key.trim().replace(/\\n/g, "\n");
  if (trimmed.includes("BEGIN")) return trimmed;
  return Buffer.from(trimmed, "base64").toString("utf8");
}

export function signRs256(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKeyPem: string
): string {
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(privateKeyPem));

  return `${signingInput}.${base64url(signature)}`;
}
