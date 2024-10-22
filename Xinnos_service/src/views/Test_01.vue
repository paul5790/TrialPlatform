<template>
  <div>
    <h1>Test 01</h1>
    
    <!-- 버튼 추가 -->
    <button @click="fetchShipTypes">Load Ship Types</button>

    <!-- 테이블 -->
    <table v-if="shipTypes.length > 0" border="1" cellspacing="0" cellpadding="10">
      <thead>
        <tr>
          <th>ID</th>
          <th>Ship Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shipType in shipTypes" :key="shipType.id">
          <td>{{ shipType.id }}</td>
          <td>{{ shipType.ship_type }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Test01',
  data() {
    return {
      shipTypes: [],  // API에서 받아온 데이터를 저장할 배열
    };
  },
  methods: {
    // API 호출 메서드
    async fetchShipTypes() {
      try {
        const response = await axios.get('http://localhost:8083/shiptypes');
        this.shipTypes = response.data;  // 받아온 데이터를 shipTypes에 저장
      } catch (error) {
        console.error('Error fetching ship types:', error);
      }
    },
  },
};
</script>

<style lang="">
/* 필요에 따라 스타일 추가 */
</style>
