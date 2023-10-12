
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

image {
    display: inline;
}

.v-list-item__content {
    display: grid;
    grid-template-columns: 1fr 15fr 1fr;
}
</style>
<template>
    <v-container class="top" fluid px-0>
        <v-radio-group v-model="selectedOption" row>
            <v-radio :class="selectedOption === 'webnovel' ? 'active' : 'boh'" label="Webnovel" value="webnovel" off-icon=""
                on-icon=""></v-radio>
            <v-radio :class="selectedOption === 'mtlnovel' ? 'active' : 'boh'" label="MTLNovel" value="mtlnovel" off-icon=""
                on-icon=""></v-radio>
            <!-- Add more options here -->
        </v-radio-group>
        <v-combobox label="Search novels" :items="items" v-model:search="search" persistent-hint :hide-no-data="false"
            @update:search="searchHints" @change="searchHints" dense hide-details="false">
            <template #item="{ item }">
                <v-list-item ripple> <!--  @click="select(item)" -->
                    <!-- <img :src="item.raw.image" :alt="item.raw.image" /> -->
                    <v-img :src="item.raw.image" :alt="item.raw.image" width="40" height="60"></v-img>
                    <a :href="item.raw.url" target="_blank">
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                    </a>
                    <v-btn @click="handleButtonClick(item.raw)" :color="libraryUrls.includes(item.raw.url) ? 'success' : 'primary'">
                        <v-icon>{{ libraryUrls.includes(item.raw.url) ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                    </v-btn>
                </v-list-item>
            </template>
        </v-combobox>
        <!-- <v-autocomplete v-model="values" :items="items" label="Default" density="comfortable"></v-autocomplete> -->
    </v-container>
</template>
<script>
import axios from 'axios'
// TODO: Separate the buttons by url? And add to the list the ones already in the library
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
            library: [],
            libraryUrls: []
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
        searchHints() {
            if (this.timer) {
                clearTimeout(this.timer)
            }
            if (this.search && this.search.length > 2) {
                this.timer = setTimeout(() => {
                    this.currentText = this.search
                    this.items = []
                    axios.get(`http://localhost:3000/api/${this.selectedOption}/search?query=${this.search}`)
                        .then((response) => {
                            this.items = response.data
                            console.log(this.items)
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }, 1000);
            } else {
                this.items = []
            }
            console.log(this.currentText, this.search)
        },
        handleButtonClick(novel) {
            console.log(novel)
            // Call your function here
            // For demonstration, we'll just toggle the icon and color
            let added = true;
            if (this.libraryUrls.includes(novel.url))
                added = false;

            if (added) {
                axios.post('http://localhost:3000/api/library', {
                    title: novel.title.replace('<strong>', '').replace('</strong>', ''),
                    url: novel.url,
                    image: novel.image,
                    source: this.selectedOption
                })
                    .then((response) => {
                        console.log(response)
                        this.libraryUrls.push(novel.url)
                        this.library.push(novel)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } else {
                axios.delete(`http://localhost:3000/api/library/`, {
                    body: {
                        url: novel.url
                    }
                })
                    .then((response) => {
                        console.log(response)
                        this.libraryUrls = this.libraryUrls.filter((url) => url !== novel.url)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        }
    },
    watch: {
        selectedOption() {
            this.searchHints()
        }
    }
}
</script>
