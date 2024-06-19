<template>
    <v-container fluid>
        <v-text-field v-model="search" label="Search in library"></v-text-field>
        <div class="end">
            <v-select v-model="order" label="Order" :items="orders" item-title="name" item-value="value" hint="Order by"
                persistent-hint single-line style="max-width: 10%" @update:modelValue="updateOrder()"></v-select>
            <v-select v-model="direction" label="Direction" :items="directions" item-title="name" item-value="value"
                hint="Direction" persistent-hint single-line style="max-width: 10%"
                @update:modelValue="updateOrder()"></v-select>
        </div>
        <div class="container">
            <v-card v-for="novel in filteredLibrary" :key="novel.title" class="note">
                <div style="position:absolute; top:0; right: 0; z-index: 1;">
                    <v-btn elevation="0" icon @click="goToEdit(novel)"
                        style="background-color: rgba(255, 255, 255, 0.5)">
                        <v-icon
                            :style="novel.image.includes('no-image') ? 'color: white' : 'color: black'">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn elevation="0" icon @click="deleteNovel(novel)"
                        style="background-color: rgba(255, 255, 255, 0.5);">
                        <v-icon
                            :style="novel.image.includes('no-image') ? 'color: white' : 'color: black'">mdi-trash-can</v-icon>
                    </v-btn>
                </div>
                <div class="center">
                    <v-img class="imageThumb" :src="novel.image" cover width="auto" height="276px">
                        <img @error="this.src = this.src" />
                    </v-img>
                </div>
                <v-card-title :title="novel.title" :style="novel.image.includes('no-image') ? 'width: 80%' : ''"><a
                        :href="novel.url" target="_blank">{{ novel.title }}</a></v-card-title>
                <v-card-subtitle v-if="novel.chapter">Last read: {{ novel.chapter }}</v-card-subtitle>
                <div style="margin: 5px 0px 0px 10px" v-if="novel.rating !== 0">
                    <v-icon :color="getColor(novel)"
                        v-for="i in [...Array(Math.floor(novel.rating || 0)).keys()]">mdi-star</v-icon>
                    <v-icon :color="getColor(novel)"
                        v-if="Math.floor(novel.rating) < novel.rating">mdi-star-half</v-icon>
                    <v-icon v-for="i in [...Array(10 - Math.ceil(novel.rating || 0)).keys()]">mdi-star-outline</v-icon>
                    <span style="margin-left: 3px; font-size: 1rem; vertical-align:middle">({{ novel.rating }})</span>
                </div>
                <div style="margin: 5px 0px 0px 10px" v-if="novel.rating === 0">
                    <v-icon v-if="novel.rating === 0" v-for="i in Array(10).keys()"
                        style="color: brown">mdi-emoticon-poop</v-icon>
                </div>

                <v-card-text v-if="novel.kisses">Kisses: {{ novel.kisses }}</v-card-text>

                <div class="review-container">
                    <v-card-text v-if="!showMore[novel.id]" v-html="getReview(novel)"></v-card-text>
                    <a class="show-more-link" v-if="!showMore[novel.id] && novel.review && novel.review.length > longReviewLength" @click="toggleReview(novel)">Show more</a>
                </div>


                <div class="review-container">
                    <v-card-text v-if="showMore[novel.id]" v-html="novel.review.replace('\n', '<br/>')"></v-card-text>

                    <a class="show-more-link" v-if="showMore[novel.id] && novel.review.length > longReviewLength" @click="toggleReview(novel)">Show less</a>
                </div>

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
            order: 0,
            orders: [
                {
                    name: 'Last added',
                    value: 0,
                },
                {
                    name: 'Rating',
                    value: 1,
                },
                {
                    name: 'Chapter',
                    value: 2,
                },
                {
                    name: 'Title',
                    value: 3,
                },
            ],
            direction: 0,
            directions: [
                {
                    name: 'Descending',
                    value: 0,
                },
                {
                    name: 'Ascending',
                    value: 1,
                },
            ],
            showMore: {},
            longReviewLength: 200,
        }
    },
    props: ['library', 'libraryUrls'],
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
            let ok = confirm(`Are you sure you want to delete ${novel.title}?`)
            if (!ok)
                return
            axios.delete('http://localhost:3000/api/library/', { data: { url: novel.url } })
                .then((response) => {
                    let updatedLibrary = this.library.filter((item) => item.url !== novel.url)
                    this.$emit('add-novel', updatedLibrary)
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        updateOrder() {
            this.$emit('update-order', this.order, this.direction)
        },
        getReview(novel) {
            if (!novel.review)
                return 'No review yet'
            let review = novel.review.replace('\n', '<br/>')
            if (review.length > this.longReviewLength) {
                review = review.substr(0, this.longReviewLength)
                review += '...'
            }
            return review
        },
        toggleReview(novel) {
            // The value is undefined if the novel is not in the list, so I must the it manually
            this.showMore[novel.id] = !(this.showMore[novel.id] === true)
        }
    },
    computed: {
        filteredLibrary() {
            return this.library.filter((novel) => {
                return (novel.title || '').toLowerCase().includes(this.search.toLowerCase()) ||
                    (novel.tags || '').toLowerCase().includes(this.search.toLowerCase()) ||
                    (novel.review || '').toLowerCase().includes(this.search.toLowerCase());
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
    /* -webkit-column-count: 4; */
    /* Chrome, Safari, Opera */
    /* -moz-column-count: 4; */
    /* Firefox */
    /* column-count: 4; */
    /* -webkit-column-gap: .5rem; */
    /* Chrome, Safari, Opera */
    /* -moz-column-gap: .5rem; */
    /* Firefox */
    /* column-gap: .5rem; */
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    row-gap: 35px;
}


.note {
    /* width: calc(100% / 1); */
    /* margin: 15px; */
    width: fit-content;
    max-width: 18vw;
}

.end {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.v-select {
    width: 20% !important;
}

.review-container {
    display: flex;
    flex-direction: column;
}

.show-more-link {
    align-self: flex-end;
    margin-top: 10px;
    /* Adjust margin as needed */
}

/** Mobile devices */

@media (max-width: 767px) {
    .container {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        row-gap: 35px;
    }

    .note {
        /* width: calc(100% / 1); */
        /* margin: 15px; */
        width: fit-content;
        max-width: 75vw;
    }

    .v-select {
        max-width: 50% !important;
        margin-bottom: 20px;
    }
}

@media (max-width: 1250px) and (min-width: 768px) {
    .container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        row-gap: 35px;
    }

    .note {
        /* width: calc(100% / 1); */
        /* margin: 15px; */
        width: fit-content;
        max-width: 35vw;
    }

    .v-select {
        max-width: 50% !important;
        margin-bottom: 20px;
    }
}

</style>

<style>

.v-img__img--cover {
    object-fit: cover;
    width: auto !important;
}

.imageThumb {
    flex: inherit !important;
}
</style>