<template>
  <div id="app">
    <fa-address-book :color="[{fill:'red',stroke:'#00ff00'}]" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import FaAddressBook from "../src/fa-address-book/index.js";

export default {
  name: "app",
  components: {
    HelloWorld,
    FaAddressBook
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
