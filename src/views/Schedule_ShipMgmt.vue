<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 30px"
  >
    <a-button
      @click="showModal"
      type="primary"
      style="width: 200px; height: 40px"
    >
      선박 등록
    </a-button>

    <div style="display: flex; align-items: center; gap: 20px">
      
      <a-button
        :icon="h(FilterOutlined)"
        @click="showFilterModal"
        style="margin-left: 10px"
      >
        필터링
      </a-button>
    </div>

    <a-table :columns="columns" :data-source="filteredData" bordered @rowContextmenu="handleRowRightClick">
      <template #bodyCell="{ column, text, record }">
      <div>
        <a-input
          v-if="editableData[record.key]"
          v-model:value="editableData[record.key][column.dataIndex]"
          style="margin: -5px 0"
        />
        <template v-else>{{ text }}</template>
      </div>
    </template>
  </a-table>
  <!-- 우클릭 메뉴 Dropdown -->
  <a-dropdown
    v-model:open="contextMenuVisible"
    :trigger="['contextmenu']"
    :placement="'bottomLeft'"
  >
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="edit">수정</a-menu-item>
        <a-menu-item key="delete">삭제</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  </a-space>

  <!-- 문서 업로드 모달 컴포넌트 -->
  <DocUploadModal
    :open="open"
    :formState="formState"
    @update:open="handleModalToggle"
    @submit="handleSubmit"
  />

  <!-- 필터 모달 컴포넌트 -->
  <DocFilter
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
import { ref, h, reactive, computed } from "vue";
import { cloneDeep } from "lodash-es";
import DocUploadModal from "@/components/modals/AddDocuments.vue";
import DocFilter from "@/components/Filter/DocFilter.vue";

let data = [];
data.push(
  {
    key: 1,
    DocId: `01`,
    DocName: `Rule for Ship`,
    Version: `B`,
    TrialId: `SHI-SN1000-SEA`,
    ActicityId: `G-1`,
    Company: `Xinnos`,
    DocType: `Design`,
    Department: `Electric D..`,
    Creator: `JM KIM`,
    Uploader: `HM KIM`,
    UploadDate: `24.09.12T08:15:11.00`,
  },
  {
    key: 2,
    DocId: `02`,
    DocName: `Speed Test`,
    Version: `A`,
    TrialId: `SHI-SN1000-HABOR`,
    ActicityId: `G-2`,
    Company: `Xinnos`,
    DocType: `Procedure`,
    Department: `Electric D..`,
    Creator: `HM KIM`,
    Uploader: `HM KIM`,
    UploadDate: `24.09.14T01:15:11.00`,
  },
  {
    key: 3,
    DocId: `04`,
    DocName: `Test Program`,
    Version: `A`,
    TrialId: `SHI-SN1001-SEA`,
    ActicityId: `A-3`,
    Company: `Xinnos`,
    DocType: `Procedure`,
    Department: `Sea Trial`,
    Creator: `JM KIM`,
    Uploader: `HW LEE`,
    UploadDate: `24.09.11T08:15:11.00`,
  },
  {
    key: 4,
    DocId: `11`,
    DocName: `Test Result`,
    Version: `A`,
    TrialId: `HND-SN1002-SEA`,
    ActicityId: `B-1`,
    Company: `Xinnos`,
    DocType: `Result`,
    Department: `Sea Trial`,
    Creator: `CY KIM`,
    Uploader: `CY KIM`,
    UploadDate: `24.09.12T08:15:11.00`,
  }
);

// 문서 업로드 모달 변수
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
  console.log('Received Filters:', newFilters); // 로그로 전달받은 필터 확인
  filters.value = newFilters;
};

// 필터된 데이터 계산
const filteredData = computed(() => {
  console.log('Current filter value:', filters.value); // 로그: 필터 값 확인
  console.log('Original data:', data); // 로그: 필터 전 원본 데이터 확인

  // 필터가 없으면 전체 데이터를 반환
  if (Object.keys(filters.value).length === 0) {
    return data;
  }

  // 필터 조건에 맞게 데이터 필터링
  return data.filter((item) => {
    return Object.entries(filters.value).every(([key, value]) => {
      console.log('key : ', key);
      console.log('value : ', value);
      const targetValue = item[key] ?? ''; // undefined 방지
      console.log('targetValue : ', targetValue);
      return targetValue.toLowerCase().includes(value.toLowerCase());
    });
  });
});

// 폼 상태 저장
const formState = reactive({
  shipId: "",
  activityName: "",
  docId: "",
  docName: "",
  version: "",
  docType: "",
  department: "",
  creator: "",
  company: "",
  descriptionType: "",
  file: "",
});

const selectedActivityId = ref(null);
const selectedActivityName = ref(null);

// 필터 모달 열기
const showFilterModal = () => {
  filterModalVisible.value = true;
};

// 선택한 메뉴를 저장할 변수
const selectedMenu = ref("DocType"); // 기본 버튼 텍스트
// 메뉴 항목 리스트
const menuItems = ref([
  { key: "1", label: "RuleRegulation", icon: UserOutlined },
  { key: "2", label: "Design", icon: UserOutlined },
  { key: "3", label: "Plan", icon: UserOutlined },
  { key: "4", label: "Procedure", icon: UserOutlined },
  { key: "5", label: "Result", icon: UserOutlined },
  { key: "6", label: "Report", icon: UserOutlined },
]);

const handleButtonClick = (e) => {
  console.log("click left button", e);
};




// 현재 우클릭된 Row 상태
const currentRecord = ref(null);
const contextMenuVisible = ref(false);

// 열 클릭 이벤트
const handleRowRightClick = (record, event) => {
  event.preventDefault(); // 기본 우클릭 메뉴 비활성화
  currentRecord.value = record;
  contextMenuVisible.value = true; // 우클릭 메뉴 열기
};

// 메뉴 클릭 이벤트
const handleMenuClick = ({ key }) => {
  if (key === 'edit') {
    message.info(`Editing ${currentRecord.value.DocName}`);
  } else if (key === 'delete') {
    message.info(`Deleting ${currentRecord.value.DocName}`);
  }
  contextMenuVisible.value = false; // 메뉴 닫기
};







const columns = [
  {
    title: "Trial Id",
    dataIndex: "TrialId",
    width: "13%",
  },
  {
    title: "Doc Name",
    dataIndex: "DocName",
    width: "10%",
  },
  {
    title: "Doc Type",
    dataIndex: "DocType",
    width: "10%",
  },
  {
    title: "Acticity Id",
    dataIndex: "ActicityId",
    width: "10%",
  },
  {
    title: "Company",
    dataIndex: "Company",
    width: "10%",
  },
  {
    title: "Department",
    dataIndex: "Department",
    width: "10%",
  },
  {
    title: "Creator",
    dataIndex: "Creator",
    width: "10%",
  },
  {
    title: "Uploader",
    dataIndex: "Uploader",
    width: "10%",
  },
  {
    title: "UploadDate",
    dataIndex: "UploadDate",
    width: "15%",
  },
  {
    title: "Version",
    dataIndex: "Version",
    width: "10%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

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

// 필터된 데이터를 계산하여 표시
const filteredDataSource = computed(() => {
  return dataSource.value.filter((item) => {
    return true; // 여기에서 원하는 필터 조건을 추가할 수 있습니다.
  });
});

// 모달 함수
const showModal = () => {
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
</style>
