<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 20px"
  >
    <a-card
      style="
        overflow-x: auto;
        white-space: nowrap;
        padding: 0px;
        margin-bottom: 10px;
      "
    >
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
    <div class="button-container">
      <!-- 왼쪽 버튼 -->
      <a-button @click="showAddScheduleModal" type="primary" class="top-button">
        + 선박 등록
      </a-button>

      <!-- 오른쪽 버튼 -->
      <a-button
        :icon="h(FilterOutlined)"
        @click="showFilterModal"
        class="top-button"
      >
        필터링
      </a-button>
    </div>

    <div @contextmenu.prevent>
      <a-table
        :columns="columns"
        :pagination="{
          pageSize: 13,
          showSizeChanger: true,
          pageSizeOptions: ['13'],
        }"
        :data-source="filteredData"
        :row-key="(record) => record.key"
        bordered
        :customRow="customRow"
        size="small"
      >
      </a-table>

      <!-- 드롭다운 메뉴 -->
      <div
        v-if="menuVisible"
        ref="contextMenu"
        class="context-menu"
        :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }"
      >
        <a-menu>
          <a-menu-item key="edit" @click="handleEdit">수정</a-menu-item>
          <a-menu-item key="delete" @click="handleDelete">삭제</a-menu-item>
        </a-menu>
      </div>
    </div>
  </a-space>

  <!-- 필터 모달 컴포넌트 -->
  <ScheduleFilter
    :open="filterModalVisible"
    :shipTypeList="shipTypeList"
    @update:open="handleFilterModalToggle"
    @filter="applyFilter"
  />

  <!-- 새 일정 추가 모달 -->
  <AddSchedule
    :open="isAddScheduleOpen"
    :formState="formState"
    :tasks="tasks"
    @update:open="isAddScheduleOpen = $event"
    @submit="handleAddScheduleSubmit"
    @openEditSchedule="isEditScheduleOpen = true"
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

import {
  ref,
  h,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { cloneDeep } from "lodash-es";
import ShipUploadModal from "@/components/modals/AddShip.vue";
import ScheduleFilter from "@/components/Filter/ScheduleFilter.vue";
import { getAllSchedule } from "../api/Schedule/Schedule.js";
import { getShipType } from "../api/ShipType.js";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { createVNode } from "vue";
import { Modal } from "ant-design-vue";

import GanttChart from "../components/GanttChart.vue";
import AddSchedule from "@/components/modals/AddSchedule.vue";
import EditSchedule from "@/components/modals/schedule/EditSchedule.vue";
import { useTasksStore } from "@/store/tasksStore";

const tasksStore = useTasksStore();
const tasks = tasksStore.tasks;

// 모달 변수
const isAddScheduleOpen = ref(false);
const isEditScheduleOpen = ref(false);

const showAddScheduleModal = () => {
  isAddScheduleOpen.value = true;
};

const handleAddScheduleSubmit = (data) => {
  tasksStore.addTask(data); // tasksStore에 Task 추가
  console.log("New schedule submitted:", data);
};

const handleEditScheduleSubmit = (data) => {
  console.log("Edited schedule submitted:", data);
};

// 모달 함수
const showModal = () => {
  // 폼 상태 초기화
  resetFormState(); // 폼 초기화
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

// tasksStore의 tasks 변경을 감지하고 Gantt 차트를 업데이트하는 watch 추가
// watch(
//   () => tasksStore.tasks,
//   (newTasks) => {
//     console.log("Tasks updated. You can now trigger GanttChart update here.");

//     // GanttChart 업데이트 로직을 여기에 추가
//   },
//   { deep: true }
// );


// items 배열에 네모카드 정보를 넣음
const items = ref([
  {
    id: 1,
    shipId: "Ship01",
    progress: 60,
    currentTask: 6,
    totalTasks: 10,
    location: "15.234, -30.679",
  },
  {
    id: 2,
    shipId: "Ship02",
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
    title: "Trial Id",
    dataIndex: "trialId",
    width: "10%",
  },
  {
    title: "Start Time",
    dataIndex: "startTime",
    width: "10%",
  },
  {
    title: "End Time",
    dataIndex: "endTime",
    width: "15%",
  },
  {
    title: "Created Date",
    dataIndex: "createdDate",
    width: "15%",
  },
  {
    title: "Creator",
    dataIndex: "creator",
    width: "10%",
  },
  {
    title: "Total Activity",
    dataIndex: "totalActivity",
    width: "10%",
  },
  {
    title: "Version",
    dataIndex: "version",
    width: "5%",
  },
];

const data = ref([]);
const fetchData = async () => {
  try {
    const response = await getAllSchedule();
    console.log(response);
    data.value = [];

    response.forEach((schedule, index) => {
      data.value.push({
        trialId: schedule.trialId || "",
        startTime: schedule.startTime || "",
        endTime: schedule.endTime || null,
        createdDate: schedule.createdDate || "",
        creator: schedule.creator || null,
        totoalActivity: schedule.totoalActivity || "",
        version: schedule.version || null,
      });
    });

    console.log(data.value);
  } catch (error) {
    console.error(error);
  }
};
fetchData();

const dataSource = ref(data);
const editableData = reactive({});

const open = ref(false);

// 필터 모달 열기 상태
const filterModalVisible = ref(false);

// 필터 모달 닫기
const handleFilterModalToggle = (value) => {
  filterModalVisible.value = value;
};

// 필터된 데이터 저장용 상태
const filters = ref({});

// 필터 모달에서 필터 적용 시 호출되는 함수
const applyFilter = (newFilters) => {
  console.log("Received Filters:", newFilters); // 로그로 전달받은 필터 확인
  filters.value = newFilters;
};

// 필터된 데이터 계산
const filteredData = computed(() => {
  console.log("Current filter value:", filters.value); // 로그: 필터 값 확인

  // 필터가 없으면 전체 데이터를 반환
  if (Object.keys(filters.value).length === 0) {
    return data.value;
  }

  // search 필터가 있는 경우: 모든 컬럼에서 값 포함 여부 확인
  if (filters.value.search) {
    const searchValue = filters.value.search.toLowerCase();
    return data.value.filter((item) => {
      // 각 row의 모든 컬럼 값 중 하나라도 검색어를 포함하는지 확인
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchValue)
      );
    });
  }

  // 필터 조건에 맞게 데이터 필터링
  return data.value.filter((item) => {
    return Object.entries(filters.value).every(([key, value]) => {
      console.log("key : ", key);
      console.log("value : ", value);
      console.log("item", item);

      // rescueCapa 필터 처리
      if (key === "rescueCapa") {
        const minValue = parseFloat(value.min) || -Infinity; // 최소값 없으면 -Infinity
        const maxValue = parseFloat(value.max) || Infinity; // 최대값 없으면 Infinity
        const itemValue = parseFloat(item[key]) || 0; // 비교할 값, 없으면 0

        console.log(
          "minValue:",
          minValue,
          "maxValue:",
          maxValue,
          "itemValue:",
          itemValue
        );

        // item의 값이 min과 max 범위 내에 있는지 확인
        return itemValue >= minValue && itemValue <= maxValue;
      }

      // shipType 필터 처리 (배열이거나 비어있는 경우)
      if (key === "shipType") {
        if (Array.isArray(value) && value.length === 0) {
          // 배열이 비어있는 경우 모든 데이터를 포함
          console.log("Empty shipType array, showing all data.");
          return true;
        }
        if (Array.isArray(value)) {
          // 배열에 포함된 값 중 하나라도 일치하면 true 반환
          console.log("Checking shipType:", value, "against", item[key]);
          return value.includes(item[key]);
        }
      }

      // 일반 필터 처리 (문자열 일치 여부)
      const targetValue = item[key] ?? ""; // undefined 방지
      console.log("targetValue : ", targetValue);

      return targetValue.toLowerCase().includes(value.toLowerCase());
    });
  });
});

// 폼 상태 저장
const formState = reactive({
  put: false,
  shipId: "",
  shipType: null,
  shipName: "",
  imoNo: "",
  yardName: null,
  rescueCapa: "",
  trialTypes: [],
});

// 필터 모달 열기
const showFilterModal = async () => {
  filterModalVisible.value = true;
};

// 상태 관리 변수들 정의
const menuVisible = ref(false);
const contextMenu = ref(null);
const menuPosition = reactive({ x: 0, y: 0 });
const selectedRow = ref(null);

const customRow = (record) => ({
  onContextmenu: (event) => {
    onRowContextMenu(record, event); // 우클릭 핸들러 호출
  },
});
// 우클릭 이벤트 핸들러
const onRowContextMenu = (record, event) => {
  event.preventDefault(); // 기본 메뉴 차단
  selectedRow.value = record;
  menuVisible.value = true;

  menuPosition.x = event.clientX;
  menuPosition.y = event.clientY;

  // 메뉴 위치 설정
  setTimeout(() => {
    const menuEl = contextMenu.value;
    if (menuEl) {
      menuEl.style.left = `${menuPosition.x}px`;
      menuEl.style.top = `${menuPosition.y}px`;
      menuEl.style.position = "absolute";
      menuEl.style.zIndex = "1000";
    }
  }, 0);
};

// 수정 버튼 클릭 시
const handleEdit = () => {
  console.log("수정할 데이터:", selectedRow.value);
  setFormState(selectedRow.value);

  open.value = true;
  menuVisible.value = false;
};

// 삭제 버튼 클릭 시
const handleDelete = () => {
  console.log("삭제할 데이터:", selectedRow.value);
  Modal.confirm({
    title: "선박 정보 삭제",
    icon: createVNode(ExclamationCircleOutlined),
    content: "등록된 선박 정보를 삭제하시겠습니까?",
    okText: "Yes",
    okType: "danger",
    cancelText: "No",
    onOk() {
      console.log("OK");
      deleteRequest(selectedRow.value.shipId);
    },
    onCancel() {
      console.log("Cancel");
    },
  });
  menuVisible.value = false;
};

const deleteRequest = async (id) => {
  await deleteShip(id);
  reFetchData();
};

// 폼 상태 초기화 함수
const resetFormState = () => {
  Object.assign(formState, {
    put: false,
    shipId: "",
    shipType: null,
    shipName: "",
    imoNo: "",
    yardName: null,
    rescueCapa: "",
    trialTypes: [],
  });
};

// 폼 상태 초기화 함수
const setFormState = (data) => {
  console.log("data : ", data);
  Object.assign(formState, {
    put: true,
    shipId: data.shipId,
    shipType: data.shipType,
    shipName: data.shipName,
    imoNo: data.imoNo,
    yardName: data.yardName,
    rescueCapa: data.rescueCapa,
    trialTypes: data.trialTypes,
  });
};

// 메뉴 닫기 핸들러
const handleMenuClose = (open) => {
  menuVisible.value = open;
};

// 외부 클릭 감지 이벤트 핸들러
const handleClickOutside = (event) => {
  const menuEl = contextMenu.value;
  if (menuEl && !menuEl.contains(event.target)) {
    menuVisible.value = false;
  }
};

// 컴포넌트 마운트 시 외부 클릭 이벤트 리스너 등록
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// 모달 열림 상태를 업데이트하는 함수
const handleModalToggle = (value) => {
  open.value = value;
};

// 모달 제출 처리
const handleSubmit = (submittedData) => {
  console.log("Submitted form data:", submittedData);
};

const reFetchData = () => {
  fetchData();
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
