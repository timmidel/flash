import { supabase } from "../lib/supabaseClient";
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import imageCompression from "browser-image-compression";

type RationaleImage = {
  id?: string;
  document_id: string;
  rationale_index?: number;
  image_url: string;
  created_at?: string;
};

export async function createRationaleImage(
  rationaleImage: Omit<RationaleImage, "id" | "created_at">,
  file: File
) {
  // Upload the image to Supabase storage
  const uploadResult = await uploadRationaleImage(
    file,
    rationaleImage.document_id,
    rationaleImage.rationale_index
  );
  if (!uploadResult.success) {
    throw new Error(uploadResult.error || "Failed to upload rationale image");
  }
  rationaleImage.image_url = uploadResult.url || "";

  // Insert the rationale image metadata into the database
  const { data, error } = await supabase
    .from("rationale_images")
    .insert([rationaleImage])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRationaleImageByDocument(documentId: string) {
  const { data, error } = await supabase
    .from("rationale_images")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

function generateFileName(documentId: string, rationaleIndex?: number): string {
  const timestamp = Date.now();
  return rationaleIndex !== undefined
    ? `${documentId}/rationale-${rationaleIndex}-${timestamp}.png`
    : `${documentId}/rationale-${timestamp}.png`;
}

async function uploadRationaleImage(
  file: File,
  documentId: string,
  rationaleIndex?: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const compressedFile = await compressImage(file);
  const filePath = generateFileName(documentId, rationaleIndex);

  if (compressedFile) {
    const { data, error } = await supabase.storage
      .from("rationale-images")
      .upload(filePath, compressedFile, {
        cacheControl: "3600",
        contentType: file.type,
      });
    console.log("Upload response:", { data, error });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("rationale-images")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } else {
    return { success: false, error: "Image compression failed" };
  }
}
async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1, // target < 1MB
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile; // Use this for upload
  } catch (error) {
    console.error("Compression error:", error);
  }
}

export async function extractImages(
  arrayBuffer: ArrayBuffer,
  rationaleFlag: string
) {
  try {
    const { value: html, messages } = await mammoth.convertToHtml({
      arrayBuffer,
    });

    if (messages && messages.length > 0) {
      console.warn("Mammoth messages:", messages);
    }

    const $ = cheerio.load(html);
    const extractedImages: { file: File; rationaleIndex: number }[] = [];
    let rationaleIndex = 0;

    // Find all p tags that contain the rationale flag
    $("p").each((i, elem) => {
      const pText = $(elem).text().trim();
      if (pText.startsWith(rationaleFlag)) {
        // Look for the next element sibling that is an image
        let nextElem = $(elem).next();
        // Traverse siblings if there are empty paragraphs or other elements
        while (nextElem.length > 0 && !nextElem.is("p > img")) {
          if (nextElem.find("img").length > 0) {
            nextElem = nextElem.find("img");
            break;
          }
          // If we encounter another paragraph with text before an image, stop.
          if (nextElem.is("p") && nextElem.text().trim() !== "") {
            break;
          }
          nextElem = nextElem.next();
        }

        if (nextElem && nextElem.is("img")) {
          const src = nextElem.attr("src");
          if (src && src.startsWith("data:image/")) {
            const fileName = `rationale-${rationaleIndex}`;
            const file = base64ToFile(src, fileName);
            extractedImages.push({ file, rationaleIndex }); // documentId will be set later
          }
        }
        rationaleIndex++;
      }
    });
    return extractedImages || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function base64ToFile(base64Data: string, filename: string): File {
  // Extract MIME type and base64 string
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 data format");
  }

  const mimeType = matches[1];
  const base64String = matches[2];

  // Convert base64 to binary
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create blob and convert to file
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

export async function deleteImageFolder(bucket: string, folderPath: string) {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(folderPath, { limit: 100, offset: 0 });

    if (listError) throw listError;

    if (!files || files.length === 0) {
      console.log("No files found in folder");
      return;
    }

    // Recursively delete nested folders if needed
    const filePaths: string[] = [];

    for (const file of files) {
      if (file.name && file.metadata?.mimetype) {
        // It's a file
        filePaths.push(`${folderPath}/${file.name}`);
      }
    }

    if (filePaths.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(filePaths);

      if (deleteError) throw deleteError;

      console.log(
        `Deleted ${filePaths.length} files from folder "${folderPath}"`
      );
    }
  } catch (err) {
    console.error("Failed to delete folder:", err);
  }
}
