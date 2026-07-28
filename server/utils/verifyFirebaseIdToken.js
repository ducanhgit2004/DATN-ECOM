import crypto from "crypto";

const CERT_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let cachedCertificates = null;
let certificatesExpireAt = 0;

const decodePart = (part) => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

const getCertificates = async () => {
  if (cachedCertificates && Date.now() < certificatesExpireAt) return cachedCertificates;
  const response = await fetch(CERT_URL);
  if (!response.ok) throw new Error("Unable to retrieve Firebase signing certificates.");
  cachedCertificates = await response.json();
  const maxAge = Number(response.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1] || 3600);
  certificatesExpireAt = Date.now() + maxAge * 1000;
  return cachedCertificates;
};

export default async function verifyFirebaseIdToken(idToken) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "ecommerce-5c285";
  if (!idToken || typeof idToken !== "string") throw new Error("Firebase ID token is required.");
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid Firebase ID token.");

  const header = decodePart(parts[0]);
  const payload = decodePart(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Invalid Firebase token header.");
  const certificates = await getCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) throw new Error("Firebase signing certificate was not found.");
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  if (!verifier.verify(certificate, Buffer.from(parts[2], "base64url"))) throw new Error("Invalid Firebase token signature.");

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}` || !payload.sub || payload.exp <= now || payload.iat > now + 60) throw new Error("Firebase ID token is expired or was issued for another project.");
  return payload;
}
