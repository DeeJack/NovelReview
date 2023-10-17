<template>
    <!-- <Container @drop="onDrop"> https://github.com/amendx/vue-dndrop
        <Draggable v-for="item in items" :key="item.id">
            <div class="draggable-item">
                {{ item.title }}
            </div>
        </Draggable>
    </Container> -->
    <v-container fluid>

        <v-textarea v-model="nextReads" @update:modelValue="saveChanges" auto-grow>

        </v-textarea>
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            nextReads: '',
            timer: null,
        }
    },
    methods: {
        saveChanges() {
            if (this.timer) {
                clearTimeout(this.timer)
            }
            this.timer = setTimeout(() => {
                this.currentText = this.search
                this.items = []
                axios.put(`http://localhost:3000/api/next`, {
                    text: this.nextReads
                })
                    .then((response) => {
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }, 500);
        }
    },
    computed: {

    },
    watch: {
        nextReads: function (val) {
            // this.saveChanges()
        }
    },
    created() {
        axios.get('http://localhost:3000/api/next').then(response => {
            this.nextReads = response.data.description
        }).catch(error => {
            console.log(error)
        });
    }
}
</script>

<style>
.v-textarea {
    height: 100vh;
}
</style>