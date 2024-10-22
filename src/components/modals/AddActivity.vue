<template>
  <a-modal :open="open" title="새 활동 추가 / 활동 수정" @ok="handleSubmit" @cancel="handleCancel">
    <a-form layout="vertical">
      <!-- Activity Id -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Activity Id:</label>
        <a-input
          v-model:value="formState.activityId"
          placeholder="Enter Activity Id"
          class="form-input"
        />
      </div>

      <!-- Activity Name -->
      <div class="form-item">
        <label class="form-label">Activity Name:</label>
        <a-input
          v-model:value="formState.activityName"
          placeholder="Enter Activity Name"
          class="form-input"
        />
      </div>

      <!-- Time Taken -->
      <div class="form-item">
        <label class="form-label">Time Taken:</label>
        <a-input
          v-model:value="formState.timeTaken"
          placeholder="Enter Time Taken"
          class="form-input"
        />
      </div>

      <!-- Engine Load -->
      <div class="form-item">
        <label class="form-label">Engine Load:</label>
        <a-input
          v-model:value="formState.engineLoad"
          placeholder="Enter Engine Load"
          class="form-input"
        />
      </div>

      <!-- Part -->
      <div class="form-item">
        <label class="form-label">Part:</label>
        <a-select
          v-model:value="formState.part"
          placeholder="Select Part"
          class="form-input"
        >
          <a-select-option value="option1">Option 1</a-select-option>
          <a-select-option value="option2">Option 2</a-select-option>
        </a-select>
      </div>

      <!-- Ship Types -->
      <div class="form-item">
        <label class="form-label">Ship Types:</label>
        <a-select
          v-model:value="formState.shipType"
          placeholder="Select Ship Type"
          class="form-input"
        >
          <a-select-option value="option1">Single</a-select-option>
          <a-select-option value="option2">Multiple</a-select-option>
        </a-select>
      </div>

      <!-- Trial Types -->
      <div class="form-item">
        <label class="form-label">Trial Types:</label>
        <a-select
          v-model:value="formState.trialType"
          placeholder="Select Trial Type"
          class="form-input"
        >
          <a-select-option value="option1">Single</a-select-option>
          <a-select-option value="option2">Multiple</a-select-option>
        </a-select>
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
import { ref, reactive } from 'vue';

// Props로 부모 컴포넌트에서 전달된 상태와 함수
const props = defineProps({
  open: Boolean, // 모달 열림 상태
  formState: Object, // 폼 데이터
});

const emit = defineEmits(['update:open', 'submit']); // 부모에게 상태와 데이터를 전달할 이벤트

const loading = ref(false);

// 모달 닫기
const handleCancel = () => {
  emit('update:open', false); // 모달을 닫으라고 부모에게 알림
};

// 제출 처리
const handleSubmit = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    emit('submit', props.formState); // 제출 데이터를 부모에게 전달
    emit('update:open', false); // 모달을 닫음
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
