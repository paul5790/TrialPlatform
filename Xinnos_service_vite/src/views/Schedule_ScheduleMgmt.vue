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
      @click="showModal"
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
  <a-modal
    v-model:open="open"
    title="새 일정 추가 / 일정 수정"
    @ok="handleOk"
    width="100%"
  >
    <a-form layout="vertical">
      <div style="display: flex; gap: 20px; align-items: center">
        <!-- 선박 ID -->
        <a-form-item label="선박 ID" style="flex: 1">
          <a-input v-model:value="shipId" placeholder="선박 ID 입력" />
        </a-form-item>

        <!-- 선종 선택 -->
        <a-form-item label="선종 선택:" style="flex: 1">
          <a-select
            v-model:value="shipType"
            placeholder="선종 선택"
            style="width: 100%"
          >
            <a-select-option value="Container">Container</a-select-option>
            <a-select-option value="addNew">+ 선종 추가</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 시운전 타입 선택 -->
        <a-form-item label="시운전 타입 선택:" style="flex: 1">
          <a-select
            v-model:value="testType"
            placeholder="시운전 타입 선택"
            style="width: 100%"
          >
            <a-select-option value="해상 시운전">해상 시운전</a-select-option>
            <a-select-option value="addNew">+ 시운전 타입 추가</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 시작 시간 -->
        <a-form-item label="시작 시간:" style="flex: 1">
          <a-date-picker
            v-model:value="startTime"
            show-time
            placeholder="시작 시간 선택"
            style="width: 100%"
          />
        </a-form-item>

        <!-- 스케줄 자동 생성 버튼 -->
        <a-button @click="autoGenerateSchedule" style="margin-right: 10px"
          >스케줄 자동 생성</a-button
        >

        <a-button @click="swapTasks" style="margin-right: 10px"
          >순서 바꾸기</a-button
        >

        <!-- Add Task 버튼 -->
        <a-button type="primary" @click="showModal_2">Task 추가하기</a-button>

        <!-- 저장 버튼 -->
        <a-button type="primary" @click="handleOk">저장</a-button>
      </div>
    </a-form>

    <GanttChart :tasks="tasks" />
    <!-- <a-dropdown :trigger="['contextmenu']">
      <div style="text-align: center; margin-top: 20px">
        <img
          src="../../public/chartPng.png"
          alt="Sample Image"
          style="max-width: 100%; height: auto; cursor: pointer"
        />
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="showModal_1"
            >Activity 항목 편집</a-menu-item
          >
        </a-menu>
      </template>
    </a-dropdown> -->

    <!-- Footer buttons (Return / Submit) -->
    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk"
        >Submit</a-button
      >
    </template>
  </a-modal>

  <!-- Task 추가 모달 -->
  <a-modal
    v-model:visible="isModalVisible"
    title="Add Task"
    @ok="addTask"
    @cancel="handleCancel_2"
  >
    <a-form layout="vertical">
      <a-form-item label="Task Name">
        <a-input v-model="taskForm.name" />
      </a-form-item>

      <a-form-item label="Department">
        <a-select v-model="taskForm.department">
          <a-select-option value="Tech">Tech</a-select-option>
          <a-select-option value="Marketing">Marketing</a-select-option>
          <a-select-option value="Sales">Sales</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Dependency">
        <a-select v-model="taskForm.dependency">
          <a-select-option
            v-for="task in tasks"
            :key="task.id"
            :value="task.id"
          >
            {{ task.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Milestone">
        <a-checkbox v-model="taskForm.milestone">Is Milestone?</a-checkbox>
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal v-model:open="isModalOpen" title="Activity 항목 편집" width="700px">
    <div class="modal-body">
      <div class="list-container">
        <!-- 왼쪽 전체 항목 리스트 -->
        <div class="list-box">
          <h4>전체 항목</h4>
          <a-list
            :data-source="allItems"
            :render-item="renderItem"
            bordered
            item-layout="horizontal"
          >
            <template #renderItem="{ item, index }">
              <a-list-item
                :key="index"
                :class="{ selected: selectedAllItems.includes(item) }"
                @click="toggleAllItem(item)"
              >
                <a-checkbox :checked="selectedAllItems.includes(item)">
                  {{ item }}
                </a-checkbox>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 추가 및 제거 버튼 -->
        <div class="controls">
          <a-button
            @click="addItems"
            type="primary"
            :disabled="selectedAllItems.length === 0"
            >추가</a-button
          >
          <a-button
            @click="removeItem"
            type="primary"
            :disabled="selectedAddedItem === null"
            >제거</a-button
          >
        </div>

        <!-- 오른쪽 추가된 항목 리스트 -->
        <div class="list-box">
          <h4>추가된 항목</h4>
          <a-list
            :data-source="addedItems"
            :render-item="renderAddedItem"
            bordered
            item-layout="horizontal"
          >
            <template #renderItem="{ item, index }">
              <a-list-item
                :key="index"
                :class="{ selected: selectedAddedItem === item }"
                @click="selectAddedItem(item)"
              >
                <a-checkbox :checked="selectedAddedItem === item">
                  {{ item }}
                </a-checkbox>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 위/아래 화살표 버튼 -->
        <div class="arrow-controls">
          <a-button
            @click="moveUp"
            type="primary"
            :disabled="!selectedAddedItem"
            ><template #icon> <ArrowUpOutlined /> </template
          ></a-button>
          <a-button
            @click="moveDown"
            type="primary"
            :disabled="!selectedAddedItem"
            ><template #icon> <ArrowDownOutlined /> </template
          ></a-button>
        </div>
      </div>
    </div>
  </a-modal>
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
import { ref, h, reactive } from "vue";
import { cloneDeep } from "lodash-es";
import GanttChart from "../components/GanttChart.vue";
import { message } from "ant-design-vue";

// 간트차트
const tasks = ref([
  {
    start: Date.UTC(2024, 0, 1),
    end: Date.UTC(2024, 0, 10),
    name: "Prototype",
    id: "prototype",
    y: 0,
  },
  {
    start: Date.UTC(2024, 0, 11),
    name: "Prototype done",
    milestone: true,
    dependency: "prototype",
    id: "proto_done",
    y: 0,
  },
  {
    start: Date.UTC(2024, 0, 12),
    end: Date.UTC(2024, 0, 15),
    name: "Testing",
    dependency: "proto_done",
    y: 0,
  },
  // {
  //   id: 'Task 1',
  //   name: 'Redesign website',
  //   start: '2023-09-01',
  //   end: '2023-09-10',
  //   progress: 20,
  //   dependencies: ''
  // },
  // {
  //   id: 'Task 2',
  //   name: 'Develop API',
  //   start: '2023-09-05',
  //   end: '2023-09-15',
  //   progress: 40,
  //   dependencies: 'Task 1'
  // }
]);

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
const open = ref(false);
const open_1 = ref(false);

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
