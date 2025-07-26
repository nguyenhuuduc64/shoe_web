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
