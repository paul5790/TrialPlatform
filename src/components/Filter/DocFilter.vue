<template>
  <div :inert="!open" tabindex="-1">
    <a-modal :open="open" title="필터링" @ok="applyFilter" @cancel="closeModal" width="400px">
      <a-form layout="vertical">
        <div class="form-item">
          <a-checkbox
            v-model="filters.DocName.checked"
            @change="toggleFilter('DocName')"
            class="form-label"
            >Doc Name</a-checkbox
          >
          <a-input
            v-model:value="filters.DocName.value"
            :disabled="!filters.DocName.checked"
            class="form-input"
            placeholder="Enter Doc Name"
          />
        </div>
        <div class="form-item">
          <a-checkbox
            v-model="filters.DocType.checked"
            @change="toggleFilter('DocType')"
            class="form-label"
            >Doc Type</a-checkbox
          >
          <a-input
            v-model:value="filters.DocType.value"
            :disabled="!filters.DocType.checked"
            class="form-input"
            placeholder="Enter Doc Type"
          />
        </div>

        <div class="form-item">
          <a-checkbox
            v-model="filters.ActicityId.checked"
            @change="toggleFilter('ActicityId')" class="form-label"
            >Activity Id</a-checkbox
          >
          <a-input
            v-model:value="filters.ActicityId.value"
            :disabled="!filters.ActicityId.checked"
            class="form-input"
            placeholder="Enter Activity Id"
          />
        </div>
        <!-- RescueCapa (min - max) -->
        <div class="form-item">
          <a-checkbox v-model="filters.RescueCapa.checked" class="form-label">
            RescueCapa
          </a-checkbox>
          <div class="range-inputs">
            <a-input
              v-model:value="filters.RescueCapa.min"
              :disabled="!filters.RescueCapa.checked"
              placeholder="min"
            />
            <span> ~ </span>
            <a-input
              v-model:value="filters.RescueCapa.max"
              :disabled="!filters.RescueCapa.checked"
              placeholder="max"
            />
          </div>
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
  DocName: { checked: false, value: "" },
  DocType: { checked: false, value: "" },
  ActicityId: { checked: false, value: "" },
  RescueCapa: { checked: false, min: '', max: '' },
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
    console.log(filter.checked);
    console.log(filter.value);
    if (filter.checked && filter.value) {
      appliedFilters[key] = filter.value;
    }
  });

  console.log("Applied Filters:", appliedFilters); // 로그로 필터 값 확인

  emit("filter", appliedFilters); // 부모로 필터 데이터 전달
  emit("update:open", false); // 모달 닫기
};

// 필터 체크박스 토글 함수
const toggleFilter = (filterKey) => {
  filters[filterKey].checked = !filters[filterKey].checked;
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
</style>
