<template>
  <div>
    <input type="file" @change="uploadFile" />
  </div>
</template>

<script setup>
const uploadFile = async (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64File = reader.result.split(",")[1]; // استخراج الجزء Base64 من البيانات

    // إرسال الملف إلى API Nuxt
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64File }),
    });

    const data = await response.json();
    if (data.success) {
      console.log("File uploaded successfully:", data.file);
    } else {
      console.error("Upload failed:", data.error);
    }
  };

  reader.readAsDataURL(file); // قراءة الملف وتحويله إلى Base64
};
</script>
