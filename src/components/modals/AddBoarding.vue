<template>
  <a-modal
    :open="open"
    title="승선자 명단 추가"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="1000px"
  >
    <a-form layout="vertical">
      <a-table
        :columns="columns2"
        :data-source="filteredData"
        :row-selection="rowSelection"
        :pagination="{
          pageSize: 1000,
        }"
        :scroll="{ y: 240 }"
        :row-key="record => record.name"
        bordered
        :customRow="customRow"
        size="small"
        style="margin-top: 10px"
      >
      </a-table>

      <a-input v-model:value="Names" style="margin-top: 10px" />
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">Return</a-button>
      <a-button
        key="submit"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
        >Submit</a-button
      >
    </template>
  </a-modal>
</template>

<script setup>
import {
  ref,
  reactive,
  defineComponent,
  defineProps,
  watch,
  computed,
} from "vue";
import { postShip, putShip } from "../../api/Ship/Ship.js";
import { getAllPersonnel } from "@/api/Personnel/Personnel.js";
const props = defineProps({
  open: Boolean, // 부모로부터 받는 open 상태
  formState: Object, // 폼 데이터 상태
});

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

watch(
  () => props.formState, // 감시할 대상
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      // 새 값이 존재할 경우 복사
      Object.assign(formState, newVal);
    } else {
      // 값이 없을 경우 초기 상태로 설정
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
    }
  },
  { immediate: true, deep: true } // 컴포넌트가 마운트될 때 즉시 실행
);

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true,
    },
  },
  render() {
    return this.vnodes;
  },
});

// 데이터 테이블
const columns2 = [
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
    width: "15%",
  },
  {
    title: "Role",
    dataIndex: "role",
    width: "15%",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    width: "20%",
  },
  {
    title: "Email",
    dataIndex: "email",
    width: "20%",
  },
];

const data = ref([]); // 테이블에 사용할 데이터
// Trial Type List 가져오기
const fetchData = async () => {
  try {
    const response = await getAllPersonnel();
    console.log("맞음?", response);
    data.value = [];

    // personnelIdx를 기준으로 오름차순 정렬
    const sortedResponse = response.sort((a, b) => {
      const idxA = a.personnelIdx || a.personnel_idx || 0; // 키 일관성 처리
      const idxB = b.personnelIdx || b.personnel_idx || 0;
      return idxA - idxB; // 오름차순 정렬
    });

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
    console.log(data.value);
  } catch (error) {
    console.error(error);
  }
};

fetchData();

const Names = ref("");
const selectedRowKeys = ref([]);
const selectedRows = ref([]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys, rows) => {
    console.log("onChange triggered");
    console.log("Selected keys:", keys);
    console.log("Selected rows:", rows);

    selectedRowKeys.value = keys;
    selectedRows.value = rows;
    updateNames();
  },
  onSelect: (record, selected) => {
    console.log("onSelect triggered");
    console.log("Record:", record);
    console.log("Selected:", selected);

    if (selected) {
      selectedRowKeys.value.push(record.personnelIdx);
      selectedRows.value.push(record);
    } else {
      selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record.personnelIdx);
      selectedRows.value = selectedRows.value.filter(row => row.personnelIdx !== record.personnelIdx);
    }

    console.log("Current selectedRowKeys:", selectedRowKeys.value);
    console.log("Current selectedRows:", selectedRows.value);

    updateNames();
  },
  onSelectAll: (selected, rows) => {
    console.log("onSelectAll triggered");
    console.log("Selected all:", selected);
    console.log("Rows:", rows);

    if (selected) {
      selectedRowKeys.value = rows.map(row => row.personnelIdx);
      selectedRows.value = rows;
    } else {
      selectedRowKeys.value = [];
      selectedRows.value = [];
    }

    console.log("After select all - selectedRowKeys:", selectedRowKeys.value);
    console.log("After select all - selectedRows:", selectedRows.value);

    updateNames();
  },
}));

const updateNames = () => {
  console.log("updateNames triggered");
  if (selectedRows.value.length === 1) {
    Names.value = selectedRows.value[0].name;
  } else {
    Names.value = selectedRows.value.map(row => row.name).join(", ");
  }
  console.log("Updated Names:", Names.value);
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

const emit = defineEmits(["update:open", "submit"]); // 부모에게 상태 업데이트 전달

const loading = ref(false);

// 제출 처리 함수
const handleSubmit = async () => {
  loading.value = true;
  try {
    console.log("formState.put", formState.put);
    if (formState.put) {
      const reqBody = {
        shipType: formState.shipType,
        shipName: formState.shipName,
        imoNo: formState.imoNo,
        yardName: formState.yardName,
        rescueCapa: parseInt(formState.rescueCapa, 10),
        trialTypes: [...formState.trialTypes],
      };

      console.log("reqBody", reqBody);

      await putShip(formState.shipId, reqBody);
    } else {
      const reqBody = {
        shipId: formState.shipId,
        shipType: formState.shipType,
        shipName: formState.shipName,
        imoNo: formState.imoNo,
        yardName: formState.yardName,
        rescueCapa: parseInt(formState.rescueCapa, 10),
        trialTypes: [...formState.trialTypes],
      };

      console.log("reqBody", reqBody);

      await postShip(reqBody);
    }
    setTimeout(() => {
      loading.value = false;
    }, 1000);
    emit("refreshData");
  } catch (error) {
    console.error("Error submitting form:", error); // 오류 로그
  } finally {
    loading.value = false;
    emit("update:open", false); // 모달 닫기
  }
};

// 모달 닫기 함수
const handleCancel = () => {
  emit("update:open", false); // 부모에게 모달을 닫으라고 알림
};
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
}
</style>
