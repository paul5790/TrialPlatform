<template>
  <div ref="lineChartContainer" class="line-chart-container"></div>
  <div ref="ganttChartContainer" class="gantt-chart-container"></div>
  <!-- Ant Design 모달 추가 -->
  <a-modal
    :open="isModalVisible"
    title="Task Details"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <p>Task Name: {{ selectedTask?.name }}</p>
    <p>Task Duration: {{ selectedTask?.minute }} minutes</p>
    <!-- DatePicker 추가 -->
    <a-date-picker
      v-model="selectedDate"
      show-time
      placeholder="Select Start Time"
    ></a-date-picker>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, nextTick } from "vue";
import Highcharts from "highcharts";
import Gantt from "highcharts/modules/gantt";
import DragDrop from "highcharts/modules/draggable-points";
import { useTasksStore } from "@/store/tasksStore";
import { getTask } from "../api/Schedule/ScheduleTask.js";

// Gantt 모듈 로드
Gantt(Highcharts);
DragDrop(Highcharts);

const tasksStore = useTasksStore(); // Pinia store 사용

// props로 tasks 받기
const props = defineProps({
  tasks: Array,
  selectedTrialId: String,
  selectedVersion: String,
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

const lineChartContainer = ref(null);
const ganttChartContainer = ref(null);

// Task 데이터를 변환하는 함수
const convertTasksWithActivityTimes = (tasks) => {
  return tasks.map((task) => {
    // 문자열을 Date 객체로 변환
    const start = new Date(task.activityStartTime).getTime();
    const end = new Date(task.activityEndTime).getTime();

    // 시작 및 종료 시간을 사용해 변환된 task 반환
    return {
      ...task,
      start,
      end,
    };
  });
};

const taskForm = ref([]);

// Task 가져오기
const getTaskList = async (trial, version) => {
  try {
    const taskValue = await getTask(trial, version);
    console.log("taskValue : ", taskValue);
    taskForm.value = [];

    taskValue.forEach((task, index) => {
      let yValue = index % 15;
      // activityId의 첫 글자를 기반으로 색상 설정
      let color;
      switch (task.activityId?.charAt(0)) {
        case "A":
          color = "#ff5555"; // Red
          break;
        case "B":
          color = "#55ff55"; // Green
          break;
        case "C":
          color = "#5555ff"; // Blue
          break;
        case "G":
          color = "#ffaf55"; // Orange
          break;
        default:
          color = "#cccccc"; // Default 색상
      }
      taskForm.value.push({
        activityId: task.activityId || "",
        activityStartTime: task.activityStartTime || "",
        activityEndTime: task.activityEndTime || null,
        name: task.activityName || "",
        y: yValue || null,
        color: color,
        engineLoad: task.engineLoad,
      });
    });

    console.log(taskValue);
  } catch (error) {
    console.error(error);
  }
};

// selectedTrial 변경 시 로그를 출력하는 watch 추가
watch(
  [() => props.selectedTrialId, () => props.selectedVersion],
  async ([newTrialId, newVersion]) => {
    await nextTick(); // DOM이 완전히 렌더링된 후에 동작
    console.log(
      `trial: ${props.selectedTrialId}, version: ${props.selectedVersion}`
    );
    getTaskList(props.selectedTrialId, props.selectedVersion);
  }
);

// 데이터 변경 시 라인 차트 및 간트 차트 갱신
watch(
  () => taskForm.value,
  (newTasks) => {
    createLineChart(newTasks);
    // createGanttChart(newTasks);
    const convertedTasks = convertTasksWithActivityTimes(taskForm.value);
    createGanttChart(convertedTasks);
  },
  { deep: true }
);

// onMounted를 사용해 초기값 처리
onMounted(() => {
  if (props.selectedTrialId || props.selectedVersion) {
    console.log(
      `onMounted - 초기값 처리: trial: ${props.selectedTrialId}, version: ${props.selectedVersion}`
    );
    getTaskList(props.selectedTrialId, props.selectedVersion);
  }
});

// 라인 차트 생성 함수
const createLineChart = (tasks) => {
  console.log("tasks", tasks);
  // const lineData = tasks.map((task) => ({
  //   x: new Date(task.activityStartTime).getTime(),
  //   y: task.engineLoad || 0,
  // }));
const lineData = tasks
    .map((task) => {
      // activityStartTime과 activityEndTime 검증
      const startTime = task?.activityStartTime
        ? new Date(task.activityStartTime).getTime()
        : null; // null로 처리
      const endTime = task?.activityEndTime
        ? new Date(task.activityEndTime).getTime()
        : null; // null로 처리

      // 시작 시간과 종료 시간이 없을 경우 빈 데이터를 반환
      if (startTime === null || endTime === null) {
        console.warn(
          "Invalid task detected: Missing activityStartTime or activityEndTime",
          task
        );
        return null; // 무시
      }

      const midpoint = (startTime + endTime) / 2; // 시작 시간과 종료 시간의 평균값

      return {
        x: midpoint, // 중앙값
        y: task.engineLoad || 0, // 기본값 0
      };
    })
    .filter((data) => data !== null); // 유효하지 않은 데이터 제외

  if (lineData.length === 0) {
    console.warn("No valid data for line chart.");
  }

  // X축 범위 계산
  let xMin = Date.now() - 1000 * 60 * 60; // 기본값: 현재 시간 - 1시간
  let xMax = Date.now() + 1000 * 60 * 60; // 기본값: 현재 시간 + 1시간

  if (lineData.length > 0) {
  const firstTaskStart = new Date(tasks[0].activityStartTime).getTime();
  const firstTaskEnd = new Date(tasks[0].activityEndTime).getTime();
  const firstTaskLength = firstTaskEnd - firstTaskStart;

  const lastTaskStart = new Date(
    tasks[tasks.length - 1].activityStartTime
  ).getTime();
  const lastTaskEnd = new Date(
    tasks[tasks.length - 1].activityEndTime
  ).getTime();
  const lastTaskLength = lastTaskEnd - lastTaskStart;

  // X축 여백 보정 계산
  const bufferFactor = 0.1; 
    xMin = firstTaskStart - firstTaskLength * bufferFactor;
    xMax = lastTaskEnd + lastTaskLength * bufferFactor;
  }

  console.log("Adjusted X-Axis Range:", { xMin, xMax });

  Highcharts.chart(lineChartContainer.value, {
    chart: {
      type: "line",
      height: 150,
      marginBottom: 5, // 아래 여백 조정
      marginTop: 30, // 위 여백 조정
    },
    title: {
      text: null, // 제목 숨기기
    },
    xAxis: {
      type: "datetime",
      visible: false, // X축 숨기기
      min: xMin, // 왼쪽 여백
      max: xMax, // 오른쪽 여백
      linkedTo: 1, // Gantt 차트와 x축 연결
    },
    yAxis: {
      title: {
        text: null, // Y축 제목 숨기기
      },
      min: 0, // 최소값
      max: 100, // 최대값
      labels: {
        style: {
          fontSize: "10px", // Y축 레이블 크기
        },
      },
    },
    legend: {
      enabled: true, // 범례 활성화
      align: "center", // 수평 정렬
      verticalAlign: "top", // 범례를 아래쪽으로 이동
      y: -5,
      itemStyle: {
        fontSize: "10px", // 범례 텍스트 크기 조정
      },
    },
    series: [
      {
        name: "Engine Load",
        data: lineData,
        marker: {
          enabled: true,
        },
      },
    ],
  });
};

// Gantt 차트 생성 함수
const createGanttChart = (tasks) => {
  const minute = 1000 * 60; // 1분 = 60,000 밀리초
  let today = new Date();

  // Task 배열에서 가장 빠른 start와 가장 늦은 end 찾기
  const earliestTaskStart = Math.min(...tasks.map((task) => task.start));
  const latestTaskEnd = Math.max(
    ...tasks.map((task) => task.end || task.start)
  );

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
      spacing: [5, 5, 5, 5], // 위, 오른쪽, 아래, 왼쪽 간격 최소화
      height: "35%", // 전체 높이 조정
      spacingLeft: 1,
    },
    lang: {
      accessibility: {
        axis: {
          xAxisDescriptionPlural:
            "The chart has a two-part X axis showing time in both week numbers and days.",
        },
      },
    },
    accessibility: {
      point: {
        descriptionFormat:
          "{#if milestone}{name}, milestone for {yCategory} at {x:%Y-%m-%d}.{else}{name}, assigned to {yCategory} from {x:%Y-%m-%d} to {x2:%Y-%m-%d}.{/if}",
      },
    },
    plotOptions: {
      series: {
        animation: true,
        groupPadding: 0.1, // 그룹 패딩 제거
        pointPadding: 0.1, // 포인트 간 여백 최소화
        dragDrop: {
          draggableX: true,
          draggableY: true,
          dragMinY: 0,
          dragMaxY: 14,
          dragPrecisionX: minute, // 분 단위로 드래그 가능
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            cursor: "default",
            pointerEvents: "none",
            fontSize: "10px",
          },
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
              const updatedEarliestTaskStart = Math.min(
                ...chart.series[0].data.map((task) => task.start)
              );
              const updatedLatestTaskEnd = Math.max(
                ...chart.series[0].data.map((task) => task.end || task.start)
              );

              // xAxis의 최소값을 가장 빠른 Task 날짜 - 10분으로 재설정
              const newMin = updatedEarliestTaskStart - minute * 10;
              const newMax = updatedLatestTaskEnd + minute * 10;

              // X축을 업데이트
              chart.xAxis[0].setExtremes(newMin, newMax);
            },
          },
        },
      },
    },
    yAxis: {
      type: "category",
      categories: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
      ],
      min: 0,
      max: 14,
      gridLineWidth: 0.5, // 그리드 선 두께 줄이기
      labels: {
        style: {
          fontSize: "10px", // 축 레이블 크기 줄이기
        },
      },
      tickLength: 0, // 축 틱 제거
    },
    xAxis: {
      currentDateIndicator: true,
      min: xAxisMin, // 최소값
      max: xAxisMax, // 최대값
      scrollbar: {
        enabled: true, // 스크롤바 활성화
        type: "datetime", // 시간 기반으로 X축 설정
      },
    },
    tooltip: {
      xDateFormat: "%a %b %d, %H:%M",
    },
    series: [
      {
        name: "Project 1",
        data: tasks,
      },
    ],
  });
};

// tasksStore의 tasks 변경을 감지하고 Gantt 차트를 업데이트하는 watch 추가
// watch(
//   () => taskForm.value.length, // 배열의 길이만 감지
//   () => {
//     console.log("Task 배열의 길이가 변경되었습니다. 차트를 업데이트합니다.");
//     const convertedTasks = convertTasksWithActivityTimes(taskForm.value);
//     createGanttChart(convertedTasks);
//   },
//   { deep: true }
// );

onMounted(() => {
  console.log("onMounted: lineChartContainer", lineChartContainer.value); // 라인 차트 컨테이너 확인
  if (!lineChartContainer.value) {
    console.error("Line chart container not found during onMounted.");
    return;
  }
  getTaskList(props.selectedTrialId, props.selectedVersion).then(() => {
    console.log("Task Form Data after API call:", taskForm.value); // Task 데이터 확인
    createLineChart(taskForm.value); // 라인 차트 생성

    const convertedTasks = convertTasksWithActivityTimes(taskForm.value);
    createGanttChart(convertedTasks);
    // createGanttChart(taskForm.value); // 간트 차트 생성
  });
});

const drawGantt = () => {
  console.log("drawGantt 함수 실행됨!");
  console.log(taskForm.value);
  createLineChart(taskForm.value);
  const convertedTasks = convertTasksWithActivityTimes(taskForm.value);
  createGanttChart(convertedTasks);
  // createGanttChart(taskForm.value);
};

// 그래프 초기화 메서드
const clearChart = () => {
  console.log("clearChart 메서드 실행됨!");

  // Line Chart: Clear only data but keep layout
  if (lineChartContainer.value) {
    const lineChart = Highcharts.charts.find(
      (chart) => chart.renderTo === lineChartContainer.value
    );
    if (lineChart) {
      lineChart.series.forEach((series) => {
        series.setData([]); // Clear the series data
      });
    }
  }

  // Gantt Chart: Clear only data but keep layout
  if (ganttChartContainer.value) {
    const ganttChart = Highcharts.charts.find(
      (chart) => chart.renderTo === ganttChartContainer.value
    );
    if (ganttChart) {
      ganttChart.series.forEach((series) => {
        series.setData([]); // Clear the series data
      });
    }
  }
};

defineExpose({
  drawGantt,
  clearChart,
});
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  height: 200px;
}
.gantt-chart-container {
  width: 100%;

  overflow-x: auto;
}
.highcharts-series rect {
  height: 10px; /* 포인트 높이 강제 조정 */
}

.highcharts-point {
  stroke-width: 0.5px; /* 포인트의 테두리 최소화 */
}

.highcharts-xaxis-labels text,
.highcharts-yaxis-labels text {
  font-size: 10px; /* 축 레이블 크기 줄이기 */
  line-height: 1; /* 행 높이를 최소화 */
}
</style>
