import QRcode from "qrcode";

export const generateQrCode = async (jsonData: Object) => {
  const qrCode = await QRcode.toDataURL(JSON.stringify(jsonData), {
    type: "image/png",
  });
  return qrCode;
};
