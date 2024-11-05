<template>
  <a-modal
    :open="open"
    title="선박 등록"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <!-- Activity Id Input -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Activity Id :</label>
        <a-input
          v-model:value="formState.activityId"
          placeholder="Enter Activity Id"
          class="form-input"
        />
      </div>

      <!-- Activity Name -->
      <div class="form-item">
        <label class="form-label">Activity Name :</label>
        <a-input
          v-model:value="formState.activityName"
          placeholder="Enter Activity Name"
          class="form-input"
        />
      </div>

      <!-- Time Taken -->
      <div class="form-item">
        <label class="form-label">Time Taken:</label>
        <a-input
          v-model:value="formState.timeTaken"
          placeholder="Enter Time Taken"
          class="form-input"
        />
      </div>

      <!-- Engine Load -->
      <div class="form-item">
        <label class="form-label">Engine Load:</label>
        <a-input
          v-model:value="formState.engineLoad"
          placeholder="Enter Engine Load"
          class="form-input"
        />
      </div>

      <!-- Part -->
      <div class="form-item">
        <label class="form-label">Part :</label>
        <a-select
          v-model:value="formState.part"
          placeholder="Select Part"
          class="form-input"
          :options="partItems.map((item) => ({ value: item }))"
        >
        </a-select>
      </div>

      <!-- Ship Type -->
      <div class="form-item">
        <label class="form-label">Ship Type :</label>
        <a-select
          v-model:value="formState.shipTypes"
          placeholder="Select Ship Type"
          class="form-input"
          mode="multiple"
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

      <!-- Trial Type -->
      <div class="form-item">
        <label class="form-label">Trial Type :</label>
        <a-select
          v-model:value="formState.trialTypes"
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
      width="350px"
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

    <!-- Trial Type 입력 새 모달-->
    <a-modal
      v-model:visible="addTrialType"
      width="350px"
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

    <!-- Yard Name 입력 새 모달 -->
    <a-modal
      v-model:visible="addYard"
      width="300px"
      title="Add New Item"
      @ok="handleAddYard"
      @cancel="handleCancelAddYard"
    >
      <p>Please enter the new yard name:</p>
      <a-input
        v-model:value="newYardItem"
        placeholder="New Yard Name"
        class="full-width"
        style="margin-bottom: 10px"
      />
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
import { ref, reactive, defineComponent, defineProps, watch } from "vue";
import { getAllActivities } from "../../api/Activities/Activities.js";
import { getShipType, postShipType } from "../../api/ShipType.js";
import { postActivity, putActivity } from "../../api/Activities/Activities.js";
import { getTrialType, postTrialType } from "../../api/TrialType.js";
const props = defineProps({
  open: Boolean, // 부모로부터 받는 open 상태
  yardList: Array,
  formState: Object, // 폼 데이터 상태
});

const formState = reactive({
  put: false,
  activityId: "",
  part: null,
  activityName: "",
  timeTaken: null,
  engineLoad: null,
  shipTypes: [],
  trialTypes: [],
});

const yardListItems = ref([]);

// props의 formState를 감시
watch(
  () => props.yardList, // 감시할 대상
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      yardListItems.value = [...newVal]; // 변경된 값 할당
    } else {
      yardListItems.value = []; // 만약 값이 없거나 유효하지 않으면 빈 배열로 초기화
    }
  },
  { immediate: true, deep: true } // 컴포넌트가 마운트될 때 즉시 실행
);

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
        activityId: "",
        part: null,
        activityName: "",
        timeTaken: null,
        engineLoad: null,
        shipTypes: [],
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

// 상태 관리

const partItems = ref(["General", "Hull", "Machinery", "Electric"])
const shipTypeItems = ref([]);
const trialTypeItems = ref([]);

// Ship Type List 가져오기
const getShipTypeList = async () => {
  try {
    shipTypeItems.value = await getShipType();
  } catch (error) {
    console.error(error);
  }
};

// Trial Type List 가져오기
const getTrialTypeList = async () => {
  try {
    trialTypeItems.value = await getTrialType();
  } catch (error) {
    console.error(error);
  }
};

getShipTypeList();
getTrialTypeList();

const addShipType = ref(false); // Ship 새 모달 열림 상태
const addTrialType = ref(false); // Trial 새 모달 열림 상태
const addYard = ref(false); // Trial 새 모달 열림 상태

const newShipTypeItem = ref(""); // Ship 새 아이템 입력 값
const newShipTypeActId = ref([]); // Ship 새 아이템 입력 값

const newTrialTypeItem = ref(""); // Trial 새 아이템 입력 값
const newTrialTypeActId = ref([]); // Trial 새 아이템 입력 값

const newYardItem = ref(""); // Ship 새 아이템 입력 값

const activityList = ref([]);
const getActList = async () => {
  try {
    const response = await getAllActivities();
    response.forEach((activity, index) => {
      activityList.value.push(
        `${activity.activityId}(${activity.activityName})`
      );
    });
  } catch (error) {
    console.error(error);
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

// Ship 모달 열기 함수
const showAddYardModal = () => {
  addYard.value = true;
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

// Ship 새 아이템 추가 처리
const handleAddYard = async () => {
  if (newYardItem.value) {
    yardListItems.value.push(newYardItem.value); // 아이템 추가
    formState.yardName = newYardItem.value;
    newYardItem.value = ""; // 입력 필드 초기화
  }

  addYard.value = false; // 모달 닫기
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

// Ship 모달 취소 처리
const handleCancelAddYard = () => {
  newYardItem.value = "";
  addYard.value = false; // 모달 닫기
};

const emit = defineEmits(["update:open", "submit"]); // 부모에게 상태 업데이트 전달

const loading = ref(false);


// 모달 닫기 함수
const handleCancel = () => {
  emit("update:open", false); // 부모에게 모달을 닫으라고 알림
};

// 제출 처리 함수
const handleSubmit = async () => {
  loading.value = true;
  try {
    console.log('formState.put', formState.put);
    if (formState.put) {
      const reqBody = {
        activity: {
          activityId: formState.activityId,
          part: formState.part,
          activityName: formState.activityName,
          timeTaken: parseInt(formState.timeTaken, 10),
          engineLoad: parseInt(formState.engineLoad, 10),
        },
        shipTypes: [...formState.shipTypes],
        trialTypes: [...formState.trialTypes],
      };

      console.log("reqBody", reqBody);

      await putActivity(formState.activityId, reqBody);
    } else {
      const reqBody = {
        activity: {
          activityId: formState.activityId,
          part: formState.part,
          activityName: formState.activityName,
          timeTaken: parseInt(formState.timeTaken, 10),
          engineLoad: parseInt(formState.engineLoad, 10),
        },
        shipTypes: [...formState.shipTypes],
        trialTypes: [...formState.trialTypes],
      };

      console.log("reqBody", reqBody);

      await postActivity(reqBody);
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
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
}
</style>
