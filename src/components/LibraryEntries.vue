<template>
    <v-container fluid>
        <v-text-field v-model="search" label="Search in library"></v-text-field>
        <div class="container">
            <v-card v-for="novel in filteredLibrary" :key="novel.title" class="note">
                <div style="position:absolute; top:0; right: 0; z-index: 1;">
                    <v-btn elevation="0" icon @click="goToEdit(novel)" style="background-color: rgba(255, 255, 255, 0.5)">
                        <v-icon
                            :style="novel.image.includes('no-image') ? 'color: white' : 'color: black'">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn elevation="0" icon @click="deleteNovel(novel)" style="background-color: rgba(255, 255, 255, 0.5);">
                        <v-icon
                            :style="novel.image.includes('no-image') ? 'color: white' : 'color: black'">mdi-trash-can</v-icon>
                    </v-btn>
                </div>
                <v-img :src="novel.image" cover>
                    <img @error="this.src = this.src" />
                </v-img>
                <v-card-title :title="novel.title" :style="novel.image.includes('no-image') ? 'width: 80%' : ''"><a
                        :href="novel.url" target="_blank">{{ novel.title }}</a></v-card-title>
                <v-card-subtitle v-if="novel.chapter">Last read: {{ novel.chapter }}</v-card-subtitle>
                <div style="margin: 5px 0px 0px 10px">
                    <v-icon :color="getColor(novel)"
                        v-for="i in [...Array(Math.floor(novel.rating || 0)).keys()]">mdi-star</v-icon>
                    <v-icon :color="getColor(novel)" v-if="Math.floor(novel.rating) < novel.rating">mdi-star-half</v-icon>
                    <v-icon v-for="i in [...Array(10 - Math.ceil(novel.rating || 0)).keys()]">mdi-star-outline</v-icon>
                    <span style="margin-left: 3px; font-size: 1rem; vertical-align:middle">({{ novel.rating }})</span>
                </div>
                <v-card-text v-if="novel.kisses">Kisses: {{ novel.kisses }}</v-card-text>
                <v-card-text
                    v-html="novel.review ? (novel.review.replace('\n', '<br/>').substr(0, novel.image.includes('no-image') ? '1500' : '200') + '...') : 'No review yet'"></v-card-text>
                <v-chip v-if="novel.tags" v-for="tag in novel.tags.split(',')">
                    {{ tag.trim() }}
                </v-chip>
            </v-card>
        </div>
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
        },
        deleteNovel(novel) {
            axios.delete('http://localhost:3000/api/library/', { data: { url: novel.url } })
                .then((response) => {
                    let updatedLibrary = this.library.filter((item) => item.url !== novel.url)
                    this.$emit('add-novel', updatedLibrary)
                })
                .catch((error) => {
                    console.log(error)
                })
        },
    },
    computed: {
        filteredLibrary() {
            return this.library.filter((novel) => {
                return novel.title.toLowerCase().includes(this.search.toLowerCase()) ||
                    novel.tags.toLowerCase().includes(this.search.toLowerCase()) ||
                    novel.review.toLowerCase().includes(this.search.toLowerCase());
            })
        },
    },
}
</script>

<style scoped>
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.v-card-title {
    font-size: 1.2rem;
}

.container {
    -webkit-column-count: 4;
    /* Chrome, Safari, Opera */
    -moz-column-count: 4;
    /* Firefox */
    column-count: 4;
    -webkit-column-gap: .5rem;
    /* Chrome, Safari, Opera */
    -moz-column-gap: .5rem;
    /* Firefox */
    column-gap: .5rem;

}


.note {
    width: calc(100% / 1);
    margin: 15px;
    width: fit-content;
    max-width: 19vw;
}
</style>