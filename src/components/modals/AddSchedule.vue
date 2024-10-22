<template>
  <a-modal :open="open" title="새 일정 추가 / 일정 수정" @ok="handleSubmit" width="100%" @cancel="handleCancel">
    <a-form layout="vertical">
      <div style="display: flex; gap: 20px; align-items: center">
        <!-- 선박 ID -->
        <a-form-item label="선박 ID" style="flex: 1">
          <a-input v-model:value="formState.shipId" placeholder="선박 ID 입력" />
        </a-form-item>

        <!-- 선종 선택 -->
        <a-form-item label="선종 선택:" style="flex: 1">
          <a-select v-model:value="formState.shipType" placeholder="선종 선택" style="width: 100%">
            <a-select-option value="Container">Container</a-select-option>
            <a-select-option value="addNew">+ 선종 추가</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 시운전 타입 선택 -->
        <a-form-item label="시운전 타입 선택:" style="flex: 1">
          <a-select v-model:value="formState.testType" placeholder="시운전 타입 선택" style="width: 100%">
            <a-select-option value="해상 시운전">해상 시운전</a-select-option>
            <a-select-option value="addNew">+ 시운전 타입 추가</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 시작 시간 -->
        <a-form-item label="시작 시간:" style="flex: 1">
          <a-date-picker v-model:value="formState.startTime" show-time placeholder="시작 시간 선택" style="width: 100%" />
        </a-form-item>

        <!-- 스케줄 자동 생성 버튼 -->
        <a-button @click="autoGenerateSchedule" style="margin-right: 10px">
          스케줄 자동 생성
        </a-button>

        <!-- Task 추가 -->
        <a-button type="primary" @click="showAddTaskModal">Task 추가하기</a-button>
      </div>
    </a-form>

    <!-- AddTask 모달 컴포넌트 -->
    <AddTask :open="addTaskModalOpen" :tasks="tasks" @update:open="addTaskModalOpen = $event" @submit="handleAddTaskSubmit"  @task-added="handleTaskAdded"/>

    <!-- GanttChart와 우클릭 메뉴로 항목 편집 모달을 여는 기능 -->
    <a-dropdown :trigger="['contextmenu']">
      <GanttChart :tasks="tasks" />
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="editSchedule">Activity 항목 편집</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <template #footer>
      <a-button @click="handleCancel">Return</a-button>
      <a-button type="primary" @click="handleSubmit">Submit</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import AddTask from './schedule/AddTask.vue';
import GanttChart from '@/components/GanttChart.vue';
import { useTasksStore } from '@/store/tasksStore';

// Props와 emits 정의
const props = defineProps({
  open: Boolean,
  formState: Object,
  tasks: Array,
});

const emit = defineEmits(['update:open', 'submit', 'openEditSchedule']);

const addTaskModalOpen = ref(false); // Task 추가 모달 상태

const autoGenerateSchedule = () => {
  // 스케줄 자동 생성 로직
};

// Task 추가 모달 열기
const showAddTaskModal = () => {
  addTaskModalOpen.value = true;
};

// Task 추가 시 처리 함수
const handleAddTaskSubmit = (newTask) => {
  props.tasks.push({ id: props.tasks.length + 1, ...newTask });
};

// Task가 추가된 후 GanttChart를 업데이트
const handleTaskAdded = (newTask) => {
  handleAddTaskSubmit(newTask); // Task 추가
  emit('submit', newTask); // GanttChart로 업데이트 이벤트 발생
};

// 모달 제출 및 닫기
const handleSubmit = () => {
  emit('submit', props.formState); // 폼 데이터 전송
  emit('update:open', false); // 모달 닫기
};

const handleCancel = () => {
  emit('update:open', false); // 모달 닫기
};

// 항목 편집 모달 열기
const editSchedule = () => {
  emit('openEditSchedule');
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