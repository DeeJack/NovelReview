<template>
    <v-container fluid>
        <v-text-field v-model="search" label="Search in library"></v-text-field>
        <v-row dense>
            <v-col v-for="novel in filteredLibrary" :key="novel.title" :cols="3" class="mg10">
                <v-card>
                    <v-icon style="position:absolute; top:0; right: 0; z-index: 1; color: black">mdi-pencil</v-icon>
                    <v-img :src="novel.image" cover>
                    </v-img>
                    <v-card-title :title="novel.title">{{ novel.title }}</v-card-title>
                    <v-card-subtitle>Last read: {{ novel.chapter }}</v-card-subtitle>
                    <div>
                        <v-icon :color="getColor(novel)"
                            v-for="i in [...Array(Math.floor(novel.rating)).keys()]">mdi-star</v-icon>
                        <v-icon  :color="getColor(novel)" v-if="Math.floor(novel.rating) < novel.rating">mdi-star-half</v-icon>
                        <v-icon v-for="i in [...Array(10 - Math.ceil(novel.rating)).keys()]">mdi-star-outline</v-icon>
                    </div>
                    <v-card-text>{{ novel.review }}</v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            library: [],
            libraryUrls: [],
            search: '',
        }
    },
    created() {
        axios.get('http://localhost:3000/api/library')
            .then((response) => {
                this.library = response.data
                this.libraryUrls = this.library.map((novel) => novel.url)
                console.log(this.library)
            })
            .catch((error) => {
                console.log(error)
            })
    },
    methods: {
        getColor(novel) {
            if (novel.rating < 5)
                return 'red'
            if (novel.rating < 8)
                return 'orange'
            return 'gold'
        }
    },
    computed: {
        filteredLibrary() {
            return this.library.filter((novel) => {
                return novel.title.toLowerCase().includes(this.search.toLowerCase())
            })
        }
    }
}
</script>

<style scoped>
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.v-card-title {
    font-size: 0.8rem;
}
</style>