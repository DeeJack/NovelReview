<template>
    <v-container fluid>
        <v-text-field v-model="search" label="Search in library"></v-text-field>
        <v-row dense>
            <v-col v-for="novel in filteredLibrary" :key="novel.title" :cols="3" class="mg10">
                <v-card>
                    <v-btn icon @click="goToEdit(novel)"
                        style="position:absolute; top:0; right: 0; z-index: 1; background-color: transparent;">
                        <v-icon style="color: black">mdi-pencil</v-icon>
                    </v-btn>
                    <v-img :src="novel.image" cover>
                    </v-img>
                    <v-card-title :title="novel.title">{{ novel.title }}</v-card-title>
                    <v-card-subtitle v-if="novel.chapter">Last read: {{ novel.chapter }}</v-card-subtitle>
                    <div style="margin: 5px 0px 0px 10px">
                        <v-icon :color="getColor(novel)"
                            v-for="i in [...Array(Math.floor(novel.rating || 0)).keys()]">mdi-star</v-icon>
                        <v-icon :color="getColor(novel)"
                            v-if="Math.floor(novel.rating) < novel.rating">mdi-star-half</v-icon>
                        <v-icon v-for="i in [...Array(10 - Math.ceil(novel.rating || 0)).keys()]">mdi-star-outline</v-icon>
                        <span style="margin-left: 3px; font-size: 1rem; vertical-align:middle">({{ novel.rating }})</span>
                    </div>
                    <v-card-text v-if="novel.kisses">Kisses: {{ novel.kisses }}</v-card-text>
                    <v-card-text>{{ novel.review ? novel.review.substr(0, 150) + "..." : 'No review yet' }}</v-card-text>
                    <v-chip v-if="novel.tags" v-for="tag in novel.tags.split(',')">
                        {{ tag.trim() }}
                    </v-chip>
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
            search: '',
        }
    },
    props: ['library', 'libraryUrls'],
    created() {
        // axios.get('http://localhost:3000/api/library')
        //     .then((response) => {
        //         this.library = response.data
        //         this.libraryUrls = this.library.map((novel) => novel.url)
        //         console.log(this.library)
        //     })
        //     .catch((error) => {
        //         console.log(error)
        //     })
    },
    methods: {
        getColor(novel) {
            if (novel.rating < 5)
                return '#8B0000'
            if (novel.rating < 7)
                return '#B22222'
            if (novel.rating < 8)
                return '#DAA520'
            return '#FFD700'
        },
        goToEdit(novel) {
            localStorage.setItem('novel', JSON.stringify(novel))
            this.$router.push({ name: 'Edit' })
        }
    },
    computed: {
        filteredLibrary() {
            return this.library.filter((novel) => {
                return novel.title.toLowerCase().includes(this.search.toLowerCase())
            })
        },
    },
    watch: {
        library() {
            console.log('Library changed', this.library)
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