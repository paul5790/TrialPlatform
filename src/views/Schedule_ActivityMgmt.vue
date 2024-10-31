<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 20px"
  >
    <div class="button-container">
      <!-- 왼쪽 버튼 -->
      <a-button @click="showModal" type="primary" class="top-button">
        + 새 활동 추가
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
      <template #bodyCell="{ column, record }">
        <template
          v-if="
            column.dataIndex === 'shipTypes'
          "
        >
          <span>
            <a-tag v-for="(tag, index) in record.shipTypes" :key="index">
              {{ tag.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template
          v-else-if="
            column.dataIndex === 'trialTypes'
          "
        >
          <span>
            <a-tag v-for="(tag, index) in record.trialTypes" :key="index">
              {{ tag.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-else>
          {{ record[column.dataIndex] }}
        </template>
      </template>
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
  </a-space>
  <!-- 새 활동 추가 모달 -->
  <AddActivity
    :open="open"
    :formState="formState"
    @update:open="handleModalToggle"
    @submit="handleSubmit"
    @refreshData="reFetchData"
  />

  <!-- 필터 모달 컴포넌트 -->
  <ActivityFilter
    :open="filterModalVisible"
    @update:open="handleFilterModalToggle"
    @filter="applyFilter"
  />
</template>

<script setup>
import {
  DownloadOutlined,
  PlusOutlined,
  UserOutlined,
  DownOutlined,
  FilterOutlined,
} from "@ant-design/icons-vue";
import { getAllActivities } from "../api/Activities/Activities.js";
import { ref, h, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash-es";
import AddActivity from "@/components/modals/AddActivity.vue";
import ActivityFilter from "@/components/Filter/ActivityFilter.vue";

// 모달 변수
const loading = ref(false);
const open = ref(false);

// 필터 모달 열기 상태
const filterModalVisible = ref(false);

// 필터 모달 열기
const showFilterModal = () => {
  filterModalVisible.value = true;
};

// 필터 모달 닫기
const handleFilterModalToggle = (value) => {
  filterModalVisible.value = value;
};

// 폼 상태 저장
const formState = reactive({
  put: false,
  activityId: "",
  part: null,
  activityName: "",
  timeTaken: "",
  engineLoad: "",
});

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
    title: '선박 정보 삭제',
    icon: createVNode(ExclamationCircleOutlined),
    content: '등록된 선박 정보를 삭제하시겠습니까?',
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk () {
      console.log('OK');
      deleteRequest(selectedRow.value.shipId);
    },
    onCancel() {
      console.log('Cancel');
    },
  });
  menuVisible.value = false;
};

const deleteRequest = async (id) => {
  await deleteShip(id);
  reFetchData();
}

// 폼 상태 초기화 함수
const resetFormState = () => {
  Object.assign(formState, {
    put: false,
    activityId: "",
    part: null,
    activityName: "",
    timeTaken: "",
    engineLoad: "",
  });
};

// 폼 상태 초기화 함수
const setFormState = (data) => {
  console.log('data : ', data);
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

      // 일반 필터 처리 (문자열 일치 여부)
      const targetValue = item[key] ?? ""; // undefined 방지
      console.log("targetValue : ", targetValue);

      return targetValue.toLowerCase().includes(value.toLowerCase());
    });
  });
});

// 선택한 메뉴를 저장할 변수
const selectedMenu = ref("EngineLoad"); // 기본 버튼 텍스트

const handleButtonClick = (e) => {
  console.log("click left button", e);
};

// 메뉴 선택 시 호출되는 함수
const handleMenuClick = (e) => {
  console.log("click", e);
  selectedMenu.value =
    e.key === "1" ? "EngineLoad" : e.key === "2" ? "2nd menu item" : "3rd item";
};

// 데이터 테이블
const columns = [
  {
    title: "Activity Id",
    dataIndex: "activityId",
    width: "5%",
  },
  {
    title: "Activity Name",
    dataIndex: "activityName",
    width: "15%",
  },
  {
    title: "Time Taken",
    dataIndex: "timeTaken",
    width: "5%",
  },
  {
    title: "Engine Load",
    dataIndex: "engineLoad",
    width: "5%",
  },
  {
    title: "Part",
    dataIndex: "part",
    width: "7%",
  },
  {
    title: "Ship Types",
    dataIndex: "shipTypes",
    width: "15%",
  },
  {
    title: "Trial Types",
    dataIndex: "trialTypes",
    width: "15%",
  },
];

const data = ref([]);

const fetchData = async () => {
  try {
    const response = await getAllActivities();
    console.log(response);
    response.forEach((activity, index) => {
      data.value.push({
        key: index + 1,
        activityId: activity.activityId || "",
        activityName: activity.activityName || "",
        timeTaken: activity.timeTaken || 0,
        engineLoad: activity.engineLoad || 0,
        part: activity.part || "",
        shipTypes: activity.shipTypes || "",
        trialTypes: activity.trialTypes || "",
      });
    });
    console.log(data.value);
  } catch (error) {
    console.error(error);
  }
};

fetchData();

// 모달 함수
const showModal = () => {
  resetFormState();
  open.value = true;
};

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
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* 각 행마다 10px 마진 */
}

.form-label {
  flex: 0 0 120px; /* 고정된 너비로 레이블을 왼쪽에 */
  margin-right: 10px; /* 레이블과 입력 필드 사이의 간격 */
  text-align: left; /* 레이블을 오른쪽 정렬 */
}

.form-input {
  flex: 1; /* 입력 필드는 가능한 넓게 */
}
</style>

<style lang="less" scoped>
.demo-dropdown-wrap :deep(.ant-dropdown-button) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
