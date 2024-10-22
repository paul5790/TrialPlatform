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
      새 활동 추가
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
              'ActivityId',
              'ActivityName',
              'TimeTaken',
              'EngineLoad',
              'Part',
              'ShipTypes',
              'TrialType',
              'address',
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
  <a-modal v-model:open="open" title="새 활동 추가 / 활동 수정" @ok="handleOk">
    <a-form layout="vertical">
      <!-- Activity Id -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Activity Id:</label>
        <a-input
          v-model:value="formState.activityId"
          placeholder="Enter Activity Id"
          class="form-input"
        />
      </div>

      <!-- Activity Name -->
      <div class="form-item">
        <label class="form-label">Activity Name:</label>
        <a-input
          v-model:value="formState.activityName"
          placeholder="Enter Activity Name"
          class="form-input"
        />
      </div>

      <!-- Time Taken -->
      <div class="form-item">
        <label class="form-label">Time Taken:</label>
        <a-input
          v-model:value="formState.timeTaken"
          placeholder="Enter Time Taken"
          class="form-input"
        />
      </div>

      <!-- Engine Load -->
      <div class="form-item">
        <label class="form-label">Engine Load:</label>
        <a-input
          v-model:value="formState.engineLoad"
          placeholder="Enter Engine Load"
          class="form-input"
        />
      </div>

      <!-- Part -->
      <div class="form-item">
        <label class="form-label">Part:</label>
        <a-select
          v-model:value="formState.part"
          placeholder="Select Part"
          class="form-input"
        >
          <a-select-option value="option1">Option 1</a-select-option>
          <a-select-option value="option2">Option 2</a-select-option>
        </a-select>
      </div>

      <!-- Ship Types -->
      <div class="form-item">
        <label class="form-label">Ship Types:</label>
        <a-select
          v-model:value="formState.shipType"
          placeholder="Select Ship Type"
          class="form-input"
        >
          <a-select-option value="option1">Single</a-select-option>
          <a-select-option value="option2">Multiple</a-select-option>
        </a-select>
      </div>

      <!-- Trial Types -->
      <div class="form-item">
        <label class="form-label">Trial Types:</label>
        <a-select
          v-model:value="formState.trialType"
          placeholder="Select Trial Type"
          class="form-input"
        >
          <a-select-option value="option1">Single</a-select-option>
          <a-select-option value="option2">Multiple</a-select-option>
        </a-select>
      </div>
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk"
        >Submit</a-button
      >
    </template>
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
import { ref, h, reactive } from "vue";
import { cloneDeep } from "lodash-es";

// 모달 변수
const loading = ref(false);
const open = ref(false);

// 상태 변수
const formState = reactive({
  username: "",
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
    title: "ActivityId",
    dataIndex: "ActivityId",
    filters: [
      {
        text: "A-0",
        value: "A-0",
      },
      {
        text: "A-1",
        value: "A-1",
      },
      {
        text: "A-2",
        value: "A-2",
      },
    ],
    filterMode: "tree",
    filterSearch: true,
    onFilter: (value, record) => record.name.startsWith(value),
    width: "10%",
  },
  {
    title: "ActivityName",
    dataIndex: "ActivityName",
    filters: [
      {
        text: "Speed test",
        value: "Speed test",
      },
      {
        text: "Another test",
        value: "Another test",
      },
    ],
    filterMode: "tree",
    filterSearch: true,
    onFilter: (value, record) => record.name.startsWith(value),
    width: "15%",
  },
  {
    title: "TimeTaken",
    dataIndex: "TimeTaken",
    width: "10%",
  },
  {
    title: "EngineLoad",
    dataIndex: "EngineLoad",
    width: "10%",
  },
  {
    title: "Part",
    dataIndex: "Part",
    width: "10%",
  },
  {
    title: "ShipTypes",
    dataIndex: "ShipTypes",
    width: "15%",
  },
  {
    title: "TrialType",
    dataIndex: "TrialType",
    width: "15%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

const data = [];
// for (let i = 0; i < 7; i++) {
//   data.push({
//     key: i.toString(),
//     ActivityId: `A-${i}`,
//     ActivityName: `Speed test`,
//     TimeTaken: 120,
//     EngineLoad: 50,
//     Part: `General`,
//     ShipTypes: `Container`,
//     TrialType: `Offshore`,
//     address: `London Park no. ${i}`,
//   });
// }
data.push(
  {
    key: 1,
    ActivityId: `A-1`,
    ActivityName: `Speed test`,
    TimeTaken: 120,
    EngineLoad: 50,
    Part: `General`,
    ShipTypes: `Container`,
    TrialType: `Offshore`,
  },
  {
    key: 2,
    ActivityId: `G-1`,
    ActivityName: `Anchor test`,
    TimeTaken: 60,
    EngineLoad: 50,
    Part: `Hull`,
    ShipTypes: `Container`,
    TrialType: `Offshore`,
  },
  {
    key: 3,
    ActivityId: `A-2`,
    ActivityName: `Steering test`,
    TimeTaken: 210,
    EngineLoad: 50,
    Part: `Machinery`,
    ShipTypes: `Container`,
    TrialType: `Offshore`,
  },
  {
    key: 4,
    ActivityId: `B-18`,
    ActivityName: `M/E running test`,
    TimeTaken: 40,
    EngineLoad: 50,
    Part: `Electric`,
    ShipTypes: `Container`,
    TrialType: `Offshore`,
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
