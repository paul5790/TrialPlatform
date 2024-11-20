<template>
  <div :inert="!open" tabindex="-1">
    <a-modal
      :open="open"
      title="필터링"
      @ok="applyFilter"
      @cancel="closeModal"
      width="420px"
    >
      <a-form layout="vertical">
        <div class="form-item" style="margin-top: 30px;">
          <a-checkbox
            :checked="filters.trialId.checked"
            @change="toggleFilter('trialId')"
            class="form-label"
            >Trial Id</a-checkbox
          >
          <a-input
            v-model:value="filters.trialId.value"
            :disabled="!filters.trialId.checked"
            class="form-input"
            placeholder="Enter Trial Id"
          />
        </div>

        <!-- Created Date (min - max) with DatePicker -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.createdDate.checked"
            @change="toggleFilter('createdDate')"
            class="form-label"
          >
            Created Date
          </a-checkbox>

          <div>
            <a-date-picker
              v-model:value="filters.createdDate.min"
              :disabled="!filters.createdDate.checked"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="min"
              style="margin-bottom: 7px; width: 100%;"
            />
            <a-date-picker
              v-model:value="filters.createdDate.max"
              :disabled="!filters.createdDate.checked"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="max"
              style="width: 100%;"
            />
          </div>
        </div>

        
        <div class="form-item">
          <a-checkbox
            :checked="filters.creator.checked"
            @change="toggleFilter('creator')"
            class="form-label"
            >Creator</a-checkbox
          >
          <a-input
            v-model:value="filters.creator.value"
            :disabled="!filters.creator.checked"
            class="form-input"
            placeholder="Enter Creator"
          />
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
import { ref, reactive, defineEmits, defineProps, watch, nextTick } from "vue";


// Props와 Emits 설정
const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(["update:open", "filter"]);

// 필터 상태를 객체로 관리
const filters = reactive({
  trialId: { checked: false, value: "" },
  creator: { checked: false, value: "" },
  createdDate: { checked: false, min: "", max: "" },
  search: { checked: false, value: "" },
});

const StatusList = ref(["N"]);


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
      if (key === "createdDate") {
        // createdDate일 경우 min과 max를 함께 전달
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

.form-label {
  flex: 0 0 140px; /* 고정된 너비로 레이블을 왼쪽에 */
  margin-right: 10px; /* 레이블과 입력 필드 사이의 간격 */
  text-align: left; /* 레이블을 오른쪽 정렬 */
}

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
