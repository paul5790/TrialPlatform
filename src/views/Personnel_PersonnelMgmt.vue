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
      <template #icon>
        <PlusOutlined />
      </template>
      새 인원정보 등록
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
                EngineLoad
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
              'PersonnelIdx',
              'Name',
              'Company',
              'Department',
              'Role',
              'Phone',
              'Email',
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

  <!-- 새 인원정보 등록 모달 컴포넌트 -->
    <NewPersonnelModal
      :open="open"
      :formState="formState"
      :num="peopleNum"
      @update:open="handleModalToggle"
      @submit="handleSubmit"
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
import { ref, h, reactive } from "vue";
import { cloneDeep } from "lodash-es";
import NewPersonnelModal from '@/components/modals/AddPeopleModal.vue';
import { getAllPersonnel } from "../api/Personnel/Personnel.js";

// 모달 변수
const loading = ref(false);


// props 변수
const open = ref(false);
const peopleNum = ref(0);
// 상태 변수
const formState = reactive({
  username: "",
});

// 선택한 메뉴를 저장할 변수
const selectedMenu = ref("Company"); // 기본 버튼 텍스트

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
    title: "PersonnelIdx",
    dataIndex: "PersonnelIdx",
    width: "10%",
  },
  {
    title: "Name",
    dataIndex: "Name",
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
    title: "Role",
    dataIndex: "Role",
    width: "10%",
  },
  {
    title: "Phone",
    dataIndex: "Phone",
    width: "15%",
  },
  {
    title: "Email",
    dataIndex: "Email",
    width: "15%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

const data = ref([]);

const fetchData = async () => {
  try {
    const response = await getAllPersonnel();
    console.log(response);

    // Personnel_idx를 기준으로 오름차순 정렬
    const sortedResponse = response.sort((a, b) => a.personnel_idx - b.personnel_idx);

    // 총 인원 수를 계산하여 저장
    peopleNum.value = sortedResponse.length;
    console.log(peopleNum.value);

    sortedResponse.forEach((personnel, index) => {
      data.value.push({
        key: index + 1,
        PersonnelIdx: personnel.personnel_idx || "",
        Name: personnel.name || "",
        Company: personnel.company || "",
        Department: personnel.department || "",
        Role: personnel.role || "",
        Phone: personnel.phone || "",
        Email: personnel.email || "",
      });
    });
    console.log(data.value)
  } catch (error) {
    console.error(error);
    message.value = `api 오류(${error})`;
  }
};

fetchData();



// data.push(
//   {
//     key: 1,
//     PersonnelId: `SD-1`,
//     Name: `JH-CHOIII`,
//     Company: `Xinnos`,
//     Department: `Electric Des..`,
//     Role: `Shipyard`,
//     Phone: `010-1234-4567`,
//     Email: `abcd1234@xinnos.com`,
//   },
//   {
//     key: 2,
//     PersonnelId: `SD-2`,
//     Name: `JM-KIM`,
//     Company: `Xinnos`,
//     Department: `Electric Des..`,
//     Role: `Shipyard`,
//     Phone: `010-6624-9567`,
//     Email: `ffcd1234@xinnos.com`,
//   },
//   {
//     key: 1,
//     PersonnelId: `SD-1`,
//     Name: `HH-KIM`,
//     Company: `Xinnos`,
//     Department: `Electric Des..`,
//     Role: `Class`,
//     Phone: `010-5436-4567`,
//     Email: `fhrd1234@xinnos.com`,
//   },
//   {
//     key: 1,
//     PersonnelId: `SD-1`,
//     Name: `SH-LEE`,
//     Company: `Xinnos`,
//     Department: `Electric Des..`,
//     Role: `Class`,
//     Phone: `010-1244-4567`,
//     Email: `brdr1234@xinnos.com`,
//   },
// );

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
const handleOk = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    open.value = false;
  }, 2000);
};
const handleCancel = () => {
  open.value = false;
};

// 모달 열림 상태를 업데이트하는 함수
const handleModalToggle = (value) => {
  open.value = value;
};

// 모달 제출 처리 함수
const handleSubmit = (submittedData) => {
  console.log('Submitted data:', submittedData);
  // 여기에 제출된 데이터를 처리하는 로직을 추가
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
