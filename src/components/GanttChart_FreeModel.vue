<template>
  <div id="gantt-container">
    <svg id="gantt"></svg>
  </div>
</template>

<script setup>
import { onMounted, watch, defineProps, ref, toRaw } from 'vue';
import Gantt from 'frappe-gantt';

// props로 tasks를 받음
const props = defineProps({
  tasks: Array
});

// Gantt 인스턴스 참조를 위한 변수 선언
let ganttInstance = ref(null);

// Gantt 차트를 초기화
onMounted(() => {
  ganttInstance.value = new Gantt("#gantt", toRaw(props.tasks), {
    view_mode: 'Day',
    custom_popup_html: function(task) {
      return `<div class="details-container">
                <h5>${task.name}</h5>
                <p>${task.progress}% completed!</p>
              </div>`;
    }
  });
});

// props가 변경될 때 차트를 업데이트
watch(() => props.tasks, (newTasks) => {
  console.log("ee");
  if (ganttInstance.value) {
    ganttInstance.value.refresh(toRaw(newTasks)); // toRaw로 변환하여 업데이트
  }
});
</script>

<style scoped>
#gantt-container {
  width: 100%;
  overflow-x: auto; /* 가로 스크롤 활성화 */
}

#gantt {
  min-height: 400px; /* 최소 높이 보장 */
}
</style>
