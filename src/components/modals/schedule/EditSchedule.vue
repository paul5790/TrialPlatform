<template>
  <a-modal :open="open" title="Activity 항목 편집" width="700px" @ok="handleSubmit" @cancel="handleCancel">
    <div class="modal-body">
      <div class="list-container">
        <!-- 왼쪽 전체 항목 리스트 -->
         <div>
          <div class="list-box">
            <h4>전체 항목</h4>
            <a-list :data-source="localAllItems" :render-item="renderItem" bordered item-layout="horizontal">
              <template #renderItem="{ item, index }">
                <a-list-item :key="index" :class="{ selected: selectedAllItems.includes(item) }" @click="toggleAllItem(item)">
                  <a-checkbox :checked="selectedAllItems.includes(item)">
                    {{ item }}
                  </a-checkbox>
                </a-list-item>
              </template>
            </a-list>
          </div>
          <div class="right-btn">
            <a-button @click="addItems" type="primary" :disabled="selectedAllItems.length === 0">
              추가
            </a-button>
          </div>
         </div>

        <!-- 오른쪽 추가된 항목 리스트 -->
         <div>
          <div class="list-box">
            <h4>추가된 항목</h4>
            <a-list :data-source="localAddedItems" :render-item="renderAddedItem" bordered item-layout="horizontal">
              <template #renderItem="{ item, index }">
                <a-list-item :key="index" :class="{ selected: selectedAddedItem === item }" @click="selectAddedItem(item)">
                  <a-checkbox :checked="selectedAddedItem === item">
                    {{ item }}
                  </a-checkbox>
                </a-list-item>
              </template>
            </a-list>
          </div>
          <div class="right-btn">
            <a-button @click="removeItem" type="primary" :disabled="!selectedAddedItem">
              제거
            </a-button>
          </div>
         </div>
        

        <!-- 위/아래 화살표 버튼 -->
        <div class="arrow-controls">
          <a-button @click="moveUp" type="primary" :disabled="!selectedAddedItem">
            <ArrowUpOutlined />
          </a-button>
          <a-button @click="moveDown" type="primary" :disabled="!selectedAddedItem">
            <ArrowDownOutlined />
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTasksStore } from '@/store/tasksStore';

const props = defineProps({
  open: Boolean,
  allItems: Array,
  addedItems: Array,
});

const emit = defineEmits(['update:open', 'submit']);

// 로컬 상태로 복사하여 사용
const localAllItems = ref([...props.allItems]); 
const localAddedItems = ref([...props.addedItems]);

const selectedAllItems = ref([]);
const selectedAddedItem = ref(null);

// 전체 항목에서 선택/해제
const toggleAllItem = (item) => {
  if (selectedAddedItem.value) {
    // 추가된 항목을 선택 중이면 전체 항목을 선택했을 때 모두 초기화
    selectedAddedItem.value = null;
  }

  if (selectedAllItems.value.includes(item)) {
    selectedAllItems.value = selectedAllItems.value.filter((i) => i !== item);
  } else {
    selectedAllItems.value.push(item);
  }
};

// 추가된 항목 선택
const selectAddedItem = (item) => {
  if (selectedAllItems.value.length > 0) {
    // 전체 항목을 선택 중이면 추가된 항목을 선택했을 때 모두 초기화
    selectedAllItems.value = [];
  }
  selectedAddedItem.value = item;
};

// 전체 항목을 추가된 항목으로 이동
const addItems = () => {
  localAddedItems.value.push(...selectedAllItems.value); // 선택된 항목을 추가된 항목 리스트에 추가
  localAllItems.value = localAllItems.value.filter(item => !selectedAllItems.value.includes(item)); // 전체 항목에서 제거
  selectedAllItems.value = [];
};

// 추가된 항목을 전체 항목으로 다시 이동
const removeItem = () => {
  if (selectedAddedItem.value) {
    localAllItems.value.push(selectedAddedItem.value); // 추가된 항목을 전체 항목으로 이동
    localAddedItems.value = localAddedItems.value.filter(item => item !== selectedAddedItem.value); // 추가된 항목에서 제거
    selectedAddedItem.value = null;
  }
};

// 추가된 항목을 위로 이동
const moveUp = () => {
  const index = localAddedItems.value.indexOf(selectedAddedItem.value);
  if (index > 0) {
    const temp = localAddedItems.value[index - 1];
    localAddedItems.value[index - 1] = localAddedItems.value[index];
    localAddedItems.value[index] = temp;
  }
};

// 추가된 항목을 아래로 이동
const moveDown = () => {
  const index = localAddedItems.value.indexOf(selectedAddedItem.value);
  if (index < localAddedItems.value.length - 1) {
    const temp = localAddedItems.value[index + 1];
    localAddedItems.value[index + 1] = localAddedItems.value[index];
    localAddedItems.value[index] = temp;
  }
};

// 모달 제출 시 부모 컴포넌트로 데이터 전달
const handleSubmit = () => {
  emit('submit', { addedItems: localAddedItems.value, allItems: localAllItems.value });
  emit('update:open', false);
};

// 모달 취소 시
const handleCancel = () => {
  emit('update:open', false);
};

// watch를 통해 props의 변화가 있을 때 로컬 상태에 반영
watch(() => props.allItems, (newItems) => {
  localAllItems.value = [...newItems];
});

watch(() => props.addedItems, (newItems) => {
  localAddedItems.value = [...newItems];
});
</script>

<style scoped>
.modal-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.list-container {
  display: flex;
  gap: 20px;
}

.list-box {
  width: 250px;
  height: 400px;
  margin-bottom: 10px;
  overflow-y: auto;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.arrow-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.right-btn {
  display: flex; 
  justify-content: flex-end;
}
</style>
