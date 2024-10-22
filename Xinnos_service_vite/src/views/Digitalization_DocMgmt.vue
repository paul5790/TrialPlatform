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
      문서 업로드
    </a-button>
    <div style="display: flex; align-items: center; gap: 20px">
      <a-card
        style="width: 85%; height: 50px"
        body-style="padding: 7.5px; padding-left: 0px; display: flex; align-items: center; gap: 10px;"
      >
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item v-for="item in menuItems" :key="item.key">
                <component :is="item.icon" />
                {{ item.label }}
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
        <a-button
          :icon="h(FilterOutlined)"
          @click="showFilterModal"
          style="margin-left: 10px"
        >
        </a-button>
        <a-input style="margin-left: 10px" v-model:value="formState.username" />
      </a-card>
      <a-button type="primary" style="width: 200px; height: 40px">
        필터링
      </a-button>
    </div>

    <a-table :columns="columns" :data-source="filteredDataSource" bordered>
      <template #bodyCell="{ column, text, record }">
        <template
          v-if="
            [
              'DocId',
              'DocName',
              'Version',
              'ShipId',
              'ActicityId',
              'DocType',
              'Department',
              'ContactPerson',
              'Uploader',
              'UploadDate',
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

  <!-- 문서 업로드 모달 -->
  <a-modal v-model:open="open" title="Title" @ok="handleOk">
    <a-form layout="vertical">
      <!-- Ship Id -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Ship Id :</label>
        <a-select
          v-model:value="formState.shipId"
          placeholder="Select Ship Id"
          class="form-input"
        >
          <a-select-option value="option1">SN2286</a-select-option>
          <a-select-option value="option2">SN2287</a-select-option>
        </a-select>
      </div>

      <!-- Activity Name -->
      <div class="form-item">
        <label class="form-label">Activity Name :</label>
        <a-select
          v-model:value="formState.activityName"
          placeholder="Select Activity Name"
          class="form-input"
        >
          <a-select-option value="option1">Speed test</a-select-option>
          <a-select-option value="option2">Anchor test</a-select-option>
        </a-select>
      </div>

      <!-- Doc. id -->
      <div class="form-item">
        <label class="form-label">Doc. id :</label>
        <a-input
          v-model:value="formState.docId"
          placeholder="Enter Doc. id"
          class="form-input"
        />
      </div>

      <!-- Doc. Name -->
      <div class="form-item">
        <label class="form-label">Doc. Name :</label>
        <a-input
          v-model:value="formState.docName"
          placeholder="Enter Doc. Name"
          class="form-input"
        />
      </div>

      <!-- Version -->
      <div class="form-item">
        <label class="form-label">Version :</label>
        <a-input
          v-model:value="formState.version"
          placeholder="Enter Version"
          class="form-input"
        />
      </div>

      <!-- Doc. Type -->
      <div class="form-item">
        <label class="form-label">Doc. Type :</label>
        <a-select
          v-model:value="formState.docType"
          placeholder="Select Doc. Type"
          class="form-input"
        >
          <a-select-option value="option1">RuleRegulation</a-select-option>
          <a-select-option value="option2">Option 2</a-select-option>
        </a-select>
      </div>

      <!-- Department -->
      <div class="form-item">
        <label class="form-label">Department:</label>
        <a-input
          v-model:value="formState.department"
          placeholder="Enter Department"
          class="form-input"
        />
      </div>

      <!-- Contact Person -->
      <div class="form-item">
        <label class="form-label">Contact Person :</label>
        <a-input
          v-model:value="formState.contactPerson"
          placeholder="Enter Contact Person"
          class="form-input"
        />
      </div>

      <!-- Description Type -->
      <div class="form-item">
        <label class="form-label">Description Type :</label>
        <a-select
          v-model:value="formState.descriptionType"
          placeholder="Select Description Type"
          class="form-input"
        >
          <a-select-option value="option1">Information</a-select-option>
          <a-select-option value="option2">Issue</a-select-option>
        </a-select>
      </div>

      <div class="form-item">
        <a-textarea
          v-model:value="formState.description"
          placeholder="Enter Description"
          class="form-input"
          :rows="2"
        />
      </div>

      <!-- File -->
      <div class="form-item">
        <label class="form-label">File :</label>
        <a-upload :before-upload="handleFileSelect" show-upload-list="false">
          <a-button icon="upload">문서 첨부</a-button>
        </a-upload>
      </div>

      <!-- <a-form-item label="File:">
        <a-upload :before-upload="handleFileSelect" show-upload-list="false">
          <a-button icon="upload">문서 첨부</a-button>
        </a-upload>
      </a-form-item> -->
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk"
        >Submit</a-button
      >
    </template>

    <!-- Doc.Type 추가 모달 -->
    <a-modal
      v-model:open="addTypeModalVisible"
      title="Add Doc Type"
      @ok="handleAddTypeOk"
    >
      <a-input v-model="newDocType" placeholder="Enter new doc type" />
    </a-modal>
  </a-modal>

  <!-- 필터링 모달 -->
  <a-modal
    v-model:open="filterModalVisible"
    title="필터 설정"
    @ok="applyFilters"
  >
    <a-form layout="vertical">
      <a-form-item label="ActivityId">
        <a-select v-model="selectedActivityId" placeholder="Select ActivityId">
          <a-select-option v-for="item in activityIdOptions" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="ActivityName">
        <a-select
          v-model="selectedActivityName"
          placeholder="Select ActivityName"
        >
          <a-select-option v-for="item in activityNameOptions" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <!-- 필요한 필터 추가 -->
    </a-form>
  </a-modal>
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

// 문서 업로드 모달 변수
const loading = ref(false);
const open = ref(false);
const addTypeModalVisible = ref(false); // Doc.Type 추가 모달 상태

// 필터 모달 열기 상태
const filterModalVisible = ref(false);

// 필터 옵션
const activityIdOptions = ["A-0", "A-1", "A-2"];
const activityNameOptions = ["Speed test", "Other activity"];

// 폼 상태 저장
const formState = reactive({
  shipId: "",
  activityName: "",
  docId: "",
  docName: "",
  version: "",
  docType: "",
  department: "",
  contactPerson: "",
  descriptionType: "",
  file: "",
});

const selectedActivityId = ref(null);
const selectedActivityName = ref(null);

// 필터 모달 열기
const showFilterModal = () => {
  filterModalVisible.value = true;
};

// 필터 적용 함수
const applyFilters = () => {
  filterModalVisible.value = false;
  // 로그로 확인
  console.log("Selected ActivityId:", selectedActivityId);
  console.log("Selected ActivityName:", selectedActivityName);
};

// Doc.Type 리스트
const docTypes = ref(["Type 1", "Type 2", "Type 3"]);

// 새로운 Doc.Type 저장용 변수
const newDocType = ref("");

// 문서 첨부 파일 선택 핸들러
const handleFileSelect = (file) => {
  formState.fileName = file.name;
  return false; // 업로드 방지
};

// Doc.Type 추가 모달 열기
const showAddTypeModal = () => {
  addTypeModalVisible.value = true;
};

// Doc.Type 추가 확인
const handleAddTypeOk = () => {
  if (newDocType.value) {
    docTypes.value.push(newDocType.value);
    formState.docType = newDocType.value;
  }
  newDocType.value = "";
  addTypeModalVisible.value = false;
};

// 모달 확인 핸들러
const handleOk = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    open.value = false;
  }, 2000);
};

// 모달 취소 핸들러
const handleCancel = () => {
  open.value = false;
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

// 메뉴 선택 시 호출되는 함수
const handleMenuClick = (e) => {
  console.log("click", e);
  const selectedItem = menuItems.value.find((item) => item.key === e.key);
  selectedMenu.value = selectedItem ? selectedItem.label : "Unknown";
};

// 데이터 테이블
// const columns = [
//   {
//     title: "ActivityId",
//     dataIndex: "ActivityId",
//     width: "10%",
//   },
//   {
//     title: "ActivityName",
//     dataIndex: "ActivityName",
//     width: "15%",
//   },
//   {
//     title: "TimeTaken",
//     dataIndex: "TimeTaken",
//     width: "10%",
//   },
//   {
//     title: "EngineLoad",
//     dataIndex: "EngineLoad",
//     width: "10%",
//   },
//   {
//     title: "Part",
//     dataIndex: "Part",
//     width: "10%",
//   },
//   {
//     title: "ShipTypes",
//     dataIndex: "ShipTypes",
//     width: "15%",
//   },
//   {
//     title: "TrialType",
//     dataIndex: "TrialType",
//     width: "15%",
//   },
//   {
//     title: "operation",
//     dataIndex: "operation",
//   },
// ];

const columns = [
  {
    title: "DocId",
    dataIndex: "DocId",
    width: "5%",
    filters: [
      { text: "A-0", value: "A-0" },
      { text: "A-1", value: "A-1" },
      { text: "A-2", value: "A-2" },
      // 필터 목록 추가 가능
    ],
    onFilter: (value, record) => record.ActivityId.includes(value),
  },
  {
    title: "DocName",
    dataIndex: "DocName",
    width: "10%",
    filters: [
      { text: "Speed test", value: "Speed test" },
      { text: "Other activity", value: "Other activity" },
    ],
    onFilter: (value, record) => record.ActivityName.includes(value),
  },
  {
    title: "Version",
    dataIndex: "Version",
    width: "10%",
  },
  {
    title: "ShipId",
    dataIndex: "ShipId",
    width: "10%",
  },
  {
    title: "ActicityId",
    dataIndex: "ActicityId",
    width: "5%",
  },
  {
    title: "DocType",
    dataIndex: "DocType",
    width: "15%",
  },
  {
    title: "Department",
    dataIndex: "Department",
    width: "10%",
  },
  {
    title: "ContactPerson",
    dataIndex: "ContactPerson",
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
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

const data = [];
data.push(
  {
    key: 1,
    DocId: `01`,
    DocName: `Test Plan`,
    Version: `Latest`,
    ShipId: `SN22..`,
    ActicityId: `G-1`,
    DocType: `Design`,
    Department: `Electric D..`,
    ContactPerson: `JM KIM`,
    Uploader: `HM KIM`,
    UploadDate: `24.09.12T08:15:11.00`,
  },
  {
    key: 2,
    DocId: `02`,
    DocName: `Test Plan`,
    Version: `Latest`,
    ShipId: `SN22..`,
    ActicityId: `G-2`,
    DocType: `RuleRegu..`,
    Department: `Electric D..`,
    ContactPerson: `HM KIM`,
    Uploader: `HM KIM`,
    UploadDate: `24.09.14T01:15:11.00`,
  },
  {
    key: 3,
    DocId: `04`,
    DocName: `Test Program`,
    Version: `Latest`,
    ShipId: `SN22..`,
    ActicityId: `A-3`,
    DocType: `Procedure`,
    Department: `Sea Trial`,
    ContactPerson: `JM KIM`,
    Uploader: `HW LEE`,
    UploadDate: `24.09.11T08:15:11.00`,
  },
  {
    key: 4,
    DocId: `11`,
    DocName: `Test Result`,
    Version: `Latest`,
    ShipId: `SN22..`,
    ActicityId: `B-1`,
    DocType: `Result`,
    Department: `Sea Trial`,
    ContactPerson: `CY KIM`,
    Uploader: `CY KIM`,
    UploadDate: `24.09.12T08:15:11.00`,
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
</script>

<style lang="less" scoped>
.demo-dropdown-wrap :deep(.ant-dropdown-button) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
