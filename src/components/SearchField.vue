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
            @update:search="searchHints" @change="searchHints">
            <template #item="{ item }">
                <v-list-item ripple class="result"> <!--  @click="select(item)" -->
                    <!-- <img :src="item.raw.image" :alt="item.raw.image" /> -->
                    <v-img :src="item.raw.image" :alt="item.raw.image" width="40" height="60"></v-img>
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
        </v-combobox>
        <!-- <v-autocomplete v-model="values" :items="items" label="Default" density="comfortable"></v-autocomplete> -->
    </v-container>
</template>
<script>
import axios from 'axios'
export default {
    data() {
        return {
            selectedOption: 'mtlnovel',
            currentText: '',
            search: null,
            values: '',
            items: [],
            buttonIcon: 'mdi-plus',
            buttonColor: 'primary',
        }
    },
    props: ['library', 'libraryUrls'],
    computed: {
    },
    created() {
        // axios.get('http://localhost:3000/api/library')
        //     .then((response) => {
        //         this.library = response.data
        //         this.libraryUrls = this.library.map((novel) => novel.url)
        //     })
        //     .catch((error) => {
        //         console.log(error)
        //     })
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
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }, 1000);
            } else {
                this.items = []
            }
        },
        async handleButtonClick(novel) {
            // Call your function here
            // For demonstration, we'll just toggle the icon and color
            let added = true;
            if (this.libraryUrls.includes(novel.url))
                added = false;

            if (this.selectedOption === 'mtlnovel')
                novel.title = novel.title.replace('<strong>', '').replace('</strong>', '')

            if (added) {
                return await axios.post('http://localhost:3000/api/library', {
                    title: novel.title,
                    url: novel.url,
                    image: novel.image,
                    source: this.selectedOption
                })
                    .then((response) => {
                        // this.libraryUrls.push(novel.url)
                        let updatedLibrary = [novel, ...this.library]
                        this.$emit('add-novel', updatedLibrary); // Emit an event with the new data
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } else {
                return await axios.delete(`http://localhost:3000/api/library/`, {
                    data: {
                        url: novel.url
                    }
                })
                    .then((response) => {
                        let updatedLibrary = this.library
                        updatedLibrary = updatedLibrary.filter((item) => item.url !== novel.url)
                        this.$emit('add-novel', updatedLibrary); // Emit an event with the new data
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        },
        addAndEdit(novel) {
            this.handleButtonClick(novel).then(_ => {
                localStorage.setItem('novel', JSON.stringify(novel))
                this.$router.push({ name: 'Edit' })
            })
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