<template>
  <div ref="ganttChartContainer" class="gantt-chart-container"></div>
  <!-- Ant Design 모달 추가 -->
  <a-modal :open="isModalVisible" title="Task Details" @ok="handleOk" @cancel="handleCancel">
    <p>Task Name: {{ selectedTask?.name }}</p>
    <p>Task Duration: {{ selectedTask?.minute }} minutes</p>
     <!-- DatePicker 추가 -->
    <a-date-picker v-model="selectedDate" show-time placeholder="Select Start Time"></a-date-picker>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from 'vue';
import Highcharts from 'highcharts';
import Gantt from 'highcharts/modules/gantt';
import DragDrop from 'highcharts/modules/draggable-points'; // 드래그 앤 드롭 모듈 추가
import { useTasksStore } from '@/store/tasksStore';

// Gantt 모듈 로드
Gantt(Highcharts);
DragDrop(Highcharts);

const tasksStore = useTasksStore(); // Pinia store 사용

// props로 tasks 받기
const props = defineProps({
  tasks: Array
});

// 모달 상태와 선택된 Task 정보 관리
const isModalVisible = ref(false);
const selectedTask = ref(null);
const selectedDate = ref(null); // DatePicker의 값

const handleOk = () => {
  if (selectedTask.value && selectedDate.value) {
    const newStartTime = selectedDate.value.valueOf(); 
    tasksStore.updateTaskStartTime(selectedTask.value.id, newStartTime);
    isModalVisible.value = false;
  }
};

const handleCancel = () => {
  isModalVisible.value = false;
};

const ganttChartContainer = ref(null);

// Task 데이터를 변환하는 함수 (minute -> start, end)
const convertTasksWithMinutes = (tasks) => {
  return tasks.map(task => {
    const start = task.startTime; // startTime은 이미 UTC 기반
    const end = start + task.minute * 60 * 1000; // minute 기반으로 end 계산
    return {
      ...task,
      start,
      end
    };
  });
};

// Gantt 차트 생성 함수
const createGanttChart = (tasks) => {
  const minute = 1000 * 60; // 1분 = 60,000 밀리초
  let today = new Date();

  // Task 배열에서 가장 빠른 start와 가장 늦은 end 찾기
  const earliestTaskStart = Math.min(...tasks.map(task => task.start));
  const latestTaskEnd = Math.max(...tasks.map(task => task.end || task.start));

  // X축의 최소값과 최대값을 설정 (가장 빠른 start - 7일, 가장 늦은 end + 7일)
  const xAxisMin = earliestTaskStart - minute * 10;
  const xAxisMax = latestTaskEnd + minute * 10;

  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);
  today = today.getTime();

  const chart = Highcharts.ganttChart(ganttChartContainer.value, {
    chart: {
      spacingLeft: 1
    },
    title: {
      text: 'Interactive Gantt Chart'
    },
    subtitle: {
      text: 'Drag and drop points to edit'
    },
    lang: {
      accessibility: {
        axis: {
          xAxisDescriptionPlural: 'The chart has a two-part X axis showing time in both week numbers and days.'
        }
      }
    },
    accessibility: {
      point: {
        descriptionFormat: '{#if milestone}{name}, milestone for {yCategory} at {x:%Y-%m-%d}.{else}{name}, assigned to {yCategory} from {x:%Y-%m-%d} to {x2:%Y-%m-%d}.{/if}'
      }
    },
    plotOptions: {
      series: {
        animation: true,
        dragDrop: {
          draggableX: true,
          draggableY: true,
          dragMinY: 0,
          dragMaxY: 2,
          dragPrecisionX: minute, // 분 단위로 드래그 가능
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          style: {
            cursor: 'default',
            pointerEvents: 'none'
          }
        },
        allowPointSelect: true,
        point: {
          events: {
            click: function (e) {
              // Task 클릭 시 모달을 열고, Task 데이터를 설정
              selectedTask.value = e.point;
              selectedDate.value = new Date(e.point.startTime); // 선택된 Task의 시작 날짜로 DatePicker 초기화
              console.log(selectedDate.value);
              isModalVisible.value = true;
            },
            drop(e) {
              // 드래그 후 새롭게 갱신된 Task의 시작과 끝 날짜
              const taskStart = e.newPoint.start;
              const taskEnd = e.newPoint.end || taskStart + day;
              

              console.log("Point dropped", e);

              // 드롭 후 현재 Task 목록에서 가장 빠른 Task와 가장 늦은 Task 날짜 계산
              const updatedEarliestTaskStart = Math.min(...chart.series[0].data.map(task => task.start));
              const updatedLatestTaskEnd = Math.max(...chart.series[0].data.map(task => task.end || task.start));

              // xAxis의 최소값을 가장 빠른 Task 날짜 - 10분으로 재설정
              const newMin = updatedEarliestTaskStart - minute * 10;
              const newMax = updatedLatestTaskEnd + minute * 10;

              // X축을 업데이트
              chart.xAxis[0].setExtremes(newMin, newMax);
            }
          }
        }
      }
    },
    yAxis: {
      type: 'category',
      categories: ['Tech', 'Marketing', 'Sales'],
      min: 0,
      max: 2
    },
    xAxis: {
      currentDateIndicator: true,
      min: xAxisMin, // 최소값
      max: xAxisMax, // 최대값
      scrollbar: {
    enabled: true // 스크롤바 활성화
  }
    },
    tooltip: {
      xDateFormat: '%a %b %d, %H:%M'
    },
    series: [{
      name: 'Project 1',
      data: tasks
    }]
  });
};


// tasksStore의 tasks 변경을 감지하고 Gantt 차트를 업데이트하는 watch 추가
watch(
  () => tasksStore.tasks.length, // 배열의 길이만 감지
  () => {
    console.log("Task 배열의 길이가 변경되었습니다. 차트를 업데이트합니다.");
    const convertedTasks = convertTasksWithMinutes(tasksStore.tasks);
    createGanttChart(convertedTasks);
  },
  { deep: true }
);

onMounted(() => {
  const convertedTasks = convertTasksWithMinutes(props.tasks);
  createGanttChart(convertedTasks);
});
</script>

<style scoped>
.gantt-chart-container {
  width: 100%;
  height: 400px; /* 고정된 차트 높이 */
  overflow-x: auto;
}
</style>
