<template>
  <div ref="ganttChartContainer" class="gantt-chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from 'vue';
import Highcharts from 'highcharts';
import Gantt from 'highcharts/modules/gantt';

// Gantt 모듈 로드
Gantt(Highcharts);

// props로 tasks 받기
const props = defineProps({
  tasks: Array
});

const ganttChartContainer = ref(null);

// Gantt 차트 생성 함수
const createGanttChart = (tasks) => {
  const day = 1000 * 60 * 60 * 24;
  let today = new Date();

  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);
  today = today.getTime();

  Highcharts.ganttChart(ganttChartContainer.value, {
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
        animation: false, // Do not animate dependency connectors
        dragDrop: {
          draggableX: true,
          draggableY: true,
          dragMinY: 0,
          dragMaxY: 2,
          dragPrecisionX: day / 3 // Snap to eight hours
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
            select() {
              console.log("Point selected");
            },
            unselect() {
              console.log("Point unselected");
            },
            remove() {
              console.log("Point removed");
            }
          }
        }
      }
    },
    yAxis: {
      type: 'category',
      categories: ['Tech', 'Marketing', 'Sales'],
      accessibility: {
        description: 'Organization departments'
      },
      min: 0,
      max: 2
    },
    xAxis: {
      currentDateIndicator: true
    },
    tooltip: {
      xDateFormat: '%a %b %d, %H:%M'
    },
    series: [{
      name: 'Project 1',
      data: tasks || [{
        start: today + 2 * day,
        end: today + day * 5,
        name: 'Prototype',
        id: 'prototype',
        y: 0
      }, {
        start: today + day * 6,
        name: 'Prototype done',
        milestone: true,
        dependency: 'prototype',
        id: 'proto_done',
        y: 0
      }, {
        start: today + day * 7,
        end: today + day * 11,
        name: 'Testing',
        dependency: 'proto_done',
        y: 0
      }, {
        start: today + day * 5,
        end: today + day * 8,
        name: 'Product pages',
        y: 1
      }, {
        start: today + day * 9,
        end: today + day * 10,
        name: 'Newsletter',
        y: 1
      }, {
        start: today + day * 9,
        end: today + day * 11,
        name: 'Licensing',
        id: 'testing',
        y: 2
      }, {
        start: today + day * 11.5,
        end: today + day * 12.5,
        name: 'Publish',
        dependency: 'testing',
        y: 2
      }]
    }]
  });
};

// 차트 업데이트
watch(() => props.tasks, (newTasks) => {
  createGanttChart(newTasks);
});

onMounted(() => {
  createGanttChart(props.tasks);
});
</script>

<style scoped>
.gantt-chart-container {
  width: 100%;
  height: 400px; /* 고정된 차트 높이 */
  overflow-x: auto;
}
</style>
