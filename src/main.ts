// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { SoundManager } from "@/utils/SoundManager";
import { soundDirective } from "@/directives/sound";
import "./assets/main.css";

// init sounds
SoundManager.init();

// create app
const app = createApp(App);
app.use(createPinia());
app.use(router);

// register directive globally as `v-sound`
app.directive("sound", soundDirective);

app.mount("#app");
