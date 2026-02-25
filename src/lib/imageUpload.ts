// Simple image upload utility for Cloudinary
// Replace CLOUDINARY_UPLOAD_PRESET and CLOUDINARY_CLOUD_NAME with your values

export async function uploadImageToCloudinary(fileOrBase64: File | string): Promise<string> {
  const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset';
  const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', fileOrBase64);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Image upload failed');
  const data = await response.json();
  return data.secure_url;
}
