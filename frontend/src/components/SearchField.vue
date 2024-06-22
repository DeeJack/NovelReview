<template>
    <v-container class="top" fluid px-0>
        <v-radio-group v-model="selectedOption" row>
            <v-radio :class="selectedOption === 'webnovel' ? 'active' : 'boh'" label="Webnovel" value="webnovel"
                off-icon="" on-icon=""></v-radio>
            <v-radio :class="selectedOption === 'mtlnovel' ? 'active' : 'boh'" label="MTLNovel" value="mtlnovel"
                off-icon="" on-icon=""></v-radio>
            <!-- Add more options here -->
        </v-radio-group>
        <v-combobox label="Search novels" :items="items" v-model:search="search" persistent-hint :hide-no-data="false"
            @update:search="searchHints" @change="searchHints">
            <template #item="{ item }">
                <v-list-item ripple class="result"> <!--  @click="select(item)" -->
                    <!-- <img :src="item.raw.image" :alt="item.raw.image" /> -->
                    <v-img :src="item.raw.image.includes('webnovel.com') ? '' : item.raw.image" :alt="item.raw.image"
                        width="40" height="60"></v-img>
                    <a :href="item.raw.url" target="_blank">
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                    </a>
                    <v-btn v-if="!libraryUrls.includes(item.raw.url)" @click="addAndEdit(item.raw)"
                        :color="libraryUrls.includes(item.raw.url) ? 'success' : 'primary'" icon>
                        <v-icon>mdi-book-edit</v-icon>
                    </v-btn>
                    <v-btn @click="handleButtonClick(item.raw)" icon
                        :color="libraryUrls.includes(item.raw.url) ? 'success' : 'primary'">
                        <v-icon>{{ libraryUrls.includes(item.raw.url) ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                    </v-btn>
                </v-list-item>
            </template>
            <template v-slot:no-data>
                <v-list-item>
                    <v-list-item-title>
                        No results matching "<strong>{{ search }}</strong>".
                    </v-list-item-title>
                </v-list-item>
            </template>
            <template #prepend-item>
                <v-progress-linear v-if="loading" color="deep-purple-accent-4" height="6" indeterminate
                    rounded></v-progress-linear>
            </template>
        </v-combobox>
        <!-- <v-autocomplete v-model="values" :items="items" label="Default" density="comfortable"></v-autocomplete> -->
    </v-container>
</template>
<script>
import axios from 'axios'
import { checkLogin } from '../App.vue';

export default {
    data() {
        return {
            selectedOption: 'webnovel',
            currentText: '',
            search: null,
            values: '',
            items: [],
            buttonIcon: 'mdi-plus',
            buttonColor: 'primary',
            loading: false,
        }
    },
    props: ['library', 'libraryUrls'],
    methods: {
        searchHints() {
            if (!checkLogin())
                return;
            this.loading = true
            if (this.timer) {
                clearTimeout(this.timer)
            }
            if (this.search && this.search.length > 2) {
                this.timer = setTimeout(() => {
                    this.currentText = this.search
                    this.items = []
                    axios.get(`/api/${this.selectedOption}/search?query=${this.search}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        }
                    })
                        .then((response) => {
                            this.items = response.data
                            this.loading = false
                        })
                        .catch((error) => {
                            console.log(error)
                            this.loading = false
                        })
                }, 1000);
            } else {
                this.items = []
                this.loading = false
            }
        },
        async handleButtonClick(novel) {
            if (!checkLogin())
                return;

            let added = true;
            if (this.libraryUrls.includes(novel.url))
                added = false;

            if (this.selectedOption === 'mtlnovel')
                novel.title = novel.title.replace('<strong>', '').replace('</strong>', '')

            if (added) {
                let updatedLibrary = [novel, ...this.library]
                this.$emit('add-novel', updatedLibrary); // Emit an event with the new data
                axios.post(`/api/library`, {
                    title: novel.title,
                    url: novel.url,
                    image: novel.image,
                    source: this.selectedOption,
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    }
                })
                    .then((response) => {
                        novel.image = response.data.image
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                return;
            }
            let updatedLibrary = this.library
            updatedLibrary = updatedLibrary.filter((item) => item.url !== novel.url)
            this.$emit('add-novel', updatedLibrary); // Emit an event with the new data
            axios.delete(`/api/library/`, {
                url: novel.url,
            }, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }
            })
                .catch((error) => {
                    console.log(error)
                })
        },
        addAndEdit(novel) {
            if (!this.checkLogin())
                return;

            this.handleButtonClick(novel)
            localStorage.setItem('novel', JSON.stringify(novel))
            this.$router.push({ name: 'Edit' })
        }
    },
    watch: {
        selectedOption() {
            this.searchHints()
        }
    }
}
</script>

<style>
.v-selection-control-group {
    flex-direction: row !important;
}

.v-selection-control__input+.v-selection-control__wrapper {
    display: none !important;
    width: 0px !important;
}

.v-label--clickable {
    width: 100% !important;
    text-align: center !important;
}

.active {
    background-color: #232D3F;
    /* background-color: #ae6f2f; */
    /* stroke: rgba(255,255,255,0.4); */
    /* filter: drop-shadow(0 0 10px rgb(255,255,255)); */
    color: white;
}

.top {
    top: 0;
}

.v-container--fluid {
    max-width: 80% !important;
}

/** A lot of CSS MAGIC to make the little popup for the combobox the same width as the combobox and that doesn't break the "no result found" words */

.v-overlay-container>* {
    overflow: hidden !important;
}

.v-list-item-title {
    hyphens: none !important;
}

.v-overlay__content {
    width: fit-content !important;
    overflow-x: hidden !important;
    overflow: hidden !important;
}

/* .v-overlay-container .v-list-item__content {
    grid-area: unset !important;
    display: block  !important;
} */

image {
    display: inline;
}

.result .v-list-item__content {
    display: grid;
    grid-template-columns: 1fr 15fr 1fr 1fr;
}
</style>