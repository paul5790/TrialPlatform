<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 20px"
  >
    <div
      style="display: flex; align-items: center; justify-content: space-between;"
    >
      <!-- 왼쪽: RoomNo와 Ship Types -->
      <div style="display: flex;">
        <a-form-item label="Trial Id 선택:" style="width: 100%">
          <a-select
            v-model:value="selectedTrial"
            @change="handleSelectChange"
            placeholder="Select Ship Id"
            style="width: 300px;"
            :options="trialIdItems.map((item) => ({ value: item }))"
          >
          </a-select>
        </a-form-item>
      </div>
      <div style="height: 90px;">
        <a-form-item label="구명보트 탑승 인원 : " style="margin-bottom: 5px;">[ {{ numPerson }} ] / 99명 (총 탑승 가능 인원)</a-form-item>
        <a-form-item label="총 식수 인원 : " style="margin-bottom: 0px;">[ {{ numPerson }} ]명</a-form-item>
      </div>

      <!-- 오른쪽: 조회 버튼 -->
      <!-- <a-button style="width: 100px" @click="searchData">조회</a-button> -->
    </div>
    <div class="button-container">
      <!-- 왼쪽 버튼 -->
      <a-button @click="showModal" type="primary" class="top-button">
        + 승선자 명단 추가
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'trialTypes'">
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
    </div>
  </a-space>

  <!-- 문서 업로드 모달 컴포넌트 -->
  <BoardingUploadModal
    ref="addBoarding"
    :open="open"
    :formState="formState"
    :data="data"
    @update:open="handleModalToggle"
    @submit="handleSubmit"
    @refreshData="reFetchData"
  />

  <!-- 필터 모달 컴포넌트 -->
  <BoardingFilter
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
import { ref, h, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { cloneDeep } from "lodash-es";
import BoardingUploadModal from "@/components/modals/AddBoarding.vue";
import BoardingFilter from "@/components/Filter/BoardingFilter.vue";
import { getAllShips, deleteShip } from "../api/Ship/Ship.js";
import { getShipType } from "../api/ShipType.js";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { getTrial } from "@/api/Trial.js";
import { getBoarding } from "@/api/Personnel/Boarding.js"
import { createVNode } from 'vue';
import { Modal } from 'ant-design-vue';

const addBoarding = ref(null);


const trialIdItems = ref([]);
const selectedTrial = ref();

// Trial ID List 가져오기
const getTrialList = async () => {
  try {
    const trialValue = await getTrial();
    console.log('trialValue : ', trialValue);

    trialValue.forEach((trial, index) => {
      trialIdItems.value.push(trial.trialId);
    });
    selectedTrial.value = trialIdItems.value[0];
    
  } catch (error) {
    console.error(error);
  }
};

watch(
  selectedTrial,
  (newValue, oldValue) => {
    fetchData(newValue);
  }
);



const data = ref([]); // 테이블에 사용할 데이터
const numPerson = ref(0);
const statusList = ([]);

// 문서 업로드 모달 변수

const fetchData = async (trial) => {
  try {
    const response = await getBoarding(trial);
    console.log(response);
    data.value = [];
    numPerson.value = response.length;

    const status = new Set(); // 중복을 제거하기 위한 Set 생성
    
    response.forEach((board, index) => {
      data.value.push({
        personnelIdx: board.personnelIdx || "",
        name: board.name || "",
        company: board.company || "",
        boardingTime: board.boardingTime || "",
        deboardingTime: board.deboardingTime || "",
        boardingCount: board.boardingCount || 0,
        workDetails: board.workDetails || "",
        roomNo: board.roomNo || "",
        boardingStatus: board.boardingStatus || "",
      });
    });

    // Set을 배열로 변환하여 yardList에 저장
    statusList.value = Array.from(status);
    console.log('data', data.value);
  } catch (error) {
    console.error(error);
  }
};


const shipTypeList = ref([]); // Ship Type 목록 상태 저장
const getShipTypeList = async () => {
  try {
    shipTypeList.value = await getShipType();
  } catch (error) {
    console.error(error);
  }
};

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

      // boardingTime, deboardingTime 필터 처리
      if (key === "boardingTime" || key === "deboardingTime") {
        // min과 max 값이 유효한 날짜 문자열로 전달되었는지 확인하고 Date 객체로 변환
        const minValue = value.min ? new Date(value.min) : null; // 최소값이 없으면 null
        const maxValue = value.max ? new Date(value.max) : null; // 최대값이 없으면 null
        const itemValue = item[key] ? new Date(item[key]) : null;

        console.log("itemValue", itemValue);

        if (!itemValue) return false; // item 값이 없으면 필터 조건에 맞지 않음

        // 초를 00으로 설정
        if (minValue) minValue.setSeconds(0, 0);
        if (maxValue) maxValue.setSeconds(0, 0);
        if (itemValue) itemValue.setSeconds(0, 0);

        console.log("minValue:", minValue, "maxValue:", maxValue, "itemValue:", itemValue);

        // 범위 조건에서 null 값 처리
        return (!minValue || itemValue >= minValue) && (!maxValue || itemValue <= maxValue);
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
  await getShipTypeList();
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

// 모달 함수
const showModal = () => {
  resetFormState(); // 폼 초기화
    // 폼 상태 초기화
  if (addBoarding.value && addBoarding.value.dataInit) {
    addBoarding.value.dataInit();
  } else {
    console.error("dataInit 메서드가 없습니다.");
  }
  open.value = true;
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

const columns = [
    {
    title: "Name",
    dataIndex: "name",
    width: "10%",
  },
  {
    title: "Company",
    dataIndex: "company",
    width: "10%",
  },
  {
    title: "BoardingTime",
    dataIndex: "boardingTime",
    width: "15%",
  },
  {
    title: "DeboardingTime",
    dataIndex: "deboardingTime",
    width: "15%",
  },
  {
    title: "BoardingCount",
    dataIndex: "boardingCount",
    width: "10%",
  },
  {
    title: "WorkDetails",
    dataIndex: "workDetails",
    width: "15%",
  },
  {
    title: "RoomNo",
    dataIndex: "roomNo",
    width: "7%",
  },
  {
    title: "BoardingStatus",
    dataIndex: "boardingStatus",
    width: "10%",
  },
];

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
}

// 컴포넌트 마운트 시 외부 클릭 이벤트 리스너 등록
onMounted( async () => {
  document.addEventListener("click", handleClickOutside);
  await getTrialList();
  // fetchData(selectedTrial.value);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

</script>

<style lang="less" scoped>
.demo-dropdown-wrap :deep(.ant-dropdown-button) {
  margin-right: 8px;
  margin-bottom: 8px;
}
/* 우클릭 메뉴의 위치를 조정 */
.a-dropdown {
  position: absolute;
}

.context-menu-overlay {
  position: absolute;
  z-index: 1000;
}

.context-menu {
  position: absolute;
  z-index: 1000;
  border: 1px solid #d9d9d9; /* 경계선 색상 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 그림자 추가 */
  border-radius: 4px;
  overflow: hidden;
}

.context-menu .ant-menu-item {
  background-color: transparent; /* 항목 배경 기본값 */
  color: #333; /* 글자 색상 */
}

.context-menu .ant-menu-item:hover {
  background-color: #e6f7ff; /* 항목 선택 시 배경색 */
}
</style>
