import cloudinary from "@/lib/cloudinary";

export const uploadToCloudinary = async (file: File, folder: string) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<{ url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          },
        );

        uploadStream.end(buffer);
      },
    );
  } catch (error) {
    console.error(error);
    throw new Error("Cloudinary upload failed");
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await Promise.allSettled([
      cloudinary.uploader.destroy(publicId, { resource_type: "image" }),
      cloudinary.uploader.destroy(publicId, { resource_type: "raw" }),
    ]);
  } catch (error) {
    console.error(error);
  }
};
