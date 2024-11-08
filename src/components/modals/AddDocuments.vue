<template>
  <a-modal
    :open="open"
    title="문서 업로드 / 수정"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">

      <!-- File -->
      <div class="form-item">
        <label class="form-label">File :</label>
        <a-upload 
          :before-upload="handleFileSelect" 
          :file-list="fileList"
          :on-remove="handleRemove"
          show-upload-list
        >
          <a-button icon="upload">문서 첨부</a-button>
        </a-upload>
      </div>

      <!-- Trial Id -->
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

      <!-- Activity Id -->
      <div class="form-item">
        <label class="form-label">Activity Id :</label>
        <a-select
          v-model:value="formState.activityId"
          placeholder="Select Activity Id"
          class="form-input"
          :options="activityIdItems.map((item) => ({ value: item }))"
        >
        </a-select>
      </div>

      <!-- Doc. Type -->
      <div class="form-item">
        <label class="form-label">Doc. Type :</label>
        <a-select
          v-model:value="formState.type"
          placeholder="Select Doc. Type"
          class="form-input"
          :options="docTypeItems.map((item) => ({ value: item }))"
        >
        </a-select>
      </div>

      <!-- Company -->
      <div class="form-item">
        <label class="form-label">Company :</label>
        <a-input
          v-model:value="formState.company"
          placeholder="Enter Company"
          class="form-input"
        />
      </div>

      <!-- Department -->
      <div class="form-item">
        <label class="form-label">Department:</label>
        <a-input
          v-model:value="formState.department"
          placeholder="Enter Department"
          class="form-input"
        />
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


      <!-- Uploader -->
      <div class="form-item">
        <label class="form-label">Uploader :</label>
        <a-input
          v-model:value="formState.uploader"
          placeholder="Enter Uploader"
          class="form-input"
        />
      </div>

      <!-- Description Type -->
      <div class="form-item">
        <label class="form-label">Description Type :</label>
        <a-select
          v-model:value="formState.descriptionType"
          placeholder="Select Description Type"
          class="form-input"
          :options="descriptionTypeItems.map((item) => ({ value: item }))"
        >
        </a-select>
      </div>

      <div class="form-item">
        <a-textarea
          v-model:value="formState.description"
          placeholder="Enter Description"
          class="form-input"
          :rows="2"
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
import { postDocument, putDocument } from "@/api/Documents/Documents.js";
import { getTrial } from "@/api/Trial.js"
import { getTrialType, postTrialType } from "../../api/TrialType.js";
const props = defineProps({
  open: Boolean, // 부모로부터 받는 open 상태
  formState: Object, // 폼 데이터 상태
});

const formState = reactive({
  put: false,
  documentIdx: "",
  name: "",
  trialId: null,
  type: "",
  activityId: null,
  company: "",
  department: "",
  creator: "",
  uploader: "",
  uploadedDate: "",
  version: "",
  description: "",
  descriptionType: null,
  filePath: "",
  fileSize: 0,
});

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
        documentIdx: "",
        name: "",
        trialId: null,
        type: null,
        activityId: null,
        company: "",
        department: "",
        creator: "",
        uploader: "",
        uploadedDate: "",
        version: "",
        description: "",
        descriptionType: null,
        filePath: "",
        fileSize: 0,
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
const trialIdItems = ref([]);

const activityIdItems = ref([]);
const docTypeItems = ref(["Rule&Regulation", "Design", "Plan", "Procedure", "Result", "Report"]);
const descriptionTypeItems = ref(["Information", "Issue", "Punchlist", "ETC"])

// Trial ID List 가져오기
const getTrialList = async () => {
  try {
    const trialValue = await getTrial();
    console.log('trialValue : ', trialValue);

    trialValue.forEach((trial, index) => {
      trialIdItems.value.push(trial.trialId);
    });
  } catch (error) {
    console.error(error);
  }
};

const getActList = async () => {
  try {
    const response = await getAllActivities();
    response.forEach((activity, index) => {
      activityIdItems.value.push(
        `${activity.activityId}`
      );
    });
  } catch (error) {
    console.error(error);
  }
};

getTrialList();
getActList();


const emit = defineEmits(["update:open", "submit"]); // 부모에게 상태 업데이트 전달

const loading = ref(false);

// 파일 리스트 상태 관리
const fileList = ref([]);
const fileName = ref();

// watch를 사용해 fileList 변화 감지
watch(
  fileList,
  (newVal, oldVal) => {
    console.log("파일 리스트가 변경되었습니다:");
    console.log("새로운 파일 리스트:", newVal);
    console.log("이전 파일 리스트:", oldVal);
    if (fileName.value.length > 0) {
      const originalName = fileName.value;
      const nameWithoutExtension = removeExtension(originalName);
      formState.name = nameWithoutExtension;
      console.log("파일 이름:", formState.name);
    }
  },
  { deep: true } // 객체 내부 변화까지 감지하기 위해 deep 옵션 사용
);

// 확장자 제거 함수
const removeExtension = (fileName) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  // 마지막 점(.)이 없는 경우 확장자가 없는 파일로 간주
  if (lastDotIndex === -1) return fileName;
  // 마지막 점(.) 이전의 문자열 반환
  return fileName.substring(0, lastDotIndex);
}

// 파일 선택 핸들러
const handleFileSelect = (file) => {
  // 선택된 파일을 파일 리스트에 추가
  fileList.value = [
    {
      uid: file.uid, // 고유 ID 설정
      name: getTruncatedFileName(file.name),
      status: "done",
      originFileObj: file, // 원본 파일 객체 저장
      size: formatFileSize(file.size), // 파일 크기 (바이트를 읽기 쉽게 변환)
      path: file.webkitRelativePath || "경로를 알 수 없음", // 상대 경로 (가능할 경우에만)
    },
  ];
  return false; // 실제 업로드 막기 위해 false 반환
};

// 파일 삭제 핸들러
const handleRemove = (file) => {
  const index = fileList.value.findIndex((item) => item.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1); // 파일 제거
  }
};

// 파일 크기를 포맷팅하는 함수 (KB, MB 등으로 변환)
function formatFileSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

//// 서버에 파일 업로드 처리 함수
// const uploadFilesToServer = async () => {
//   const formData = new FormData();
  
//   // 선택된 파일을 FormData에 추가
//   fileList.value.forEach((file) => {
//     formData.append("files", file.originFileObj);
//   });

//   try {
//     const response = await axios.post("http://your-server-url/upload", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("Upload successful:", response.data);
//   } catch (error) {
//     console.error("Upload failed:", error);
//   }
// };


// 긴 파일명 자르기 함수
const getTruncatedFileName = (name) => {
  fileName.value = name;
  const maxLength = 27; // 최대 길이 설정
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

// 모달 닫기 함수
const handleCancel = () => {
  emit("update:open", false); // 부모에게 모달을 닫으라고 알림
};

// 제출 처리 함수
const handleSubmit = async () => {
  // await uploadFilesToServer(); // 파일 업로드
  loading.value = true;
  try {

    formState.uploadedDate = getCurrentFormattedDate();
    console.log(formState.uploadedDate); // "2024-11-08 17:27" 형식으로 출력
    console.log('formState.put', formState.put);
    if (formState.put) {
      const reqBody = {
        name: formState.name,
        trialId: formState.trialId,
        type: formState.type,
        activityId: formState.activityId,
        company: formState.company,
        department: formState.department,
        creator: formState.creator,
        uploader: formState.uploader,
        uploadedDate: formState.uploadedDate,
        version: formState.version,
        description: formState.description,
        descriptionType: formState.descriptionType,
        filePath: "formState.filePath",
        fileSize: parseInt(formState.fileSize, 10),
      };

      console.log("idx : ", formState.documentIdx);
      console.log("put o - reqBody : ", reqBody);

      await putDocument(formState.documentIdx, reqBody);
    } else {
      const reqBody = {
        "trialId": formState.trialId,
        "activityId": formState.activityId,
        "type": formState.type,
        "name": formState.name,
        "version": "A",
        "company": formState.company,
        "department": formState.department,
        "creator": formState.creator,
        "uploader": formState.uploader,
        "uploadedDate": formState.uploadedDate,
        "descriptionType": formState.descriptionType,
        "description": formState.description,
        "filePath": "C:Upload/documents/",
        "fileSize": parseInt(formState.fileSize, 10),
      };

      console.log("put x - reqBody", reqBody);

      await postDocument(reqBody);
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

// 현재 시간을 가져와서 원하는 형식으로 변환하는 함수
const getCurrentFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
}
</style>
