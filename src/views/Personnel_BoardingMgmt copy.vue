<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 30px"
  >
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <!-- 왼쪽: RoomNo와 Ship Types -->
      <div style="display: flex; align-items: center; gap: 20px">
        <a-form-item label="Ship Id 선택:" style="width: 100%">
          <a-select
            v-model:value="shipId"
            @change="handleSelectChange"
            placeholder="Select Ship Id"
            style="width: 100%"
          >
            <a-select-option value="SN2288">SN2288</a-select-option>
            <a-select-option value="SN2287">SN2287</a-select-option>
          </a-select>
        </a-form-item>
      </div>

      <!-- 오른쪽: 조회 버튼 -->
      <!-- <a-button style="width: 100px" @click="searchData">조회</a-button> -->
    </div>
    <div v-if="showTable" style="margin-top: 20px">
      <a-button
        @click="showModal"
        type="primary"
        style="width: 200px; height: 40px"
      >
        승선자 명단 추가
      </a-button>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        bordered
        style="margin-top: 10px"
      >
        <template #bodyCell="{ column, text, record }">
          <template
            v-if="
              [
                'Name',
                'Company',
                'ScheduleBoardingDate',
                'BoardingStatus',
                'RoomNo',
                'WorkDetails',
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
  <a-modal
    v-model:open="open"
    title="새 일일보고 작성 / 일일보고 수정"
    @ok="handleOk"
    :width="900"
  >
    <a-form layout="vertical">
      <a-button
        @click="showModal"
        type="primary"
        style="width: 200px; height: 40px; margin-top: 20px"
      >
        승선자 명단 추가
      </a-button>

      <a-input v-model:value="Names" style="margin-top: 10px" />

      <a-table
        :columns="columns2"
        :data-source="dataSource2"
        :row-selection="rowSelection"
        bordered
        style="margin-top: 10px"
      >
      </a-table>
    </a-form>

    <!-- Footer buttons (Return / Submit) -->
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

const writeAble = ref(false);

watch(shipId, (newValue) => {
  console.log("?"); // 변경 사항이 감지되면 이 로그가 출력됩니다
  showTable.value = newValue !== null;
});

// m_shipId를 직접 감시해야 합니다
watch(m_shipId, (newValue) => {
  console.log("?"); // 변경 사항이 감지되면 이 로그가 출력됩니다
  writeAble.value = newValue !== null;
});

// 선택한 메뉴를 저장할 변수
const selectedMenu = ref("Button"); // 기본 버튼 텍스트

// 데이터 테이블
const columns = [
  {
    title: "Name",
    dataIndex: "Name",
    width: "12%",
  },
  {
    title: "Company",
    dataIndex: "Company",
    width: "15%",
  },
  {
    title: "ScheduleBoardingDate",
    dataIndex: "ScheduleBoardingDate",
    width: "15%",
  },
  {
    title: "BoardingStatus",
    dataIndex: "BoardingStatus",
    width: "15%",
  },
  {
    title: "RoomNo",
    dataIndex: "RoomNo",
    width: "15%",
  },
  {
    title: "WorkDetails",
    dataIndex: "WorkDetails",
    width: "15%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    width: "5%",
  },
];

// 데이터 테이블
const columns2 = [
  {
    title: "PersonnelId",
    dataIndex: "PersonnelId",
    width: "10%",
  },
  {
    title: "Name",
    dataIndex: "Name",
    width: "15%",
  },
  {
    title: "Company",
    dataIndex: "Company",
    width: "10%",
  },
  {
    title: "Department",
    dataIndex: "Department",
    width: "15%",
  },
  {
    title: "Role",
    dataIndex: "Role",
    width: "10%",
  },
  {
    title: "Phone",
    dataIndex: "Phone",
    width: "20%",
  },
  {
    title: "Email",
    dataIndex: "Email",
    width: "20%",
  },
];

const Names = ref("");

const rowSelection = ref({
  onChange: (selectedRowKeys, selectedRows) => {
    //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    //console.log(record, selected, selectedRows);
    // console.log(selectedRows);
    // Name 값만 추출하는 함수
    const getNames = (rows) => {
      if (!rows || rows.length === 0) {
        return ""; // 값이 없으면 빈 문자열 반환
      }

      // 배열이 1개일 때는 해당 Name만 반환
      if (rows.length === 1) {
        return rows[0].Name;
      }

      // 배열이 2개 이상일 때는 Name들을 쉼표로 구분하여 반환
      return rows.map((row) => row.Name).join(", ");
    };

    // Names 변수에 결과 저장
    const names = getNames(selectedRows);

    Names.value = names;

    // 결과 출력
    console.log(names); // "사람0, 사람1"
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    //console.log(selected, selectedRows, changeRows);
  },
});

const data = [];
data.push(
  {
    key: 1,
    Name: `JH-CHOI`,
    Company: `Xinnos`,
    ScheduleBoardingDate: `2024.09.09T08:00`,
    BoardingStatus: `Onboard`,
    RoomNo: `305`,
    WorkDetails: `Thruster test ...`,
  },
  {
    key: 2,
    Name: `JM-KIM`,
    Company: `Xinnos`,
    ScheduleBoardingDate: `2024.09.09T16:00`,
    BoardingStatus: `Onboard`,
    RoomNo: `308`,
    WorkDetails: `DP commission ...`,
  },
  {
    key: 3,
    Name: `HH-KIM`,
    Company: `Xinnos`,
    ScheduleBoardingDate: `2024.09.10T08:00`,
    BoardingStatus: `Onboard`,
    RoomNo: `107`,
    WorkDetails: `Inspect network ...`,
  },
  {
    key: 4,
    Name: `SH-LEE`,
    Company: `Xinnos`,
    ScheduleBoardingDate: `2024.09.10T16:00`,
    BoardingStatus: `Onboard`,
    RoomNo: ``,
    WorkDetails: ``,
  }
);

const data2 = [];
data2.push(
  {
    key: 1,
    PersonnelId: `SD-1`,
    Name: `JH-CHOI`,
    Company: `Xinnos`,
    Department: `Electric Des..`,
    Role: `Shipyard`,
    Phone: `010-1234-4567`,
    Email: `abcd1234@xinnos.com`,
  },
  {
    key: 2,
    PersonnelId: `SD-2`,
    Name: `JM-KIM`,
    Company: `Xinnos`,
    Department: `Electric Des..`,
    Role: `Shipyard`,
    Phone: `010-6624-9567`,
    Email: `ffcd1234@xinnos.com`,
  },
  {
    key: 1,
    PersonnelId: `SD-1`,
    Name: `HH-KIM`,
    Company: `Xinnos`,
    Department: `Electric Des..`,
    Role: `Class`,
    Phone: `010-5436-4567`,
    Email: `fhrd1234@xinnos.com`,
  },
  {
    key: 1,
    PersonnelId: `SD-1`,
    Name: `SH-LEE`,
    Company: `Xinnos`,
    Department: `Electric Des..`,
    Role: `Class`,
    Phone: `010-1244-4567`,
    Email: `brdr1234@xinnos.com`,
  },
);

const dataSource = ref(data);
const dataSource2 = ref(data2)
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
  console.log(shipId.value);
  showTable.value = true;
};

// 모달 함수
const handleSelectChange = (value) => {
  console.log("Selected Ship Id:", value); // 선택된 값이 올바르게 출력되는지 확인
  m_shipId.value = value; // 선택된 값을 직접 업데이트
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
