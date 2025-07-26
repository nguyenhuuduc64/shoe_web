<!-- 
<script setup>
import AdminSidebar from './components/adminpages/adminsidebar.vue';
</script>

<template>
  <div class="body">
    <AdminSidebar />
    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template> -->
<!-- <script setup>
import Admin from './components/Admin.vue';
import Home from './components/Home.vue';
</script>

<template>
  <div>
    <Home/>
  </div>
</template> -->

<script setup>
import "@fortawesome/fontawesome-free/css/all.min.css";

import { computed } from "vue";
import { useRoute } from "vue-router";
import Hometp from "./components/homepages/Hometp.vue";
import Headerd from "./components/homepages/Header.vue";
import Footerd from "./components/homepages/footer.vue";
import policed from "./components/homepages/police.vue";
import Admin from "./components/Admin.vue";
import searchsp from "./components/homepages/viewhome/searchsp.vue";
import { ref, provide } from "vue";

// 1. Import the toolbar
import { initToolbar } from "@stagewise/toolbar";

// 2. Define your toolbar configuration
const stagewiseConfig = {
  plugins: [],
};

// 3. Initialize the toolbar when your app starts
// Framework-agnostic approach - call this when your app initializes
function setupStagewise() {
  // Only initialize once and only in development mode
  if (process.env.NODE_ENV === "development") {
    initToolbar(stagewiseConfig);
  }
}

// Call the setup function when appropriate for your framework
setupStagewise();

const route = useRoute();
const isAdminPage = computed(() => route.path.startsWith("/admin"));

const showSearchPage = ref(false); // ✅ dùng ref
provide("showSearchPage", showSearchPage);
</script>

<template>
  <div>
    <Admin v-if="isAdminPage" />
    <template v-else>
      <Hometp />
      <Headerd />
      <SearchPage v-if="showSearchPage" />
      <RouterView />
      <policed />
      <Footerd />
    </template>
  </div>
</template>
