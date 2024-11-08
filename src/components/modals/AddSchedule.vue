<template>
  <a-modal
    :open="open"
    title="새 일정 추가 / 일정 수정"
    @ok="handleSubmit"
    width="100%"
    @cancel="handleCancel"
    wrap-class-name="full-modal"
  >
    <a-form layout="vertical">
      <div
        style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap"
      >
        <!-- Trial Id -->
        <div class="form-group">
          <label class="form-label">Trial Id :</label>
          <a-select
            v-model:value="selectedTrialId"
            placeholder="Select Trial Id"
            style="width: 250px"
            :options="trialIdItems.map((item) => ({ value: item }))"
          />
        </div>

        <!-- Version -->
        <div class="form-group">
          <label class="form-label">Version :</label>
          <a-select
            v-model:value="selectedVersion"
            placeholder="Select Version"
            style="width: 150px; margin-right: 50px"
            :options="versionItems.map((item) => ({ value: item }))"
          />
        </div>

        <!-- 스케줄 자동 생성 버튼 -->
        <a-button @click="autoGenerateSchedule" style="margin-right: 10px">
          스케줄 자동 생성
        </a-button>

        <!-- Task 추가 -->
        <a-button type="primary" @click="showAddTaskModal"
          >Task 추가하기</a-button
        >
      </div>
    </a-form>

    <!-- AddTask 모달 컴포넌트 -->
    <AddTask
      :open="addTaskModalOpen"
      :tasks="tasks"
      @update:open="addTaskModalOpen = $event"
      @submit="handleAddTaskSubmit"
      @task-added="handleTaskAdded"
    />

    <!-- GanttChart와 우클릭 메뉴로 항목 편집 모달을 여는 기능 -->
    <a-dropdown :trigger="['contextmenu']">
      <GanttChart :tasks="tasks" :selectedTrialId="selectedTrialId" :selectedVersion="selectedVersion" />
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="editSchedule"
            >Activity 항목 편집</a-menu-item
          >
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
import { ref, defineProps, defineEmits, watch } from "vue";
import AddTask from "./schedule/AddTask.vue";
import GanttChart from "@/components/GanttChart.vue";
import { getTrial } from "../../api/Trial.js";
import { useTasksStore } from "@/store/tasksStore";

// Props와 emits 정의
const props = defineProps({
  open: Boolean,
  formState: Object,
  selectedTrialId: String,
  selectedVersion: String,
  tasks: Array,
});

// selectedTrialId 값 변경 감지
watch(
  [() => props.selectedTrialId, () => props.selectedVersion],
  ([newTrialId, newVersion]) => {
      if (newTrialId === null || newVersion === null) {
      console.log("null 값이 감지되었습니다.");
    }
      selectedTrialId.value = props.selectedTrialId;
      selectedVersion.value = props.selectedVersion;
      console.log("1번코드 실행!");
    
  }
);

const emit = defineEmits(["update:open", "submit", "openEditSchedule"]);

const trialIdItems = ref([]);
const selectedTrialId = ref();
const selectedVersion = ref();

// Trial ID List 가져오기
const getTrialList = async () => {
  try {
    const trialValue = await getTrial();
    console.log("trialValue : ", trialValue);

    trialValue.forEach((trial, index) => {
      trialIdItems.value.push(trial.trialId);
    });
  } catch (error) {
    console.error(error);
  }
};
getTrialList();

const versionItems = ref(["A", "B", "C"]);

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
  emit("submit", newTask); // GanttChart로 업데이트 이벤트 발생
};

// 모달 제출 및 닫기
const handleSubmit = () => {
  emit("submit", props.formState); // 폼 데이터 전송
  emit("update:open", false); // 모달 닫기
};

const handleCancel = () => {
  emit("update:open", false); // 모달 닫기
};

// 항목 편집 모달 열기
const editSchedule = () => {
  emit("openEditSchedule");
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

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 98%; // 모달의 최대 너비를 화면의 95%로 설정
    top: 2.5%; // 화면 위쪽에서 2.5% 아래에 위치
    padding-bottom: 2.5%; // 아래쪽 여백도 2.5% 추가
    margin: 0 auto; // 가운데 정렬
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(95vh); // 모달의 높이를 화면 높이의 95%로 설정
  }
  .ant-modal-body {
    flex: 1;
    overflow-y: auto; // 내용이 넘칠 경우 스크롤 활성화
  }
}
</style>
