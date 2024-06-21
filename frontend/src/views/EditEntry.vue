<template>
    <v-container fluid>
        <v-form v-model="valid" fast-fail @submit.prevent ref="form">
            <v-text-field v-model="title" :rules="rules.rule" label="Title" required></v-text-field>
            <v-text-field v-model="chapter" :rules="rules.numberRules" type="number" label="Last chapter"></v-text-field>
            <v-text-field v-model="rating" :rules="rules.numberRules" type="number" label="Rating"></v-text-field>
            <v-text-field v-model="notes" label="Notes"></v-text-field>
            <v-text-field v-model="tags" label="Tags (separated by comma)"></v-text-field>

            <v-textarea v-model="review" label="Review" auto-grow></v-textarea>

            <div class="center">
                <v-btn :disabled="!valid" color="success" style="color: black" @click="save()">Save</v-btn>
            </div>
        </v-form>
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            valid: false,
            title: '',
            chapter: 0,
            rating: 0,
            review: '',
            novel: null,
            notes: '',
            tags: '',

            rules: {
                rule: [v => !!v || 'Required'],
                numberRules: [v=> console.log(v) || true, v => v === undefined || v === null || !isNaN(v) || 'No!'],
            }
        }
    },
    methods: {
        async save() {
            const { valid } = await this.$refs.form.validate()

            if (!valid)
                return

            const novel = {
                id: this.novel.id,
                title: this.title,
                chapter: this.chapter,
                rating: this.rating,
                review: this.review,
                notes: this.notes,
                tags: this.tags,
                url: this.novel.url,
            }
            console.log(novel)

            axios.put(`/api/library`, novel)
                .then((response) => {
                    this.$router.push('/')
                })
                .catch((error) => {
                    console.log(error)
                });
        }
    },
    created() {
        this.novel = JSON.parse(localStorage.getItem('novel'))

        if (this.novel === null || this.novel === undefined)
            this.$router.push('/')

        this.title = this.novel.title
        this.chapter = this.novel.chapter
        this.rating = this.novel.rating
        this.review = this.novel.review
        this.notes = this.novel.notes
        this.tags = this.novel.tags
    }
}
</script>
<style>
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.v-btn__content {
    color: black;
}
</style>