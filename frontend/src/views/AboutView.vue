<script>
import Welcome from '../components/TheWelcome.vue'

export default {
  components:{
    Welcome
  }
}
</script>

<template>
  <div class="about">
    <div>
      <h1>About Page</h1>
    </div>
    <Welcome />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  /* .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  } */
}
</style>
