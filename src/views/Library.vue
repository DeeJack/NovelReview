
<script setup>
import SearchField from '../components/SearchField.vue';
import LibraryEntries from '../components/LibraryEntries.vue';
</script>
<template>
    <main>
        <SearchField @add-novel="updateLibrary"/>
        <LibraryEntries :library="library" :libraryUrls="libraryUrls"/>
    </main>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            library: []
        }
    },
    computed: {
        libraryUrls() {
            return this.library.map((novel) => novel.url)
        }
    },
    methods: {
        updateLibrary(newLibrary) {
            this.library = newLibrary
        }
    },
    created() {
        axios.get('http://localhost:3000/api/library')
            .then((response) => {
                this.library = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>