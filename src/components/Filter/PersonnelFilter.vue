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
        <!-- 이름 필터 조건 -->
        <div class="form-item" style="margin-top: 30px">
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

        <!-- 회사 필터 조건 -->
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

        <!-- 소속 필터 조건 -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.department.checked"
            @change="toggleFilter('department')"
            class="form-label"
            >Department</a-checkbox
          >
          <a-input
            v-model:value="filters.department.value"
            :disabled="!filters.department.checked"
            class="form-input"
            placeholder="Enter Department"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            :checked="filters.role.checked"
            @change="toggleFilter('role')"
            class="form-label"
            >Role</a-checkbox
          >
          <a-select
            v-model:value="filters.role.value"
            :disabled="!filters.role.checked"
            placeholder="Enter Role"
            mode="multiple"
            class="form-input"
            :options="roleItems.map((item) => ({ value: item }))"
          >
          </a-select>
        </div>

        <!-- 휴대번호 필터 조건 -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.phone.checked"
            @change="toggleFilter('phone')"
            class="form-label"
            >Phone</a-checkbox
          >
          <a-input
            v-model:value="filters.phone.value"
            :disabled="!filters.phone.checked"
            class="form-input"
            placeholder="Enter Phone Number"
          />
        </div>

        <!-- 메일 필터 조건 -->
        <div class="form-item">
          <a-checkbox
            :checked="filters.email.checked"
            @change="toggleFilter('email')"
            class="form-label"
            >Email</a-checkbox
          >
          <a-input
            v-model:value="filters.email.value"
            :disabled="!filters.email.checked"
            class="form-input"
            placeholder="Enter Email"
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
import { ref, reactive, defineEmits, defineProps, watch } from "vue";

// Props와 Emits 설정
const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(["update:open", "filter"]);

const roleItems = ref([
  "Shipyard",
  "Owner",
  "Class",
  "Service Engineer",
  "Captain",
  "Helmsmen",
  "Nurse",
]);

// 필터 상태를 객체로 관리
const filters = reactive({
  name: { checked: false, value: "" },
  company: { checked: false, value: "" },
  department: { checked: false, value: "" },
  role: { checked: false, value: [] },
  phone: { checked: false, value: "" },
  email: { checked: false, value: "" },
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

    if (filter.checked) {
      if (key === "rescueCapa") {
        // rescueCapa일 경우 min과 max를 함께 전달
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
