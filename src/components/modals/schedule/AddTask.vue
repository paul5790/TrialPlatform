<template>
  <a-modal :open="open" title="Add Task" @ok="handleOk" @cancel="handleCancel">
    <a-form layout="vertical">
      <a-form-item label="Task Name">
        <a-input v-model:value="taskForm.name" placeholder="Enter Task Name" />
      </a-form-item>

      <a-form-item label="Department">
        <a-select v-model:value="taskForm.y" placeholder="Select Department">
          <a-select-option value="0">Tech</a-select-option>
          <a-select-option value="1">Marketing</a-select-option>
          <a-select-option value="2">Sales</a-select-option>
        </a-select>
      </a-form-item>

    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useTasksStore } from '@/store/tasksStore';

// Props와 emits 정의
const props = defineProps({
  open: Boolean,
  tasks: Array,
});

// tasksStore 가져오기
const tasksStore = useTasksStore();

const emit = defineEmits(['update:open', 'submit', 'task-added']);

const FIFTEEN_MINUTES = 1000 * 60 * 15;

// 전역으로 사용할 초기 시간 값 (기본 시작 시간)
let currentStartTime = Date.UTC(2024, 8, 26, 2, 16); // 처음 시작 시간

const defaultTaskForm = () => ({
  startTime: currentStartTime,
  minute: 15,
  name: "",
  id: `P-${Math.random().toString(36).substr(2, 5)}`, // 임의의 ID 생성
  y: 0,
  color: "#555555",
});

const taskForm = ref(defaultTaskForm()); // 기본 초기값으로 설정


// 폼 초기화
watch(() => props.open, (newVal) => {

});

// 확인 버튼
const handleOk = () => {
  console.log(tasksStore.tasks.length);
  taskForm.value.y = tasksStore.tasks.length % 3;
  console.log(tasksStore.tasks.length % 3);

  console.log(taskForm.value);
  
  tasksStore.addTask(taskForm.value); // tasksStore에 task 추가
  console.log(tasksStore.tasks);
  // task 추가 후 이벤트 발생시켜 차트 업데이트 알림
  // emit('task-added'); // 'task-added' 이벤트 발생
  currentStartTime += FIFTEEN_MINUTES;

  taskForm.value = defaultTaskForm();
  // 모달 닫기
  emit('update:open', false);
};

// 취소 버튼
const handleCancel = () => {
  emit('update:open', false); // 모달 닫기
};
</script>
