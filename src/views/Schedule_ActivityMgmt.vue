<template>
  <a-space
    direction="vertical"
    style="width: 100%; height: 100%; padding: 30px"
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
  <!-- 새 활동 추가 모달 -->
  <AddActivity
      :open="open"
      :formState="formState"
      @update:open="handleModalToggle"
      @submit="handleSubmit"
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
import AddActivity from '@/components/modals/AddActivity.vue';
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
        const maxValue = parseFloat(value.max) || Infinity;  // 최대값 없으면 Infinity
        const itemValue = parseFloat(item[key]) || 0; // 비교할 값, 없으면 0

        console.log("minValue:", minValue, "maxValue:", maxValue, "itemValue:", itemValue);

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


// 폼 상태 저장
const formState = reactive({
  activityId: "",
  part: null,
  activityName: "",
  timeTaken: "",
  engineLoad: "",
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
    width: "5%",
  },
  {
    title: "ActivityName",
    dataIndex: "ActivityName",
    width: "15%",
  },
  {
    title: "TimeTaken",
    dataIndex: "TimeTaken",
    width: "5%",
  },
  {
    title: "EngineLoad",
    dataIndex: "EngineLoad",
    width: "5%",
  },
  {
    title: "Part",
    dataIndex: "Part",
    width: "7%",
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
];

const data = ref([]);
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

const fetchData = async () => {
  try {
    const response = await getAllActivities();
    console.log(response);
    // for (let i = 0; i < response.length; i++) {
    //   items.value.push({
    //     userId: response[i].id || "",
    //     userName: response[i].userName || "",
    //     userGroup: response[i].userGroup || "",
    //     department: response[i].department || "",
    //     phoneNumber: response[i].phoneNumber || "",
    //     description: response[i].description || "",
    //     email: response[i].email || "",
    //   });
    //   // items.value.push(response.data[i]);
    // }
    response.forEach((activity, index) => {
      data.value.push({
        key: index + 1,
        ActivityId: activity.activityId || "",
        ActivityName: activity.activityName || "",
        TimeTaken: activity.timeTaken || "",
        EngineLoad: activity.engineLoad || "",
        Part: activity.part || "",
        ShipTypes: "ShipTypes" || "",
        TrialType: "TrialTypes" || "",
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
//     ActivityId: `A-1`,
//     ActivityName: `Speed test`,
//     TimeTaken: 120,
//     EngineLoad: 50,
//     Part: `General`,
//     ShipTypes: `Container`,
//     TrialType: `Offshore`,
//   },
//   {
//     key: 2,
//     ActivityId: `G-1`,
//     ActivityName: `Anchor test`,
//     TimeTaken: 60,
//     EngineLoad: 50,
//     Part: `Hull`,
//     ShipTypes: `Container`,
//     TrialType: `Offshore`,
//   },
//   {
//     key: 3,
//     ActivityId: `A-2`,
//     ActivityName: `Steering test`,
//     TimeTaken: 210,
//     EngineLoad: 50,
//     Part: `Machinery`,
//     ShipTypes: `Container`,
//     TrialType: `Offshore`,
//   },
//   {
//     key: 4,
//     ActivityId: `B-18`,
//     ActivityName: `M/E running test`,
//     TimeTaken: 40,
//     EngineLoad: 50,
//     Part: `Electric`,
//     ShipTypes: `Container`,
//     TrialType: `Offshore`,
//   }
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

// 모달 제출 처리
const handleSubmit = (submittedData) => {
  console.log('Submitted form data:', submittedData);
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
