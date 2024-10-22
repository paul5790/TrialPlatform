<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 30px"
  >
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <!-- 왼쪽: Part와 Ship Types -->
      <div style="display: flex; align-items: center; gap: 20px">
        <!-- Part -->
        <div style="display: flex; align-items: center">
          <label style="margin-right: 10px">Ship Id 선택 :</label>
          <a-select
            v-model:value="shipId"
            placeholder="Select Part"
            style="width: 150px"
          >
            <a-select-option value="option1">SN2286</a-select-option>
            <a-select-option value="option2">SN2287</a-select-option>
          </a-select>
        </div>

        <!-- Ship Types -->
        <div style="display: flex; align-items: center">
          <label style="margin-right: 10px">기간 :</label>
          <a-select
            v-model:value="period"
            placeholder="Select Ship Type"
            style="width: 150px"
          >
            <a-select-option value="single">00</a-select-option>
            <a-select-option value="multiple">01</a-select-option>
          </a-select>
        </div>
      </div>

      <!-- 오른쪽: 조회 버튼 -->
      <a-button style="width: 100px" @click="searchData">조회</a-button>
    </div>
    <div v-if="showTable" style="margin-top: 20px;">
      <a-button
        @click="showModal"
        type="primary"
        style="width: 200px; height: 40px"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        새 일일보고 작성
      </a-button>

      <a-table :columns="columns" :data-source="dataSource" bordered style="margin-top: 10px;">
        <template #bodyCell="{ column, text, record }">
          <template
            v-if="
              [
                'ShipId',
                'Writer',
                'CreatedDate',
                'ShipLoc',
                'ReleasedDate',
                '',
                '',
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
    </div>
  </a-space>
  <a-modal v-model:open="open" title="새 일일보고 작성 / 일일보고 수정" @ok="handleOk" :width="900">
    <a-form layout="vertical">
      <!-- Ship Id 선택 -->
      <a-form-item label="Ship Id 선택:" style="width: 50%;">
        <a-select v-model="m_shipId" @change="handleSelectChange" placeholder="Select Ship Id" style="width: 100%">
          <a-select-option value="SN2288">SN2288</a-select-option>
          <a-select-option value="SN2287">SN2287</a-select-option>
        </a-select>
      </a-form-item>

      <div v-if="writeAble">
      <!-- 작성자 -->
      <a-form-item label="작성자:" style="width: 50%;">
        <a-input v-model="m_writer" placeholder="작성자 입력" />
      </a-form-item>

      <!-- 선박위치 -->
      <a-form-item label="선박위치:">
        <div style="display: flex; gap: 10px;">
          <a-input v-model="m_latitude" placeholder="위도" />
          <a-input v-model="m_longitude" placeholder="경도" />
        </div>
      </a-form-item>

      <!-- Activity Status -->
      <h3>Activity Status:</h3>
      <a-table :data-source="activityData" :columns="activityColumns" pagination={false} bordered />

      <!-- Boarding State (ReadOnly) -->
      <h3>Boarding State:</h3>
      <a-table :data-source="boardingStateData" :columns="boardingStateColumns" pagination={false} bordered />

      </div>
    </a-form>
    

    <!-- Footer buttons (Return / Submit) -->
    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk">Submit</a-button>
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
import { ref, h, reactive, computed, watch } from "vue";
import { cloneDeep } from "lodash-es";

// 상태 변수
const showTable = ref(false);

const shipId = ref(null);
const period = ref(null);

// ------------------------------------------------- 모달 변수 -------------------------------------------------------
const loading = ref(false);
const open = ref(false);

const m_shipId = ref(null);
const m_writer = ref('');
const m_latitude = ref('');
const m_longitude = ref('');

const writeAble = ref(false);

// m_shipId를 직접 감시해야 합니다
watch(m_shipId, (newValue) => {
  console.log("?");  // 변경 사항이 감지되면 이 로그가 출력됩니다
  writeAble.value = newValue !== null;
});


// Activity Status 데이터
const activityData = [
  { key: '1', activityId: 'A-1', activityName: 'Speed test', startTime: null, endTime: null, status: 'Done' },
  { key: '2', activityId: 'G-1', activityName: 'Anchor test', startTime: null, endTime: null, status: 'In progress' },
  { key: '3', activityId: 'A-2', activityName: 'Steering test', startTime: null, endTime: null, status: 'Postponed' },
  { key: '4', activityId: 'B-18', activityName: 'M/E running test', startTime: null, endTime: null, status: 'Cancelled' },
];

const activityColumns = [
  {
    title: 'Activity Id',
    dataIndex: 'activityId',
    key: 'activityId',
  },
  {
    title: 'Activity Name',
    dataIndex: 'activityName',
    key: 'activityName',
  },
  {
    title: 'Start Time',
    dataIndex: 'startTime',
    key: 'startTime',
    customRender: (text, record) => {
      if (!record) return null;  // record가 undefined일 경우 안전하게 처리
      return h('a-date-picker', {
        value: record.startTime || null,  // startTime이 없으면 null 처리
        showTime: true,
        onChange: (value) => record.startTime = value,
      });
    },
  },
  {
    title: 'End Time',
    dataIndex: 'endTime',
    key: 'endTime',
    customRender: (text, record) => {
      if (!record) return null;  // record가 undefined일 경우 안전하게 처리
      return h('a-date-picker', {
        value: record.endTime || null,  // endTime이 없으면 null 처리
        showTime: true,
        onChange: (value) => record.endTime = value,
      });
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    customRender: (text, record) => {
      if (!record) return null;  // record가 undefined일 경우 안전하게 처리
      return h('a-select', {
        value: record.status,
        onChange: (value) => record.status = value,
      }, [
        h('a-select-option', { value: 'Done' }, 'Done'),
        h('a-select-option', { value: 'In progress' }, 'In progress'),
        h('a-select-option', { value: 'Postponed' }, 'Postponed'),
        h('a-select-option', { value: 'Cancelled' }, 'Cancelled'),
      ]);
    },
  },
  {
    title: '',
    key: 'attach',
    customRender: () => h('a-button', null, '문서 첨부'),
  },
];


// Boarding State 데이터 (ReadOnly)
const boardingStateData = [
  { key: '1', total: '31', shipyard: '10', owner: '2', class: '4', serviceEngineer: '10', captain: '2', helmsmen: '2', nurse: '1' },
];

const boardingStateColumns = [
  { title: 'Total', dataIndex: 'total', key: 'total' },
  { title: 'Shipyard', dataIndex: 'shipyard', key: 'shipyard' },
  { title: 'Owner', dataIndex: 'owner', key: 'owner' },
  { title: 'Class', dataIndex: 'class', key: 'class' },
  { title: 'Service Engineer', dataIndex: 'serviceEngineer', key: 'serviceEngineer' },
  { title: 'Captain', dataIndex: 'captain', key: 'captain' },
  { title: 'Helmsmen', dataIndex: 'helmsmen', key: 'helmsmen' },
  { title: 'Nurse', dataIndex: 'nurse', key: 'nurse' },
];


// 선택한 메뉴를 저장할 변수
const selectedMenu = ref("Button"); // 기본 버튼 텍스트


// 데이터 테이블
const columns = [
  {
    title: "ShipId",
    dataIndex: "ShipId",
    width: "10%",
  },
  {
    title: "Writer",
    dataIndex: "Writer",
    width: "10%",
  },
  {
    title: "CreatedDate",
    dataIndex: "CreatedDate",
    width: "10%",
  },
  {
    title: "ShipLoc",
    dataIndex: "ShipLoc",
    width: "10%",
  },
  {
    title: "ReleasedDate",
    dataIndex: "ReleasedDate",
    width: "10%",
  },
  {
    title: "",
    dataIndex: "null",
    width: "10%",
  },
  {
    title: "",
    dataIndex: "null",
    width: "10%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

const data = [];
for (let i = 0; i < 5; i++) {
  data.push({
    key: i.toString(),
    ShipId: `A-${i}`,
    Writer: `Speed test`,
    CreatedDate: 120,
    ShipLoc: 50,
    ReleasedDate: `General`,
    null: ``,
  });
}

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

// 조회 버튼 클릭시
const searchData = () => {
  showTable.value = true;
};

// 모달 함수
const handleSelectChange = (value) => {
  console.log("Selected Ship Id:", value);  // 선택된 값이 올바르게 출력되는지 확인
  m_shipId.value = value;  // 선택된 값을 직접 업데이트
};

const showModal = () => {
  open.value = true;
};
const handleOk = () => {
  console.log(m_shipId.value);
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

<style lang="less" scoped>
.demo-dropdown-wrap :deep(.ant-dropdown-button) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
