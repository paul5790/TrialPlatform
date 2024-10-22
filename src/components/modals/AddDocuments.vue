<template>
  <a-modal :open="open" title="문서 업로드" @ok="handleSubmit" @cancel="handleCancel">
    <a-form layout="vertical">
      <!-- Ship Id -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Ship Id :</label>
        <a-select
          v-model:value="formState.shipId"
          placeholder="Select Ship Id"
          class="form-input"
        >
          <a-select-option value="option1">SN2286</a-select-option>
          <a-select-option value="option2">SN2287</a-select-option>
        </a-select>
      </div>

      <!-- Activity Name -->
      <div class="form-item">
        <label class="form-label">Activity Name :</label>
        <a-select
          v-model:value="formState.activityName"
          placeholder="Select Activity Name"
          class="form-input"
        >
          <a-select-option value="option1">Speed test</a-select-option>
          <a-select-option value="option2">Anchor test</a-select-option>
        </a-select>
      </div>

      <!-- Doc. id -->
      <div class="form-item">
        <label class="form-label">Doc. id :</label>
        <a-input
          v-model:value="formState.docId"
          placeholder="Enter Doc. id"
          class="form-input"
        />
      </div>

      <!-- Doc. Name -->
      <div class="form-item">
        <label class="form-label">Doc. Name :</label>
        <a-input
          v-model:value="formState.docName"
          placeholder="Enter Doc. Name"
          class="form-input"
        />
      </div>

      <!-- Version -->
      <div class="form-item">
        <label class="form-label">Version :</label>
        <a-input
          v-model:value="formState.version"
          placeholder="Enter Version"
          class="form-input"
        />
      </div>

      <!-- Doc. Type -->
      <div class="form-item">
        <label class="form-label">Doc. Type :</label>
        <a-select
          v-model:value="formState.docType"
          placeholder="Select Doc. Type"
          class="form-input"
        >
          <a-select-option value="option1">RuleRegulation</a-select-option>
          <a-select-option value="option2">Option 2</a-select-option>
        </a-select>
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

      <!-- Contact Person -->
      <div class="form-item">
        <label class="form-label">Contact Person :</label>
        <a-input
          v-model:value="formState.contactPerson"
          placeholder="Enter Contact Person"
          class="form-input"
        />
      </div>

      <!-- Description Type -->
      <div class="form-item">
        <label class="form-label">Description Type :</label>
        <a-select
          v-model:value="formState.descriptionType"
          placeholder="Select Description Type"
          class="form-input"
        >
          <a-select-option value="option1">Information</a-select-option>
          <a-select-option value="option2">Issue</a-select-option>
        </a-select>
      </div>

      <div class="form-item">
        <a-textarea
          v-model:value="formState.description"
          placeholder="Enter Description"
          class="form-input"
          :rows="2"
        />
      </div>

      <!-- File -->
      <div class="form-item">
        <label class="form-label">File :</label>
        <a-upload :before-upload="handleFileSelect" show-upload-list="false">
          <a-button icon="upload">문서 첨부</a-button>
        </a-upload>
      </div>
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleSubmit">Submit</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  open: Boolean, // 부모로부터 받는 open 상태
  formState: Object, // 폼 데이터 상태
});

const emit = defineEmits(['update:open', 'submit']); // 부모에게 상태 업데이트 전달

const loading = ref(false);

// 파일 선택 핸들러
const handleFileSelect = (file) => {
  props.formState.file = file.name;
  return false;
};

// 모달 닫기 함수
const handleCancel = () => {
  emit('update:open', false); // 부모에게 모달을 닫으라고 알림
};

// 제출 처리 함수
const handleSubmit = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    emit('submit', props.formState); // 부모에게 formState 데이터 제출
    emit('update:open', false); // 모달 닫기
  }, 2000);
};
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
}
</style>
