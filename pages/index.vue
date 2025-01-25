<template>
  <div class="form-data">
    <form @submit.prevent="send">
      <div class="title">
        <h1>Add your data to the inputs below to get your PDF file</h1>
      </div>
      <div class="inputs">
        <div class="group">
          <div
            class="input"
            v-if="options.find((o) => o.method == 'gmail')?.active"
          >
            <label for="emailInput">Email</label>
            <input
              type="email"
              required
              placeholder="e.g@gmail.com"
              id="emailInput"
              v-model="formData.email"
            />
          </div>
          <div class="input">
            <label for="NameInput">Name</label>
            <input
              type="text"
              placeholder="Jhon doe"
              v-model="formData.name"
              id="NameInput"
            />
          </div>
        </div>
        <div class="group">
          <div class="input">
            <label for="positionInput">position</label>
            <input
              type="text"
              v-model="formData.position"
              placeholder="Frontend"
              id="positionInput"
            />
          </div>
          <div class="input">
            <label for="companyNameInput">company name</label>
            <input
              type="text"
              placeholder="Malamih"
              v-model="formData.companyName"
              id="companyNameInput"
            />
          </div>
        </div>
        <div
          class="grop"
          v-if="options.find((o) => o.method == 'whatsapp').active"
        >
          <div class="input">
            <label for="phone_number">Phone number</label>
            <input
              type="text"
              placeholder="07*********"
              minlength="11"
              v-model="formData.phone_number"
              @input="removeLetters"
              id="phone_number"
            />
          </div>
        </div>
        <div class="imageInput">
          <label for="ImageInput">
            <span>Choose an image</span>
            <img src="" ref="imageViewer" alt="" />
            <input type="file" id="ImageInput" @change="imageChanged" />
          </label>
        </div>
        <div class="postOptions">
          <div
            :class="['option', option.active ? 'active' : '']"
            v-for="option in options"
            :key="option.id"
            @click="setActiveOption(option.id)"
          >
            <Icon :name="option.icon" />
          </div>
        </div>
        <div class="submit">
          <button :class="canSend ? 'active' : ''">
            <span v-if="!loading">Send</span>
            <div class="loading-circle" v-else></div>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
const formData = reactive({
  email: "",
  name: "",
  position: "",
  companyName: "",
  image: "",
  phone_number: "",
});

const loading = ref(false);

const removeLetters = () => {
  formData.phone_number = formData.phone_number.replace(/\D/g, "");
};

const options = ref([
  {
    id: 1,
    icon: "material-symbols:attach-email-outline",
    method: "gmail",
    active: true,
  },
  {
    id: 2,
    icon: "ic:sharp-whatsapp",
    method: "whatsapp",
    active: false,
  },
]);
const imageViewer = ref("");

const imageChanged = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      imageViewer.value.src = event.target.result;
    };
    formData.image = file;
    reader.readAsDataURL(file);
  }
};

const setActiveOption = (id) => {
  return;
  options.value.forEach((op) => {
    op.id == id ? (op.active = true) : (op.active = false);
  });
};

const canSend = computed(() => {
  if (
    (formData.email != "" &&
      formData.name != "" &&
      formData.companyName != "" &&
      formData.position != "" &&
      formData.image != "") ||
    formData.phone_number != ""
  ) {
    return true;
  } else {
    return false;
  }
});

const send = async () => {
  const qrCodeData = {
    name: formData.name,
    companyName: formData.companyName,
    email: formData.email,
    position: formData.position,
  };
  if (canSend) {
    try {
      loading.value = true;
      const data = new FormData();
      const activeOption = options.value.find((o) => o.active);
      if (activeOption.method == "gmail") {
        data.append("email", formData.email);
      } else if (activeOption.method == "whatsapp") {
        data.append("phone_number", formData.phone_number);
      }
      data.append("name", formData.name);
      data.append("position", formData.position);
      data.append("company_name", formData.companyName);
      data.append("image", formData.image);
      data.append("method", "whatsapp");
      console.log(formData);

      const response = await $fetch("/api/user", {
        method: "POST",
        body: data,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped lang="scss">
.form-data {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100dvh;
  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 97%;
    max-width: 700px;
    .inputs {
      padding: 20px;
      background-color: white;
      box-shadow: 0 0 10px 0 rgba(211, 211, 211, 0.712);
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .title {
      text-align: center;
      margin-bottom: 10px;
    }
    .group {
      width: 100%;
      display: flex;
      gap: 12px;
    }
    .input {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      label {
        font-weight: 600;
        text-transform: capitalize;
      }
      input {
        padding: 10px 15px;
        border: 1px solid lightgray;
        border-radius: 5px;
        width: 100%;
      }
    }
    .imageInput {
      width: 100%;
      background-color: white;
      border: 1px solid lightgray;
      border-radius: 5px;
      label {
        padding: 12px 10px;
        width: 100%;
        height: 100%;
        display: inline-block;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        img {
          max-width: 100px;
          max-height: 150px;
          object-fit: cover;
          box-shadow: 0 0 10px 0 rgba(37, 37, 43, 0.582);
        }
      }
      input {
        display: none;
        appearance: none;
      }
    }
    .postOptions {
      display: flex;
      gap: 12px;
      .option {
        padding: 7.5px 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(28, 28, 37, 0.411);
        color: white;
        border-radius: 5px;
        font-size: 25px;
        cursor: pointer;
        user-select: none;
        &.active {
          background-color: rgb(28, 28, 37);
        }
      }
    }
    .submit {
      display: flex;
      justify-content: end;

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      button {
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 6px;
        border: none;
        background-color: rgba(28, 28, 37, 0.418);
        width: 100%;
        max-width: 200px;
        color: white;
        cursor: not-allowed;
        text-transform: capitalize;
        display: flex;
        align-items: center;
        justify-content: center;
        .loading-circle {
          width: 20px; /* حجم الدائرة */
          height: 20px;
          border: 5px solid rgba(155, 155, 155, 0.1); /* حواف شفافة */
          border-top: 5px solid rgb(255, 255, 255); /* لون الجزء العلوي */
          border-radius: 50%; /* لتحويلها إلى دائرة */
          animation: spin 1s linear infinite; /* الحركة الدورانية */
        }
        &.active {
          cursor: pointer;
          background-color: rgb(28, 28, 37);
        }
      }
    }
  }
}
</style>
