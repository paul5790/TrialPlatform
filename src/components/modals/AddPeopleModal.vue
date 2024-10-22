<template>
  <a-modal :open="open" title="새 인원정보 등록" @ok="handleOk" @cancel="handleCancel">
    <a-form layout="vertical">
      <!-- Personnel Idx -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Personnel Idx:</label>
        <a-input
          v-model:value="formState.personnel_idx"
          placeholder="Enter Personnel Idx"
          class="form-input"
        />
      </div>

      <!-- Name -->
      <div class="form-item">
        <label class="form-label">Name:</label>
        <a-input
          v-model:value="formState.name"
          placeholder="Enter Name"
          class="form-input"
        />
      </div>

      <!-- Company -->
      <div class="form-item">
        <label class="form-label">Company:</label>
        <a-input
          v-model:value="formState.company"
          placeholder="Enter Company"
          class="form-input"
        />
      </div>

      <!-- Department -->
      <div class="form-item">
        <label class="form-label">Department:</label>
        <a-input
          v-model:value="formState.department"
          placeholder="Enter Department"
          class="form-input"
        />
      </div>

      <!-- Role -->
      <div class="form-item">
        <label class="form-label">Role:</label>
        <a-select
          v-model:value="formState.role"
          placeholder="Select Role"
          class="form-input"
        >
          <a-select-option value="Shipyard">Shipyard</a-select-option>
          <a-select-option value="Owner">Owner</a-select-option>
          <a-select-option value="Service Engineer">Service Engineer</a-select-option>
          <a-select-option value="Captain">Captain</a-select-option>
          <a-select-option value="Helmsmen">Helmsmen</a-select-option>
        </a-select>
      </div>

      <!-- Phone -->
      <div class="form-item">
        <label class="form-label">Phone:</label>
        <a-input
          v-model:value="formState.phone"
          placeholder="Enter Phone"
          class="form-input"
        />
      </div>

      <!-- Email -->
      <div class="form-item">
        <label class="form-label">Email:</label>
        <a-input
          v-model:value="formState.email"
          placeholder="Enter Email"
          class="form-input"
        />
      </div>
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleSubmit"
        >Submit</a-button
      >
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { addPersonnel } from "../../api/Personnel/Personnel.js";

// Props로 부모 컴포넌트에서 전달된 상태와 함수
const props = defineProps({
  open: Boolean, // 모달 열림 상태
  // formState: Object, // 폼 데이터
  num: Number,
});

console.log(props.num);

// 상태 변수
const formState = reactive({
  personnel_idx: 0,
  name: "",
  company: "",
  department: "",
  role: "",
  phone: "",
  email: "",
});

const emit = defineEmits(['update:open', 'submit']); // 부모에게 상태와 데이터를 전달할 이벤트

const loading = ref(false);

// props.num 값이 변경될 때마다 formState의 personnelIdx 업데이트
watch(
  () => props.num,
  (newNum) => {
    formState.personnel_idx = newNum + 1; // 새로운 personnelIdx 설정
  },
  { immediate: true } // 컴포넌트가 처음 렌더링될 때도 실행
);

// 모달 닫기
const handleCancel = () => {
  emit('update:open', false); // 모달을 닫으라고 부모에게 알림
};

// 제출 처리
const handleSubmit = async () => {
  // reactive 객체를 일반 객체로 변환 (얕은 복사)
  const personnelData = { ...formState };
  console.log(personnelData);

  loading.value = true;

  // API 호출
  const response = await addPersonnel(personnelData);
  console.log("Personnel added successfully:", response);
  
  setTimeout(() => {
    loading.value = false;
    // emit('submit', formState); // 제출 데이터를 부모에게 전달
    // emit('update:open', false); // 모달을 닫음
  }, 2000);
};
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-label {
  flex: 0 0 120px;
  margin-right: 10px;
  text-align: left;
}

.form-input {
  flex: 1;
}
</style>
