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
        <div class="form-item" style="margin-top: 30px">
          <a-checkbox
            :checked="filters.activityId.checked"
            @change="toggleFilter('activityId')"
            class="form-label"
            >Activity Id</a-checkbox
          >
          <a-input
            v-model:value="filters.activityId.value"
            :disabled="!filters.activityId.checked"
            class="form-input"
            placeholder="Enter Activity Id"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.activityName.checked"
            @change="toggleFilter('activityName')"
            class="form-label"
            >ActivityName</a-checkbox
          >
          <a-input
            v-model:value="filters.activityName.value"
            :disabled="!filters.activityName.checked"
            class="form-input"
            placeholder="Enter IMO Number"
          />
        </div>

        <!-- Time Taken (min - max) -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.timeTaken.checked"
            @change="toggleFilter('timeTaken')"
            class="form-label"
          >
            Time Taken
          </a-checkbox>
          <div class="range-inputs">
            <a-input
              v-model:value="filters.timeTaken.min"
              :disabled="!filters.timeTaken.checked"
              placeholder="min"
            />
            <span> ~ </span>
            <a-input
              v-model:value="filters.timeTaken.max"
              :disabled="!filters.timeTaken.checked"
              placeholder="max"
            />
          </div>
        </div>

        <!-- Engine Load (min - max) -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.engineLoad.checked"
            @change="toggleFilter('engineLoad')"
            class="form-label"
          >
            Engine Load
          </a-checkbox>
          <div class="range-inputs">
            <a-input
              v-model:value="filters.engineLoad.min"
              :disabled="!filters.engineLoad.checked"
              placeholder="min"
            />
            <span> ~ </span>
            <a-input
              v-model:value="filters.engineLoad.max"
              :disabled="!filters.engineLoad.checked"
              placeholder="max"
            />
          </div>
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.part.checked"
            @change="toggleFilter('part')"
            class="form-label"
            >Part</a-checkbox
          >

          <a-select
            v-model:value="filters.part.value"
            :disabled="!filters.part.checked"
            placeholder="Enter Ship Type"
            mode="multiple"
            class="form-input"
            :options="partList.map((item) => ({ value: item }))"
          >
          </a-select>
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
  activityId: { checked: false, value: "" },
  part: { checked: false, value: [] },
  activityName: { checked: false, value: "" },
  timeTaken: { checked: false, min: "", max: "" },
  engineLoad: { checked: false, min: "", max: "" },
  search: { checked: false, value: "" },
});

const partList = ["General", "Hull", "Machinery", "Electric"]

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

    if (filter.checked) {
      if (key === "timeTaken" || key === "engineLoad") {
        // timeTaken, engineLoad일 경우 min과 max를 함께 전달
        if (filter.min || filter.max) {
          appliedFilters[key] = { min: filter.min, max: filter.max };
        }
      } else if (filter.value) {
        // 일반 필터의 경우 value 값을 전달
        appliedFilters[key] = filter.value;
      }
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
  if (filterKey === "search") {
    // Search 체크박스가 선택되면 다른 모든 체크박스 해제
    if (!filters.search.checked) {
      Object.keys(filters).forEach((key) => {
        if (key !== "search") {
          filters[key].checked = false; // 체크 해제
          if (filters[key].value !== undefined) {
            filters[key].value = ""; // 입력된 값 초기화
          }
          if (filters[key].min !== undefined) filters[key].min = "";
          if (filters[key].max !== undefined) filters[key].max = "";
        }
      });
    }
  } else {
    // 다른 필터를 클릭하면 Search 체크박스 해제
    filters.search.checked = false;
    filters.search.value = ""; // Search 입력 필드 초기화
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
