import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadQRCode(base64Data: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: "subscription-qr-codes",
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "limit" },
      { quality: "auto" },
    ],
  });
  return result.secure_url;
}

export async function deleteQRCode(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${lastPart.split(".")[0]}`;
  return publicId;
}

export default cloudinary;
