<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 20px"
  >
    <div class="button-container">
      <!-- 왼쪽 버튼 -->
      <a-button @click="showModal" type="primary" class="top-button">
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
        :data-source="filteredData"
        :row-key="(record) => record.key"
        bordered
        :customRow="customRow"
      />

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
  <DocUploadModal
    :open="open"
    :formState="formState"
    @update:open="handleModalToggle"
    @submit="handleSubmit"
  />

  <!-- 필터 모달 컴포넌트 -->
  <ShipFilter
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
import { ref, h, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash-es";
import DocUploadModal from "@/components/modals/AddShip.vue";
import ShipFilter from "@/components/Filter/ShipFilter.vue";
import { getAllShips } from "../api/Ship/Ship.js";

const data = ref([]); // 테이블에 사용할 데이터
const yardList = ref([]); // 중복되지 않은 yardName 리스트
// data.push(
//   {
//     key: 1,
//     shipId: `01`,
//     shipName: `AAA for Ship`,
//     shipType: `Design`,
//     imoNo: `Electric D..`,
//     yardName: `JM KIM`,
//     rescueCapa: `HM KIM`,
//     TrialType: `24.09.12T08:15:11.00`,
//   },
//     {
//     key: 1,
//     shipId: `02`,
//     shipName: `bbb for Ship`,
//     shipType: `Design`,
//     imoNo: `Electric D..`,
//     yardName: `JM KIM`,
//     rescueCapa: `HM KIM`,
//     TrialType: `24.09.12T08:15:11.00`,
//   },
//     {
//     key: 1,
//     shipId: `03`,
//     shipName: `ccc for Ship`,
//     shipType: `nyny`,
//     imoNo: `Electric D..`,
//     yardName: `JM qwer`,
//     rescueCapa: `HM KIM`,
//     TrialType: `24.09.12T08:15:11.00`,
//   },
//     {
//     key: 1,
//     shipId: `04`,
//     shipName: `ddd for Ship`,
//     shipType: `nyny`,
//     imoNo: `Electric D..`,
//     yardName: `JM tt`,
//     rescueCapa: `HM KIM`,
//     TrialType: `24.09.12T08:15:11.00`,
//   },
// );

// 문서 업로드 모달 변수

const fetchData = async () => {
  try {
    const response = await getAllShips();
    console.log(response);

    const yards = new Set(); // 중복을 제거하기 위한 Set 생성

    response.forEach((ship, index) => {
      data.value.push({
        shipId: ship.shipId || "",
        shipName: ship.shipName || "",
        shipType: ship.shipType || "",
        imoNo: ship.imoNo || "",
        yardName: ship.yardName || "",
        rescueCapa: ship.rescueCapa || "",
      });

      // yardName이 존재하면 Set에 추가
      if (ship.yardName) {
        yards.add(ship.yardName);
      }
    });

    // Set을 배열로 변환하여 yardList에 저장
    yardList.value = Array.from(yards);

    console.log(data.value);
    console.log('yardList.value', yardList.value); // 중복 제거된 yardName 리스트 출력
  } catch (error) {
    console.error(error);
    message.value = `api 오류(${error})`;
  }
};

fetchData();

const open = ref(false);

// 필터 모달 열기 상태
const filterModalVisible = ref(false);
// 필터된 데이터 저장용 상태
const filterValue = ref("");

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
      const targetValue = item[key] ?? ""; // undefined 방지
      console.log("targetValue : ", targetValue);
      return targetValue.toLowerCase().includes(value.toLowerCase());
    });
  });
});

// 폼 상태 저장
const formState = reactive({
  shipId: "",
  shipType: null,
  shipName: "haha",
  imoNo: "",
  yardName: "",
  rescueCapa: "",
});

// 필터 모달 열기
const showFilterModal = () => {
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
  // 폼 상태 초기화
  resetFormState(); // 폼 초기화
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
  menuVisible.value = false;
};

// 폼 상태 초기화 함수
const resetFormState = () => {
  Object.assign(formState, {
    shipId: "",
    shipType: null,
    shipName: "",
    imoNo: "",
    yardName: "",
    rescueCapa: "",
  });
};

// 폼 상태 초기화 함수
const setFormState = (data) => {
  Object.assign(formState, {
    shipId: data.shipId,
    shipType: data.shipType,
    shipName: data.shipName,
    imoNo: data.imoNo,
    yardName: data.yardName,
    rescueCapa: data.rescueCapa,
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
  document.addEventListener('click', handleClickOutside);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const columns = [
  {
    title: "Ship Id",
    dataIndex: "shipId",
    width: "10%",
  },
  {
    title: "Ship Name",
    dataIndex: "shipName",
    width: "10%",
  },
  {
    title: "Ship Type",
    dataIndex: "shipType",
    width: "10%",
  },
  {
    title: "IMO",
    dataIndex: "imoNo",
    width: "10%",
  },
  {
    title: "Yard Name",
    dataIndex: "yardName",
    width: "10%",
  },
  {
    title: "Rescue Capa",
    dataIndex: "rescueCapa",
    width: "10%",
  },
  {
    title: "Trial Type",
    dataIndex: "TrialType",
    width: "30%",
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

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 20px;
}

.top-button {
  width: 200px;
  height: 40px;
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
