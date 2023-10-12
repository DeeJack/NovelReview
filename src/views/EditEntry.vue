<template>
    <v-form v-model="valid" fast-fail @submit.prevent ref="form">
        <p>{{ valid }}</p>
        <v-text-field v-model="title" :rules="rules.rule" label="Title" required></v-text-field>
        <v-text-field v-model="chapter" :rules="rules.numberRules" type="number" label="Last chapter"
            required></v-text-field>
        <v-text-field v-model="rating" :rules="rules.numberRules" type="number" label="Rating" required></v-text-field>

        <v-textarea v-model="review" label="Review" :rules="rules.rule"></v-textarea>

        <div class="center">
            <v-btn :disabled="!valid" color="success" style="color: black" @click="save()">Save</v-btn>
        </div>
    </v-form>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            valid: false,
            title: '',
            chapter: 0,
            rating: 6,
            review: '',

            rules: {
                rule: [v => !!v || 'Required'],
                numberRules: [v => !!v || 'Required', v => !isNaN(v) || 'No!'],
            }
        }
    },
    props: {
        novel: {
            type: Object,
            required: true
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
            }

            axios.put('http://localhost:3000/api/library', novel)
                .then((response) => {
                    console.log(response)
                })
                .catch((error) => {
                    console.log(error)
                });
        }
    },
    created() {
        this.title = this.novel.title
        this.chapter = this.novel.chapter
        this.rating = this.novel.rating
        this.review = this.novel.review
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