import formidable from "formidable";
import {
  uploadStreamCloudinary,
  uploadToCloudinary,
} from "~/server/db/cloudinary";
import { generateQrCode } from "~/server/db/qrCode";
import { createUser } from "~/server/db/user";

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  const email = form
    ?.find((field) => field.name == "email")
    ?.data.toString("utf-8");
  const phone_number = form
    ?.find((field) => field.name == "phone_number")
    ?.data.toString("utf-8");
  const name = form
    ?.find((field) => field.name == "name")
    ?.data.toString("utf-8");
  const position = form
    ?.find((field) => field.name == "position")
    ?.data.toString("utf-8");
  const company_name = form
    ?.find((field) => field.name == "company_name")
    ?.data.toString("utf-8");
  const method = form
    ?.find((field) => field.name == "method")
    ?.data.toString("utf-8");
  const image = form?.find((field) => field.name == "image");

  if (
    (!email && !phone_number) ||
    !name ||
    !position ||
    !company_name ||
    !method ||
    !image
  ) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Invalid params!" })
    );
  }

  const { public_id, secure_url } = <any>(
    await uploadStreamCloudinary(image.data, "profile_images")
  );

  const jsonData = {
    email,
    name,
    position,
    company_name,
  };
  const qrCodeDataURL = await generateQrCode(jsonData);
  const response = await (<any>(
    await uploadToCloudinary(qrCodeDataURL, "qr_codes")
  ));

  const data = {
    email,
    name,
    position,
    company_name,
    image: secure_url,
    image_public_id: public_id,
    qr_code: response.secure_url,
    qr_code_public_id: response.public_id,
  };
  const user = await createUser(data);

  const pdfResponse = await $fetch("/api/profilePdf", {
    method: "POST",
    body: {
      user_id: user.id,
    },
  });

  const pdfSenderResponse = await $fetch("/api/sendPdf", {
    method: "POST",
    body: {
      user_id: user.id,
    },
  });

  return {
    message: "User created successfully!",
    user: user,
    ok: true,
    pdf_response: pdfResponse,
    email_sender_response: pdfSenderResponse,
  };
});
