import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([
    {
      startTime: Date.UTC(2024, 8, 26, 0, 0), 
      minute: 30, 
      name: "Speed test",
      id: "A-1",
      y: 0,
      color: '#ff5555'
    },
    {
      startTime: Date.UTC(2024, 8, 26, 0, 30), 
      minute: 15, 
      name: "Anchor test",
      id: "G-1",
      y: 1,
      color: '#ff5555'
    },
    {
      startTime: Date.UTC(2024, 8, 26, 0, 45),
      minute: 42,
      name: "Steering test",
      id: "A-2",
      y: 2,
      color: '#ff5555'
    },
    {
      startTime: Date.UTC(2024, 8, 26, 1, 27), 
      minute: 6, 
      name: "M/E running test",
      id: "B-18",
      y: 0,
      color: '#55ff55'
    },
    {
      startTime: Date.UTC(2024, 8, 26, 1, 33), 
      minute: 15, 
      name: "Steering test",
      id: "A-2",
      y: 1,
      color: '#55ff55'
    },
    {
      startTime: Date.UTC(2024, 8, 26, 1, 48), 
      minute: 28,
      name: "Speed test",
      id: "A-1",
      y: 2,
      color: '#55ff55'
    }
  ]);

  // 새로운 task 추가 함수
  const addTask = (newTask) => {
    tasks.value.push(newTask);
  };

  const updateTaskStartTime = (taskId, newStartTime) => {
    const task = tasks.value.find((task) => task.id === taskId);
    if (task) {
      task.startTime = newStartTime;
    }
  };

  return {
    tasks,
    addTask, // 추가된 함수
    updateTaskStartTime,
  };
});
