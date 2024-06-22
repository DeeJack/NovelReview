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
        <div v-if="!!token && !!username">
          <v-list-item title="Welcome" nav>
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <template v-slot:default>
              <span>{{ username }}</span>
            </template>
          </v-list-item>
          <v-list-item nav>
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <template v-slot:default>
              <v-btn variant="text" style="padding:0px" @click="logout()">Logout</v-btn>
            </template>
          </v-list-item>
        </div>
        <div v-else>
        <v-list-item prepend-icon="mdi-login" title="Login" value="login"
          @click.stop="goToLogin()"></v-list-item>
        </div>
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
let username = '';
let token = '';

export function updateLogin(newUsername, newToken) {
  username = newUsername
  token = newToken
}

function logout() {
  localStorage.removeItem('username')
  localStorage.removeItem('token')
  updateLogin('', '')
}

export default {
  data() {
    return {
      drawer: true,
      rail: true,
    }
  },
  created() {
    username = localStorage.getItem('username') || ''
    token = localStorage.getItem('token') || ''
  },
  methods: {
    goToLibrary() {
      this.rail = true
      this.$router.push('/')
    },
    goToNext() {
      this.rail = true
      this.$router.push('/next')
    },
    goToLogin() {
      this.rail = true
      this.$router.push('/login')
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
