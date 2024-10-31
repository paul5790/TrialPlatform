<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 20px"
  >
    <div class="button-container">
      <!-- 왼쪽 버튼 -->
      <a-button @click="showModal" type="primary" class="top-button">
        + 새 인원정보 등록
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

  <!-- 문서 업로드 모달 컴포넌트 -->
  <PersonUploadModal
    :open="open"
    :formState="formState"
    :yardList="yardList"
    @update:open="handleModalToggle"
    @submit="handleSubmit"
    @refreshData="reFetchData"
  />

  <!-- 필터 모달 컴포넌트 -->
  <PersonnelFilter
    :open="filterModalVisible"
    @update:open="handleFilterModalToggle"
    @filter="applyFilter"
  />
</template>

<script setup>
import {
  FilterOutlined,
} from "@ant-design/icons-vue";
import { ref, h, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash-es";
import PersonUploadModal from "@/components/modals/AddPeopleModal.vue";
import PersonnelFilter from "@/components/Filter/PersonnelFilter.vue";
import { getAllPersonnel, deletePersonnel } from "../api/Personnel/Personnel.js";
import { getShipType } from "../api/ShipType.js";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import { Modal } from 'ant-design-vue';

const data = ref([]); // 테이블에 사용할 데이터
const yardList = ref([]); // 중복되지 않은 yardName 리스트
const peopleNum = ref();

// 인원 업로드 모달 변수
const fetchData = async () => {
  try {
    const response = await getAllPersonnel();
    console.log(response);
    data.value = [];

    // personnelIdx를 기준으로 오름차순 정렬
    const sortedResponse = response.sort((a, b) => {
      const idxA = a.personnelIdx || a.personnel_idx || 0; // 키 일관성 처리
      const idxB = b.personnelIdx || b.personnel_idx || 0;
      return idxA - idxB; // 오름차순 정렬
    });

    // 총 인원 수를 계산하여 저장
    peopleNum.value = sortedResponse.length;
    console.log(peopleNum.value);

    sortedResponse.forEach((personnel, index) => {
      data.value.push({
        personnelIdx: personnel.personnelIdx || 0,
        name: personnel.name || "",
        company: personnel.company || "",
        department: personnel.department || "",
        role: personnel.role || "",
        phone: personnel.phone || "",
        email: personnel.email || "",
      });
    });
    console.log(data.value)
  } catch (error) {
    console.error(error);
  }
};

fetchData();


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

      // shipType 필터 처리 (배열이거나 비어있는 경우)
      if (key === "role") {
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
  personnelIdx: "",
  name: "",
  role: null,
  company: "",
  department: "",
  phone: "",
  email: "",
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
  Modal.confirm({
    title: '선박 정보 삭제',
    icon: createVNode(ExclamationCircleOutlined),
    content: '등록된 선박 정보를 삭제하시겠습니까?',
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk () {
      console.log('OK');
      deleteRequest(selectedRow.value.personnelIdx);
    },
    onCancel() {
      console.log('Cancel');
    },
  });
  menuVisible.value = false;
};

const deleteRequest = async (id) => {
  await deletePersonnel(id);
  reFetchData();
}

// 폼 상태 초기화 함수
const resetFormState = () => {
  Object.assign(formState, {
    put: false,
    personnelIdx: "",
    name: "",
    role: null,
    company: "",
    department: "",
    phone: "",
    email: "",
  });
};

// 폼 상태 초기화 함수
const setFormState = (data) => {
  console.log('data : ',data);
  Object.assign(formState, {
    put: true,
    personnelIdx: data.personnelIdx,
    name: data.name,
    role: data.role,
    company: data.company,
    department: data.department,
    phone: data.phone,
    email: data.email,
  });
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
    title: "Department",
    dataIndex: "department",
    width: "10%",
  },
  {
    title: "Role",
    dataIndex: "role",
    width: "10%",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    width: "15%",
  },
  {
    title: "Email",
    dataIndex: "email",
    width: "15%",
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
