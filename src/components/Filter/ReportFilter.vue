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
            :checked="filters.name.checked"
            @change="toggleFilter('name')"
            class="form-label"
            >Name</a-checkbox
          >
          <a-input
            v-model:value="filters.name.value"
            :disabled="!filters.name.checked"
            class="form-input"
            placeholder="Enter Name"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.company.checked"
            @change="toggleFilter('company')"
            class="form-label"
            >Company</a-checkbox
          >
          <a-input
            v-model:value="filters.company.value"
            :disabled="!filters.company.checked"
            class="form-input"
            placeholder="Enter Company"
          />
        </div>

        <!-- Boarding Time (min - max) with DatePicker -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.boardingTime.checked"
            @change="toggleFilter('boardingTime')"
            class="form-label"
          >
            Boarding Time
          </a-checkbox>

          <div>
            <a-date-picker
              v-model:value="filters.boardingTime.min"
              :disabled="!filters.boardingTime.checked"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="min"
              style="margin-bottom: 7px; width: 100%;"
            />
            <a-date-picker
              v-model:value="filters.boardingTime.max"
              :disabled="!filters.boardingTime.checked"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="max"
              style="width: 100%;"
            />
          </div>
        </div>
        
        <!-- Deboarding Time (min - max) with DatePicker -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.deboardingTime.checked"
            @change="toggleFilter('deboardingTime')"
            class="form-label"
          >
            Deboarding Time
          </a-checkbox>

          <div>
            <a-date-picker
              v-model:value="filters.deboardingTime.min"
              :disabled="!filters.deboardingTime.checked"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="min"
              style="margin-bottom: 7px; width: 100%;"
            />
            <a-date-picker
              v-model:value="filters.deboardingTime.max"
              :disabled="!filters.deboardingTime.checked"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="max"
              style="width: 100%;"
            />
          </div>
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.workDetails.checked"
            @change="toggleFilter('workDetails')"
            class="form-label"
            >Work Details</a-checkbox
          >
          <a-input
            v-model:value="filters.workDetails.value"
            :disabled="!filters.workDetails.checked"
            class="form-input"
            placeholder="Enter Work Details"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.roomNo.checked"
            @change="toggleFilter('roomNo')"
            class="form-label"
            >Room No</a-checkbox
          >
          <a-input
            v-model:value="filters.roomNo.value"
            :disabled="!filters.roomNo.checked"
            class="form-input"
            placeholder="Enter Room No"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.boardingStatus.checked"
            @change="toggleFilter('boardingStatus')"
            class="form-label"
            >Boarding Status</a-checkbox
          >
          <a-select
            v-model:value="filters.boardingStatus.value"
            :disabled="!filters.boardingStatus.checked"
            placeholder="Enter Boarding Status"
            mode="multiple"
            class="form-input"
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
import { ref, reactive, defineEmits, defineProps, watch, nextTick } from "vue";


// Props와 Emits 설정
const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(["update:open", "filter"]);

// 필터 상태를 객체로 관리
const filters = reactive({
  name: { checked: false, value: "" },
  company: { checked: false, value: "" },
  boardingTime: { checked: false, min: "", max: "" },
  deboardingTime: { checked: false, min: "", max: "" },
  workDetails: { checked: false, value: "" },
  roomNo: { checked: false, value: "" },
  boardingStatus: { checked: false, value: [] },
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
      if (key === "boardingTime" || key === "deboardingTime") {
        // boardingTime일 경우 min과 max를 함께 전달
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
