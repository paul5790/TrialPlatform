<template>
  <a-modal
    :open="open"
    title="새 일일보고 작성"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="1000px"
  >
    <a-form layout="vertical">
      <!-- Trial Id 선택 -->
      <div class="form-item" style="margin-top: 20px">
        <label class="form-label">Trial Id :</label>
        <a-select
          v-model:value="formState.trialId"
          placeholder="Select Trial Id"
          class="form-input"
          :options="trialIdItems.map((item) => ({ value: item }))"
        >
        </a-select>
      </div>

      <!-- Creator -->
      <div class="form-item">
        <label class="form-label">Creator :</label>
        <a-input
          v-model:value="formState.creator"
          placeholder="Enter Creator"
          class="form-input"
        />
      </div>

      <!-- Location -->
      <div class="form-item">
        <label class="form-label">Location:</label>
        <a-input
          v-model:value="formState.latitude"
          placeholder="Enter latitude"
          class="form-input"
          style="margin-right: 15px;"
        />
        <a-input
          v-model:value="formState.longitude"
          placeholder="Enter longitude"
          class="form-input"
        />
      </div>


      <div>

        <!-- Activity Status -->
        <h3>Activity Status:</h3>
        <a-table
          :data-source="activityData"
          :columns="activityColumns"
          pagination="{false}"
          :scroll="{ y: 240 }"
          bordered
          
        />
        <!-- Boarding State (ReadOnly) -->
        <h3>Boarding State:</h3>
        <a-table
          :data-source="boardingStateData"
          :columns="boardingStateColumns"
          pagination="{false}"
          bordered
        />
      </div>
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
import { ref, reactive, defineComponent, defineProps, watch } from "vue";
import { getAllActivities } from "../../api/Activities/Activities.js";
import { getShipType, postShipType } from "../../api/ShipType.js";
import { postShip, putShip } from "../../api/Ship/Ship.js";
import { getDailyActivityStatus } from "@/api/DailyReport/Report.js";
import { getTrial } from "@/api/Trial.js";

// 상태 관리
const trialIdItems = ref([]);

// Trial ID List 가져오기
const getTrialList = async () => {
  try {
    const trialValue = await getTrial();
    console.log("trialValue : ", trialValue);

    trialValue.forEach((trial, index) => {
      trialIdItems.value.push(trial.trialId);
    });
  } catch (error) {
    console.error(error);
  }
};

getTrialList();

const props = defineProps({
  open: Boolean, // 부모로부터 받는 open 상태
  formState: Object, // 폼 데이터 상태
});

const formState = reactive({
  put: false,
  trialId: [],
  creator: "",
  latitude: "",
  longitude: "",
  yardName: null,
  rescueCapa: "",
  trialTypes: [],
});

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

watch(
  () => formState.trialId,
  (newValue, oldValue) => {
    if (newValue === null || newValue === "") {
      console.log("trialId가 null이거나 빈 값입니다.");
    } else {
      console.log(`trialId가 변경되었습니다. 이전 값: ${oldValue}, 새로운 값: ${newValue}`);
      getActivityStatus(newValue);
    }
  }
);

// Trial ID List 가져오기
const getActivityStatus = async (trial) => {
  try {
    const status = await getDailyActivityStatus(trial);
    console.log("status : ", status);

  } catch (error) {
    console.error(error);
  }
};




const activityColumns = [
  {
    title: 'Activity Id',
    dataIndex: 'activityId',
    key: 'activityId',
    width: "10%",
  },
  {
    title: 'Activity Name',
    dataIndex: 'activityName',
    key: 'activityName',
    width: "17%",
  },
    {
    title: 'Start Time',
    dataIndex: 'activityStartTimeReport',
    key: 'activityStartTimeReport',
    width: "17%",
  },
    {
    title: 'End Time',
    dataIndex: 'activityEndTimeReport',
    key: 'activityEndTimeReport',
    width: "17%",
  },
    {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: "17%",
  },
]



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
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
}
</style>
