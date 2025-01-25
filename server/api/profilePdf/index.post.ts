import { getUserById } from "~/server/db/user";
import path from "path";
import fs from "fs/promises"; // استخدام fs.promises لتجنب التعامل مع المزامنة بشكل يدوي
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { uploadPdfFile } from "~/server/db/cloudinary";
import { createPdfFile } from "~/server/db/pdfFile";

const fetchImage = async (url: any) => {
  const response = await fetch(url);

  // التحقق من نوع المحتوى (Content-Type)
  const contentType = response.headers.get("Content-Type");
  if (!contentType || !["image/jpeg", "image/png"].includes(contentType)) {
    throw createError({
      statusCode: 400,
      message: "Only PNG, JPG, or JPEG images are allowed.",
    });
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const getContentType = (url: any) => {
  // تقسيم الرابط للحصول على الامتداد
  const extension = url.split(".").pop().toLowerCase();

  // مطابقة الامتداد مع نوع المحتوى
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "jpeg";
    case "png":
      return "png";
    case "gif":
      return "gif";
    default:
      return "unknown";
  }
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { user_id } = body;

    if (!user_id) {
      return sendError(
        event,
        createError({ statusCode: 401, statusMessage: "Invalid params!" })
      );
    }

    const user = await getUserById(user_id);
    if (!user) {
      return sendError(
        event,
        createError({ statusCode: 404, statusMessage: "User not found!" })
      );
    }

    // تحقق من وجود ملف PDF الأصلي
    const originFilePath = path.resolve("public/shahad.pdf");

    try {
      await fs.access(originFilePath);
    } catch {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "Original PDF file not found!",
        })
      );
    }

    // قراءة الملف الأصلي
    const existingPdfBytes = await fs.readFile(originFilePath);
    const imageBytes = await fetchImage(user.image);
    const qrCodeBytes = await fetchImage(user.qr_code);

    // تعديل ملف PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const contentType = getContentType(user.image);

    const embeddedImage =
      contentType === "png"
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);
    const embeddedQrCode = await pdfDoc.embedPng(qrCodeBytes);

    firstPage.drawImage(embeddedQrCode, {
      x: 220,
      y: 484,
      width: 60,
      height: 60,
    });
    firstPage.drawImage(embeddedImage, {
      x: 202,
      y: 667,
      width: 84,
      height: 85,
    });

    const fontSize = 15;
    firstPage.drawText(user.name, {
      x: 19, // تعديل الموقع ليكون النص في المنتصف
      y: 637, // يمكنك ضبط الإحداثيات حسب الحاجة
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(user.position, {
      x: 19, // تعديل الموقع ليكون النص في المنتصف
      y: 576, // يمكنك ضبط الإحداثيات حسب الحاجة
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(user.company_name, {
      x: 19, // تعديل الموقع ليكون النص في المنتصف
      y: 517, // يمكنك ضبط الإحداثيات حسب الحاجة
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();

    // إنشاء مسار مؤقت للملف المعدل
    const modifiedPdfPath = path.resolve(`public/modified-${user_id}.pdf`);
    await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);

    // رفع الملف إلى Cloudinary
    const response = await uploadPdfFile(modifiedPdfPath, "pdf_files");

    // حذف الملف المؤقت
    await fs.unlink(modifiedPdfPath);

    // حفظ البيانات في قاعدة البيانات
    const data = {
      url: response.secure_url,
      public_id: response.public_id,
      userId: user_id,
    };

    const savedFile = await createPdfFile(data);

    // إعادة النتيجة النهائية
    return { message: "File successfully modified and uploaded!", savedFile };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to modify, upload, or save file! ${error}`,
    });
  }
});
