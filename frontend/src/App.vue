<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Library from './views/Library.vue'
</script>

<template>
  <v-layout>
    <v-navigation-drawer v-model="drawer" :rail="rail" @click="rail = false" style="margin-left: 0px">
      <v-list-item title="Novel Reviewer" nav>
        <template v-slot:append>
          <v-btn variant="text" :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            @click.stop="rail = !rail"></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-library-shelves" title="Library" value="library"
          @click.stop="goToLibrary()"></v-list-item>
        <v-list-item prepend-icon="mdi-book-arrow-right" title="Next reads" value="next"
          @click.stop="goToNext()"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-layout>
  <RouterView />
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      rail: true,
    }
  },
  methods: {
    goToLibrary() {
      this.rail = true
      this.$router.push('/')
    },
    goToNext() {
      this.rail = true
      this.$router.push('/next')
    }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
