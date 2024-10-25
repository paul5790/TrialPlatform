<template>
  <div :inert="!open" tabindex="-1">
    <a-modal
      :open="open"
      title="필터링"
      @ok="applyFilter"
      @cancel="closeModal"
      width="400px"
    >
      <a-form layout="vertical">
        <div class="form-item" style="margin-top: 30px;">
          <a-checkbox
            :checked="filters.shipName.checked"
            @change="toggleFilter('shipName')"
            class="form-label"
            >Ship Name</a-checkbox
          >
          <a-input
            v-model:value="filters.shipName.value"
            :disabled="!filters.shipName.checked"
            class="form-input"
            placeholder="Enter Ship Name"
          />
        </div>
        <div class="form-item">
          <a-checkbox
            :checked="filters.shipType.checked"
            @change="toggleFilter('shipType')"
            class="form-label"
            >Ship Type</a-checkbox
          >
          <a-input
            v-model:value="filters.shipType.value"
            :disabled="!filters.shipType.checked"
            class="form-input"
            placeholder="Enter Ship Type"
          />
        </div>
        
        <div class="form-item">
          <a-checkbox
            :checked="filters.imoNo.checked"
            @change="toggleFilter('imoNo')"
            class="form-label"
            >IMO Number</a-checkbox
          >
          <a-input
            v-model:value="filters.imoNo.value"
            :disabled="!filters.imoNo.checked"
            class="form-input"
            placeholder="Enter IMO Number"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.yardName.checked"
            @change="toggleFilter('yardName')"
            class="form-label"
            >Yard Name</a-checkbox
          >
          <a-input
            v-model:value="filters.yardName.value"
            :disabled="!filters.yardName.checked"
            class="form-input"
            placeholder="Enter Yard Name"
          />
        </div>
        <!-- RescueCapa (min - max) -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.rescueCapa.checked"
            @change="toggleFilter('rescueCapa')"
            class="form-label"
          >
            Rescue Capa
          </a-checkbox>
          <div class="range-inputs">
            <a-input
              v-model:value="filters.rescueCapa.min"
              :disabled="!filters.rescueCapa.checked"
              placeholder="min"
            />
            <span> ~ </span>
            <a-input
              v-model:value="filters.rescueCapa.max"
              :disabled="!filters.rescueCapa.checked"
              placeholder="max"
            />
          </div>
        </div>

        <div class="divider"></div>

        <!-- Search Input -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.search.checked"
            @change="toggleFilter('search')"
            class="form-label"
            >Search</a-checkbox
          >
          <a-input
            v-model:value="filters.search.value"
            :disabled="!filters.search.checked"
            class="form-input"
            placeholder="Search All Columns"
          />
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, defineEmits, defineProps } from "vue";

// Props와 Emits 설정
const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(["update:open", "filter"]);

// 필터 상태를 객체로 관리
const filters = reactive({
  shipName: { checked: false, value: "" },
  shipType: { checked: false, value: "" },
  imoNo: { checked: false, value: "" },
  yardName: { checked: false, value: "" },
  rescueCapa: { checked: false, min: "", max: "" },
  search: { checked: false, value: "" },
});

// 모달 닫기 함수
const closeModal = () => {
  emit("update:open", false);
};

// 필터 적용 함수
const applyFilter = () => {
  const appliedFilters = {};

  // 체크된 필터만 수집
  Object.entries(filters).forEach(([key, filter]) => {
    console.log("filter.checked", filter.checked);
    console.log("filter.value", filter.value);
    if (filter.checked && filter.value) {
      appliedFilters[key] = filter.value;
    }
  });

  console.log("Applied Filters:", appliedFilters); // 로그로 필터 값 확인

  emit("filter", appliedFilters); // 부모로 필터 데이터 전달
  emit("update:open", false); // 모달 닫기
};

// 필터 체크박스 토글 함수
// const toggleFilter = (filterKey) => {
//   filters[filterKey].checked = !filters[filterKey].checked;
// };

// 필터 체크박스 토글 함수
const toggleFilter = async (filterKey) => {
  if (filterKey === 'search') {
    // Search 체크박스가 선택되면 다른 모든 체크박스 해제
    if (!filters.search.checked) {
      Object.keys(filters).forEach((key) => {
        if (key !== 'search') {
          filters[key].checked = false;  // 체크 해제
          if (filters[key].value !== undefined) {
            filters[key].value = ''; // 입력된 값 초기화
          }
          if (filters[key].min !== undefined) filters[key].min = '';
          if (filters[key].max !== undefined) filters[key].max = '';
        }
      });
    }
  } else {
    // 다른 필터를 클릭하면 Search 체크박스 해제
    filters.search.checked = false;
    filters.search.value = ''; // Search 입력 필드 초기화
  }

  // 체크박스 상태를 반전
  filters[filterKey].checked = !filters[filterKey].checked;

  // DOM 업데이트를 강제 적용
  await nextTick(); 
};
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-field {
  width: 200px;
}

.search-input {
  width: 300px;
}

.divider {
  border-top: 1px dashed rgb(226, 226, 226);
  margin: 20px 0;
}
</style>
