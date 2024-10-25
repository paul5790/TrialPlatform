<template>
  <a-modal
    :open="open"
    title="선박 등록"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <!-- Ship id Input -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Ship Id :</label>
        <a-input
          v-model:value="formState.shipId"
          placeholder="Enter Ship Id"
          class="form-input"
        />
      </div>

      <!-- Ship Name -->
      <div class="form-item">
        <label class="form-label">Ship Name :</label>
        <a-input
          v-model:value="formState.shipName"
          placeholder="Enter Ship Name"
          class="form-input"
        />
      </div>

      <!-- Ship Type -->
      <div class="form-item">
        <label class="form-label">Ship Type :</label>
        <a-select
          v-model:value="formState.shipType"
          placeholder="Select Ship Type"
          class="form-input"
          :options="shipTypeItems.map((item) => ({ value: item }))"
        >
          <template #dropdownRender="{ menuNode: menu }">
            <v-nodes :vnodes="menu" />
            <a-divider style="margin: 4px 0" />
            <a-space style="padding: 4px 8px">
              <a-button type="text" @click="showAddShipTypeModal">
                <template #icon>
                  <plus-outlined />
                </template>
                + Add item
              </a-button>
            </a-space>
          </template>
        </a-select>
      </div>

      <!-- IMO Number -->
      <div class="form-item">
        <label class="form-label">IMO Number :</label>
        <a-input
          v-model:value="formState.imoNo"
          placeholder="Enter IMO Number"
          class="form-input"
        />
      </div>

      <!-- Yard Name -->
      <div class="form-item">
        <label class="form-label">Yard Name :</label>
        <a-input
          v-model:value="formState.yardName"
          placeholder="Enter Yard Name"
          class="form-input"
        />
      </div>

      <!-- Doc. Type -->
      <!-- <div class="form-item">
        <label class="form-label">Doc. Type :</label>
        <a-select
          v-model:value="formState.docType"
          placeholder="Select Doc. Type"
          class="form-input"
        >
          <a-select-option value="option1">RuleRegulation</a-select-option>
          <a-select-option value="option2">Option 2</a-select-option>
        </a-select>
      </div> -->

      <!-- Rescue Capa -->
      <div class="form-item">
        <label class="form-label">Rescue Capa:</label>
        <a-input
          v-model:value="formState.rescueCapa"
          placeholder="Enter Rescue Capa"
          class="form-input"
        />
      </div>

      <!-- Trial Type -->
      <div class="form-item">
        <label class="form-label">Trial Type :</label>
        <a-select
          v-model:value="trialType"
          placeholder="Select Trial Type"
          class="form-input"
          mode="multiple"
          :options="trialTypeItems.map((item) => ({ value: item }))"
        >
          <template #dropdownRender="{ menuNode: menu }">
            <v-nodes :vnodes="menu" />
            <a-divider style="margin: 4px 0" />
            <a-space style="padding: 4px 8px">
              <a-button type="text" @click="showAddTrialTypeModal">
                <template #icon>
                  <plus-outlined />
                </template>
                + Add item
              </a-button>
            </a-space>
          </template>
        </a-select>
      </div>
    </a-form>

    <!-- Ship Type 입력 새 모달 -->
    <a-modal
      v-model:visible="addShipType"
      width="300px"
      title="Add New Item"
      @ok="handleAddShipType"
      @cancel="handleCancelAddShipType"
    >
      <p>Please enter the new ship type:</p>
      <a-input
        v-model:value="newShipTypeItem"
        placeholder="New Ship Type"
        class="full-width"
        style="margin-bottom: 10px"
      />
      <a-select
        v-model:value="newShipTypeActId"
        placeholder="Select Activities Id"
        mode="multiple"
        class="full-width"
        :options="activityList.map((item) => ({ value: item }))"
        :max-tag-count="3"
      >
        <template #maxTagPlaceholder="omittedValues">
          <span style="color: red">+ {{ omittedValues.length }} ...</span>
        </template>
      </a-select>
    </a-modal>

    <!-- 새 모달 -->
    <a-modal
      v-model:visible="addTrialType"
      width="300px"
      title="Add New Item"
      @ok="handleAddTrialType"
      @cancel="handleCancelAddTrialType"
    >
      <p>Please enter the new item:</p>
      <a-input
        v-model:value="newTrialTypeItem"
        placeholder="New Trial Type"
        class="full-width"
        style="margin-bottom: 10px"
      />
      <a-select
        v-model:value="newTrialTypeActId"
        placeholder="Select Activities Id"
        mode="multiple"
        class="full-width"
        :options="activityList.map((item) => ({ value: item }))"
        :max-tag-count="3"
      >
        <template #maxTagPlaceholder="omittedValues">
          <span style="color: red">+ {{ omittedValues.length }} ...</span>
        </template>
      </a-select>
    </a-modal>

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
import { ref, reactive, defineComponent, defineProps, watch  } from "vue";
import { getAllActivities } from "../../api/Activities/Activities.js";
import { getShipType, postShipType } from "../../api/ShipType.js";
import { getTrialType, postTrialType } from "../../api/TrialType.js";
const props = defineProps({
  open: Boolean, // 부모로부터 받는 open 상태
  formState: Object, // 폼 데이터 상태
});

const formState = reactive({
  shipId: "",
  shipType: null,
  shipName: "",
  imoNo: "",
  yardName: "",
  rescueCapa: "",
});

// props의 formState를 감시
watch(
  () => props.formState, // 감시할 대상
  (newVal) => {
    console.log("zz");
    if (newVal && Object.keys(newVal).length > 0) {
      // 새 값이 존재할 경우 복사
      Object.assign(formState, newVal);
    } else {
      // 값이 없을 경우 초기 상태로 설정
      Object.assign(formState, {
        shipId: "",
        shipType: null,
        shipName: "",
        imoNo: "",
        yardName: "",
        rescueCapa: "",
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

// 상태 관리
const shipTypeItems = ref([]);
const trialTypeItems = ref([]);

// Ship Type List 가져오기
const getShipTypeList = async () => {
  try {
    shipTypeItems.value = await getShipType();
  } catch (error) {
    console.error(error);
    message.value = `api 오류(${error})`;
  }
};

// Trial Type List 가져오기
const getTrialTypeList = async () => {
  try {
    trialTypeItems.value = await getTrialType();
  } catch (error) {
    console.error(error);
    message.value = `api 오류(${error})`;
  }
};

getShipTypeList();
getTrialTypeList();

const addShipType = ref(false); // Ship 새 모달 열림 상태
const addTrialType = ref(false); // Trial 새 모달 열림 상태

const newShipTypeItem = ref(""); // Ship 새 아이템 입력 값
const newShipTypeActId = ref([]); // Ship 새 아이템 입력 값

const newTrialTypeItem = ref(""); // Trial 새 아이템 입력 값
const newTrialTypeActId = ref([]); // Trial 새 아이템 입력 값

const activityList = ref([]);
const getActList = async () => {
  try {
    const response = await getAllActivities();
    response.forEach((activity, index) => {
      activityList.value.push(activity.activityId);
    });
  } catch (error) {
    console.error(error);
    message.value = `api 오류(${error})`;
  }
};

getActList();

// Ship 모달 열기 함수
const showAddShipTypeModal = () => {
  addShipType.value = true;
};

// Trial 모달 열기 함수
const showAddTrialTypeModal = () => {
  addTrialType.value = true;
};

// Ship 새 아이템 추가 처리
const handleAddShipType = async () => {
  if (newShipTypeItem.value) {
    // shipTypeItems.value.push(newShipTypeItem.value); // 아이템 추가

    const reqBody = {
      shipType: newShipTypeItem.value,
      activityIds: newShipTypeActId.value,
    };
    console.log("reqBody", reqBody);

    await postShipType(reqBody);
    await getShipTypeList();

    newShipTypeItem.value = ""; // 입력 필드 초기화
    newShipTypeActId.value = []; // 입력 필드 초기화
  }

  addShipType.value = false; // 모달 닫기
};

// Trial 새 아이템 추가 처리
const handleAddTrialType = async () => {
  if (newTrialTypeItem.value) {
    // trialTypeItems.value.push(newTrialTypeItem.value); // 아이템 추가

    const reqBody = {
      trialType: newTrialTypeItem.value,
      activityIds: newTrialTypeActId.value,
    };
    console.log("reqBody", reqBody);

    await postTrialType(reqBody);
    await getTrialTypeList();

    newTrialTypeItem.value = ""; // 입력 필드 초기화
    newTrialTypeActId.value = []; // 입력 필드 초기화
  }
  addTrialType.value = false; // 모달 닫기
};

// Ship 모달 취소 처리
const handleCancelAddShipType = () => {
  newShipTypeItem.value = "";
  newShipTypeActId.value = [];
  addShipType.value = false; // 모달 닫기
};

// Trial 모달 취소 처리
const handleCancelAddTrialType = () => {
  newTrialTypeItem.value = "";
  newTrialTypeActId.value = [];
  addTrialType.value = false; // 모달 닫기
};



const trialType = ref([]);



const emit = defineEmits(["update:open", "submit"]); // 부모에게 상태 업데이트 전달

const loading = ref(false);

// 파일 선택 핸들러
const handleFileSelect = (file) => {
  props.formState.file = file.name;
  return false;
};

// 모달 닫기 함수
const handleCancel = () => {
  emit("update:open", false); // 부모에게 모달을 닫으라고 알림
};

// 제출 처리 함수
const handleSubmit = () => {
  loading.value = true;

  const reqBody = {
    trialType: newTrialTypeItem.value,
    activityIds: newTrialTypeActId.value,
  };

  console.log("reqBody", reqBody);



  setTimeout(() => {
    loading.value = false;
    // emit("submit", props.formState); // 부모에게 formState 데이터 제출
    emit("update:open", false); // 모달 닫기
  }, 1000);
};
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
}
</style>
