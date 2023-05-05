<script>
import axios from 'axios'

export default {
  data() {
    return {
      auth: { 
        email: "johnnyboi@gmail.com", 
        password: "asdasd" 
      },
    };
  },
  methods: {
    login(e) {
      e.preventDefault();
      console.log("HERERERER")
      const that = this
      axios.post("http://ec2-52-90-39-231.compute-1.amazonaws.com:5000/login", this.auth)
      .then(function (response) {
        if (response.data){
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
    <form method="POST" >
      <label for="fname">Email:</label><br>
      <input type="text" id="fname" name="fname" v-model="auth.email"><br>
      <label for="lname">Password:</label><br>
      <input type="text" id="lname" name="lname" v-model="auth.password"><br><br>
      <button @click="login" value="Submit" >Log In</button>
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
