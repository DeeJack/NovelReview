<script setup>
import SearchField from '../components/SearchField.vue';
import LibraryEntries from '../components/LibraryEntries.vue';
</script>
<template>
    <main>
        <SearchField style="padding-bottom: 0px" @add-novel="updateLibrary" :library="library"
            :libraryUrls="libraryUrls" />
        <LibraryEntries style="padding-top: 0px" @add-novel="updateLibrary" :library="library"
            :libraryUrls="libraryUrls" @update-order="updateOrder" />
    </main>
</template>

<script>
import axios from 'axios'
import { checkLogin } from '../App.vue';

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
            if (!checkLogin())
                return;

            axios.get(`/api/library?orderBy=${order}&direction=${direction}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then((response) => {
                    this.library = response.data
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    },
    created() {
        if (!checkLogin())
            return;
        axios.get(`/api/library`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((response) => {
                this.library = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>