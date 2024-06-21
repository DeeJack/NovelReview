
<script setup>
import SearchField from '../components/SearchField.vue';
import LibraryEntries from '../components/LibraryEntries.vue';
</script>
<template>
    <main>
        <SearchField style="padding-bottom: 0px" 
            @add-novel="updateLibrary" :library="library" :libraryUrls="libraryUrls" />
        <LibraryEntries style="padding-top: 0px" 
            @add-novel="updateLibrary" :library="library" :libraryUrls="libraryUrls"
            @update-order="updateOrder" />
    </main>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            library: [],
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
        },
        updateOrder(order, direction) {
            axios.get(`/api/library?orderBy=${order}&direction=${direction}`)
                .then((response) => {
                    this.library = response.data
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    },
    created() {
        axios.get(`/api/library`)
            .then((response) => {
                this.library = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>