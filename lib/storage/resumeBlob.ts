import "server-only";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 is the storage backend for uploaded PDF resumes (see
// UploadedResume in prisma/schema.prisma) — R2 is S3-compatible, so this
// talks to it with the standard @aws-sdk/client-s3 client (no Cloudflare-
// specific SDK) pointed at R2's S3 API endpoint. The bucket is public (a
// r2.dev subdomain or custom domain via R2_PUBLIC_URL) so the stored
// `fileUrl` is a plain, directly-fetchable URL — the send/extraction code
// paths just `fetch(fileUrl)` server-side, same as they would for any
// other public file host.
function getClient(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 storage is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketAndPublicUrl(): { bucket: string; publicUrl: string } {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) {
    throw new Error("R2 storage is not configured — set R2_BUCKET_NAME, R2_PUBLIC_URL.");
  }
  return { bucket, publicUrl: publicUrl.replace(/\/+$/, "") };
}

export async function uploadResumeBlob(
  userId: string,
  fileName: string,
  buffer: Buffer,
): Promise<{ url: string }> {
  const { bucket, publicUrl } = getBucketAndPublicUrl();

  // Namespaced by userId with a random prefix so two users' "Resume.pdf"
  // never collide and a re-upload of the same filename doesn't overwrite
  // the last one (S3 PutObject has no built-in random-suffix option the
  // way Vercel Blob's `put()` did).
  const key = `resumes/${userId}/${randomUUID()}-${fileName}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
    }),
  );

  return { url: `${publicUrl}/${key}` };
}

export async function deleteResumeBlob(url: string): Promise<void> {
  const { bucket, publicUrl } = getBucketAndPublicUrl();

  const prefix = `${publicUrl}/`;
  if (!url.startsWith(prefix)) {
    throw new Error(`Uploaded resume URL doesn't match the configured R2 public URL: ${url}`);
  }
  const key = url.slice(prefix.length);

  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
