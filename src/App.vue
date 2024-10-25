<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
</script>

<style scoped>
/* 기본 스타일을 설정합니다. 필요에 따라 수정할 수 있습니다. */
body {
  margin: 0;
  padding: 0;
}
</style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.scroll {
  overflow-y: auto;
}
.scrollable-card {
  scrollbar-width: none; /* Firefox에 대한 스크롤바 숨김 */
  -ms-overflow-style: none; /* IE에 대한 스크롤바 숨김 */
}

.scrollable-card::-webkit-scrollbar {
  width: 0.2em; /* 스크롤바 너비 조절 */
}

.scrollable-card::-webkit-scrollbar-thumb {
  background-color: transparent; /* 스크롤바 썸 네일 배경색 투명으로 설정하여 숨김 */
}

.scrollable-card-1 {
  scrollbar-width: thin; /* Firefox에 대한 스크롤바 조절 */
  -ms-overflow-style: none; /* IE에 대한 스크롤바 숨김 */
}

.scrollable-card-1::-webkit-scrollbar {
  width: 3px; /* 스크롤바 너비 5px로 조절 */
}

.scrollable-card-1::-webkit-scrollbar-thumb {
  background-color: #ccc; /* 스크롤바 썸 네일 배경색 설정 (원하는 색상으로 변경 가능) */
  border-radius: 3px; /* 스크롤바 썸 네일의 모서리를 둥글게 조절 */
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* 각 행마다 10px 마진 */
}

.form-label {
  flex: 0 0 120px; /* 고정된 너비로 레이블을 왼쪽에 */
  margin-right: 10px; /* 레이블과 입력 필드 사이의 간격 */
  text-align: left; /* 레이블을 오른쪽 정렬 */
}

.form-input {
  flex: 1; /* 입력 필드는 가능한 넓게 */
}

.full-width {
  width: 100%;
}
</style>