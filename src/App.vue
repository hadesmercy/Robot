<!--
 * @FileDescription: 这是主界面组件
-->

<template>
    <Chat id="chat" />
    <img id="logo" alt="logo" src="./assets/bupt.jpg" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Chat from "./components/Chat.vue";


export default defineComponent({
    name: "App",
    components: { Chat },
});
</script>

<style lang="css">

#logo {
  text-align: center
}
</style>
