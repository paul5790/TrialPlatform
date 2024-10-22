<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 30px"
  >
    <a-card style="overflow-x: auto; white-space: nowrap; padding: 0px">
      <!-- items 배열을 순회하며 네모카드 생성 -->
      <a-card
        v-for="item in items"
        :key="item.id"
        style="
          display: inline-block;
          width: 150px;
          height: 100px;
          margin-right: 20px;
          text-align: center;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        "
        body-style="padding: 10px;"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
      >
        <h3 style="margin: 5px 0">{{ item.shipId }}</h3>
        <!-- 간격 조절 -->
        <p style="margin: 2px 0">
          Prog. {{ item.progress }}% ({{ item.currentTask }}/{{
            item.totalTasks
          }})
        </p>
        <p style="margin: 2px 0">Loc: {{ item.location }}</p>
      </a-card>
    </a-card>
    <a-button
      @click="showAddScheduleModal"
      type="primary"
      style="width: 200px; height: 40px"
    >
      <template #icon>
        <PlusOutlined />
      </template>
      새 일정 추가
    </a-button>
    <div style="display: flex; align-items: center; gap: 20px">
      <a-card
        style="width: 85%; height: 50px"
        body-style="padding: 7.5px; padding-left: 0px; display: flex; align-items: center; gap: 10px;"
      >
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="1">
                <UserOutlined />
                EndTime
              </a-menu-item>
              <a-menu-item key="2">
                <UserOutlined />
                2nd menu item
              </a-menu-item>
              <a-menu-item key="3">
                <UserOutlined />
                3rd item
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            @click="handleButtonClick"
            style="
              width: 150px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            {{ selectedMenu }}
            <DownOutlined />
          </a-button>
        </a-dropdown>
        <a-button :icon="h(FilterOutlined)" style="margin-left: 10px">
        </a-button>
        <a-input style="margin-left: 10px" v-model:value="formState.username" />
      </a-card>
      <a-button type="primary" style="width: 200px; height: 40px">
        필터링
      </a-button>
    </div>

    <a-table :columns="columns" :data-source="dataSource" bordered>
      <template #bodyCell="{ column, text, record }">
        <template
          v-if="
            [
              'ShipId',
              'Status',
              'StartTime',
              'EndTime',
              'Part',
              'ShipTypes',
              'TrialType',
              'TotalActivity',
              'Done',
              'Revision',
            ].includes(column.dataIndex)
          "
        >
          <div>
            <a-input
              v-if="editableData[record.key]"
              v-model:value="editableData[record.key][column.dataIndex]"
              style="margin: -5px 0"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <span v-if="editableData[record.key]">
              <a-typography-link @click="save(record.key)"
                >Save</a-typography-link
              >
              <a-popconfirm
                title="Sure to cancel?"
                @confirm="cancel(record.key)"
              >
                <a>Cancel</a>
              </a-popconfirm>
            </span>
            <span v-else>
              <a @click="edit(record.key)">Edit</a>
            </span>
          </div>
        </template>
      </template>
    </a-table>
  </a-space>

  <!-- 새 일정 추가 모달 -->
    <AddSchedule

      :open="isAddScheduleOpen"
      :formState="formState"
      :tasks="tasks"
      @update:open="isAddScheduleOpen = $event"
      @submit="handleAddScheduleSubmit"
      @openEditSchedule="isEditScheduleOpen = true"
    />



  <!-- 항목 편집 모달 -->
    <EditSchedule
      :open="isEditScheduleOpen"
      :allItems="allItems"
      :addedItems="addedItems"
      @update:open="isEditScheduleOpen = $event"
      @submit="handleEditScheduleSubmit"
    />
</template>

<script setup>
import {
  DownloadOutlined,
  PlusOutlined,
  UserOutlined,
  DownOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons-vue";
import { ref, h, reactive, watch } from "vue";
import { cloneDeep } from "lodash-es";
import GanttChart from "../components/GanttChart.vue";
import { message } from "ant-design-vue";
import AddSchedule from '@/components/modals/AddSchedule.vue';
import EditSchedule from '@/components/modals/schedule/EditSchedule.vue';
import { useTasksStore } from '@/store/tasksStore';

// 간트차트 tasks 데이터
// const tasks = ref([
//   {
//     startTime: Date.UTC(2024, 8, 26, 0, 0), // 시작 시간 (UTC)
//     minute: 30, // 30분 지속
//     name: "Speed test",
//     id: "A-1",
//     y: 0,
//     color: '#ff5555'
//   },
//   {
//     startTime: Date.UTC(2024, 8, 26, 0, 30), // 시작 시간
//     minute: 15, // 15분 지속
//     name: "Anchor test",
//     // milestone: true,
//     // dependency: "prototype",
//     id: "G-1",
//     y: 1,
//     color: '#ff5555'
//   },
//   {
//     startTime: Date.UTC(2024, 8, 26, 0, 45), // 시작 시간
//     minute: 42, // 42분 지속
//     name: "Steering test",
//     // dependency: "proto_done",
//     id: "A-2",
//     y: 2,
//     color: '#ff5555'
//   },
//   {
//     startTime: Date.UTC(2024, 8, 26, 1, 27), // 시작 시간
//     minute: 6, // 6분 지속
//     name: "M/E running test",
//     id: "B-18",
//     y: 0,
//     color: '#55ff55'
//   },
//   {
//     startTime: Date.UTC(2024, 8, 26, 1, 33), // 시작 시간
//     minute: 15, // 15분 지속
//     name: "Steering test",
//     // milestone: true,
//     // dependency: "prototype_1",
//     id: "A-2",
//     y: 1,
//     color: '#55ff55'
//   },
//   {
//     startTime: Date.UTC(2024, 8, 26, 1, 48), // 시작 시간
//     minute: 28, // 28분 지속
//     name: "Speed test",
//     // dependency: "proto_done_1",
//     id: "A-1",
//     y: 2,
//     color: '#55ff55'
//   }
// ]);
const tasksStore = useTasksStore();
const tasks = tasksStore.tasks;


const isModalVisible = ref(false);
const taskForm = ref({
  name: "",
  department: "Tech",
  dependency: null,
  milestone: false,
});

// 모달 열기/닫기
const showModal_2 = () => {
  isModalVisible.value = true;
};
const handleCancel_2 = () => {
  isModalVisible.value = false;
};

// Task 추가
const addTask = () => {
  const newTask = {
    name: taskForm.value.name,
    start: Date.now(),
    end: Date.now() + 1000 * 60 * 60 * 24 * 2, // 임의로 2일 기간을 부여
    y:
      taskForm.value.department === "Tech"
        ? 0
        : taskForm.value.department === "Marketing"
        ? 1
        : 2,
    dependency: taskForm.value.dependency,
    milestone: taskForm.value.milestone,
  };
  tasks.value.push(newTask); // 새로운 Task 추가
  message.success("Task added successfully!");
  isModalVisible.value = false;
};

// 새로운 Task를 추가하는 함수
const autoGenerateSchedule = () => {
  const newTaskId = tasks.value.length + 1;
  const newTask = {
    id: `Task ${newTaskId}`,
    name: `New Task ${newTaskId}`,
    start: "2023-09-10",
    end: "2023-09-20",
    progress: 0,
    dependencies: "",
  };

  // 새로운 배열을 생성하여 참조 변경
  tasks.value = [...tasks.value, newTask];
};

// Task의 순서를 변경하는 함수
const swapTasks = () => {
  const newTasks = [...tasks.value];
  // 첫 번째와 두 번째 Task의 위치를 바꿈
  const temp = newTasks[0];
  newTasks[0] = newTasks[1];
  newTasks[1] = temp;

  // 참조를 변경하여 Vue가 감지하도록 함
  tasks.value = newTasks;
};

// 모달 변수
const loading = ref(false);
const loading_1 = ref(false);
const isAddScheduleOpen = ref(false);
const isEditScheduleOpen = ref(false);

const showAddScheduleModal = () => {
  isAddScheduleOpen.value = true;
};

const handleAddScheduleSubmit = (data) => {
  tasksStore.addTask(data); // tasksStore에 Task 추가
  console.log('New schedule submitted:', data);
};

const handleEditScheduleSubmit = (data) => {
  console.log('Edited schedule submitted:', data);
};

// tasksStore의 tasks 변경을 감지하고 Gantt 차트를 업데이트하는 watch 추가
// watch(
//   () => tasksStore.tasks,
//   (newTasks) => {
//     console.log("Tasks updated. You can now trigger GanttChart update here.");

//     // GanttChart 업데이트 로직을 여기에 추가
//   },
//   { deep: true }
// );

// 폼 데이터
const shipId = ref("");
const shipType = ref(null);
const testType = ref(null);
const startTime = ref(null);

// 상태 변수
const formState = reactive({
  username: "",
});

// 선택한 메뉴를 저장할 변수
const selectedMenu = ref("StartTime"); // 기본 버튼 텍스트

const handleButtonClick = (e) => {
  console.log("click left button", e);
};

// 메뉴 선택 시 호출되는 함수
const handleMenuClick = (e) => {
  console.log("click", e);
  selectedMenu.value =
    e.key === "1" ? "EndTime" : e.key === "2" ? "2nd menu item" : "3rd item";
};

// items 배열에 네모카드 정보를 넣음
const items = ref([
  {
    id: 1,
    shipId: "SN2286",
    progress: 60,
    currentTask: 6,
    totalTasks: 10,
    location: "15.234, -30.679",
  },
  {
    id: 2,
    shipId: "SN2287",
    progress: 60,
    currentTask: 6,
    totalTasks: 10,
    location: "15.234, -30.674",
  },
  // { id: 3, shipId: 'SN2286', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.679' },
  // { id: 4, shipId: 'SN2287', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.674' },
  // { id: 5, shipId: 'SN2286', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.679' },
  // { id: 6, shipId: 'SN2287', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.674' },
  // { id: 7, shipId: 'SN2286', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.679' },
  // { id: 8, shipId: 'SN2287', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.674' },
  // { id: 9, shipId: 'SN2286', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.679' },
  // { id: 10, shipId: 'SN2287', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.674' },
  // { id: 11, shipId: 'SN2286', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.679' },
  // { id: 12, shipId: 'SN2287', progress: 60, currentTask: 6, totalTasks: 10, location: '15.234, -30.674' },
  // 필요한 만큼 아이템을 추가
]);

// 데이터 테이블
const columns = [
  {
    title: "ShipId",
    dataIndex: "ShipId",
    width: "10%",
  },
  {
    title: "Status",
    dataIndex: "Status",
    width: "10%",
  },
  {
    title: "StartTime",
    dataIndex: "StartTime",
    width: "15%",
  },
  {
    title: "EndTime",
    dataIndex: "EndTime",
    width: "15%",
  },
  {
    title: "ShipTypes",
    dataIndex: "ShipTypes",
    width: "10%",
  },
  {
    title: "TrialType",
    dataIndex: "TrialType",
    width: "10%",
  },

  {
    title: "TotalActivity",
    dataIndex: "TotalActivity",
    width: "10%",
  },
  {
    title: "Done",
    dataIndex: "Done",
    width: "10%",
  },
  {
    title: "Revision",
    dataIndex: "Revision",
    width: "15%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

const data = [];
data.push(
  {
    key: 1,
    ShipId: `SN2286`,
    Status: `In progress`,
    StartTime: `24.09.01T01:15:37.00`,
    EndTime: `24.09.02T01:15:39.00`,
    ShipTypes: `Container`,
    TrialType: `Sea trial`,
    TotalActivity: 110,
    Done: 66,
    Revision: `A`,
  },
  {
    key: 2,
    ShipId: `SN2260`,
    Status: `In progress`,
    StartTime: `24.09.02T01:15:37.00`,
    EndTime: `24.09.03T01:15:39.00`,
    ShipTypes: `Container`,
    TrialType: `Sea trial`,
    TotalActivity: 110,
    Done: 66,
    Revision: `A`,
  },
  {
    key: 3,
    ShipId: `SN2241`,
    Status: `Ready`,
    StartTime: `24.09.03T01:15:37.00`,
    EndTime: `24.09.04T01:15:39.00`,
    ShipTypes: `Bulk Carrier`,
    TrialType: `Sea trial`,
    TotalActivity: 3,
    Done: 0,
    Revision: `B`,
  },
  {
    key: 4,
    ShipId: `SN2184`,
    Status: `Completed`,
    StartTime: `24.09.04T01:15:37.00`,
    EndTime: `24.09.05T01:15:39.00`,
    ShipTypes: `Shuttle Tanker`,
    TrialType: `Dock trial`,
    TotalActivity: 49,
    Done: 49,
    Revision: `A`,
  },
  {
    key: 5,
    ShipId: `SN2184`,
    Status: `Completed`,
    StartTime: `24.09.04T01:15:37.00`,
    EndTime: `24.09.05T01:15:39.00`,
    ShipTypes: `Shuttle Tanker`,
    TrialType: `Dock trial`,
    TotalActivity: 49,
    Done: 49,
    Revision: `A`,
  }
);

const dataSource = ref(data);
const editableData = reactive({});

const edit = (key) => {
  editableData[key] = cloneDeep(
    dataSource.value.filter((item) => key === item.key)[0]
  );
};
const save = (key) => {
  Object.assign(
    dataSource.value.filter((item) => key === item.key)[0],
    editableData[key]
  );
  delete editableData[key];
};
const cancel = (key) => {
  delete editableData[key];
};

// 모달 함수

const showModal = () => {
  open.value = true;
};

const showModal_1 = () => {
  isModalOpen.value = true;
};
// OK 버튼 동작
const handleOk = () => {
  console.log("저장:", {
    shipId: shipId.value,
    shipType: shipType.value,
    testType: testType.value,
    startTime: startTime.value,
  });
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    open.value = false;
  }, 2000);
};
const handleCancel = () => {
  open.value = false;
};

// ------------------------  ----------------------------
const isModalOpen = ref(false);
// 전체 항목과 추가된 항목 리스트
const allItems = ref([
  "A-3 Speed test",
  "A-4 Steering test",
  "A-5 M/E test",
  "A-6 HIL test",
  "G-2 Running test",
  "G-3 Running test",
  "G-4 Running test",
  "G-5 Running test",
]);
const addedItems = ref([
  "A-1 Speed test",
  "A-2 Steering test",
  "G-1 M/E test",
  "G-10 HIL test",
  "G-11 Running test",
  "B-18 FMEA test",
]);

// 선택된 항목들
const selectedAllItems = ref([]);
const selectedAddedItem = ref(null);

// 전체 항목에서 선택/해제
const toggleAllItem = (item) => {
  if (selectedAddedItem.value) {
    // 추가된 항목을 선택 중이면 전체 항목을 선택했을 때 모두 초기화
    selectedAddedItem.value = null;
  }

  if (selectedAllItems.value.includes(item)) {
    selectedAllItems.value = selectedAllItems.value.filter((i) => i !== item);
  } else {
    selectedAllItems.value.push(item);
  }
};

// 추가된 항목 선택
const selectAddedItem = (item) => {
  if (selectedAllItems.value.length > 0) {
    // 전체 항목을 선택 중이면 추가된 항목을 선택했을 때 모두 초기화
    selectedAllItems.value = [];
  }
  selectedAddedItem.value = item;
};

// 전체 항목에서 추가된 항목으로 이동
const addItems = () => {
  addedItems.value = [...addedItems.value, ...selectedAllItems.value];
  allItems.value = allItems.value.filter(
    (item) => !selectedAllItems.value.includes(item)
  );
  selectedAllItems.value = [];
};

// 추가된 항목에서 다시 전체 항목으로 이동
const removeItem = () => {
  allItems.value = [...allItems.value, selectedAddedItem.value];
  addedItems.value = addedItems.value.filter(
    (item) => item !== selectedAddedItem.value
  );
  selectedAddedItem.value = null;
};

// 추가된 항목 리스트에서 항목 순서 변경 (위로 이동)
const moveUp = () => {
  const index = addedItems.value.indexOf(selectedAddedItem.value);
  if (index > 0) {
    const temp = addedItems.value[index - 1];
    addedItems.value[index - 1] = addedItems.value[index];
    addedItems.value[index] = temp;
  }
};

// 추가된 항목 리스트에서 항목 순서 변경 (아래로 이동)
const moveDown = () => {
  const index = addedItems.value.indexOf(selectedAddedItem.value);
  if (index < addedItems.value.length - 1) {
    const temp = addedItems.value[index + 1];
    addedItems.value[index + 1] = addedItems.value[index];
    addedItems.value[index] = temp;
  }
};

// style
// 마우스를 올렸을 때 효과
const handleMouseOver = (event) => {
  event.currentTarget.style.transform = "scale(1.05)"; // 카드가 살짝 커짐
};

// 마우스를 뗐을 때 원래 상태로 복귀
const handleMouseLeave = (event) => {
  event.currentTarget.style.transform = "scale(1)";
};
</script>

<style lang="less" scoped>
.demo-dropdown-wrap :deep(.ant-dropdown-button) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>

<style scoped>
.modal-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.list-container {
  display: flex;
  gap: 20px;
}

.list-box {
  width: 200px;
  height: 400px;
  overflow-y: auto;
}

/* 스크롤바 숨기기 */
.list-box::-webkit-scrollbar {
  display: none;
}

.list-box {
  -ms-overflow-style: none; /* IE와 Edge에서 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox에서 스크롤바 숨기기 */
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.arrow-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}
.selected {
  background-color: #bae7ff;
}


</style>
