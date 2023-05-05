<script>
import axios from 'axios'

export default {
  data() {
    return {
      auth: { 
        email: "test@test.com", 
        password: "password" 
      },
    };
  },
  methods: {
    login() {
      const that = this
      axios.post("http://localhost:5000/login", this.auth)
      .then(function (response) {
        if (response.status === 200){
          const login_data = response.data
          console.log(login_data)
          // update store
          // that.onAuthStateChangedAction(login_data)
          that.$router.push({path: '/about'})
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }
}

</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <form :action="login" method="POST" v-on:submit.prevent="console.log(form)">
      <label for="fname">Email:</label><br>
      <input type="text" id="fname" name="fname" v-model="auth.email"><br>
      <label for="lname">Password:</label><br>
      <input type="text" id="lname" name="lname" v-model="auth.password"><br><br>
      <input type="submit" value="Submit" >
    </form> 
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
