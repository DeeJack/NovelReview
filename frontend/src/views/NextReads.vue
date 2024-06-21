<template>
    <!-- <Container @drop="onDrop"> https://github.com/amendx/vue-dndrop
        <Draggable v-for="item in items" :key="item.id">
            <div class="draggable-item">
                {{ item.title }}
            </div>
        </Draggable>
    </Container> -->
    <v-container fluid>
        <!-- v-on:keypress.prevent="onKeyPressed" -->

        <div style="position: relative;">

            <v-textarea v-model="nextReads" @update:modelValue="saveChanges" auto-grow v-on:keyup="onKeyPressed">

            </v-textarea>
            <span style="position: absolute; bottom: 0; right: 0; margin: 5px; margin-bottom: 25px;" v-if="lastUpdated">Last
                updated: {{ lastUpdated }}</span>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            nextReads: '',
            timer: null,
            lastUpdated: '',
            loading: false,
            beforeUnloadHandler: (event) => {
                if (this.loading)
                    event.preventDefault();
                console.log(this.loading)
            }
        }
    },
    methods: {
        saveChanges() {
            if (!this.loading) {
                window.addEventListener('beforeunload', this.beforeUnloadHandler)
            }

            this.loading = true
            this.lastUpdated = ''

            
            if (this.timer) {
                clearTimeout(this.timer)
            }
            
            this.timer = setTimeout(() => {
                axios.put(`/api/next`, {
                    text: this.nextReads
                })
                    .then((response) => {
                        this.lastUpdated = new Date().toLocaleString()
                        this.loading = false
                        window.removeEventListener('beforeunload', this.beforeUnloadHandler)
                    })
                    .catch((error) => {
                        console.log(error)
                        this.loading = false
                        window.removeEventListener('beforeunload', this.beforeUnloadHandler)
                    })
            }, 500);
        },
        onKeyPressed(e) {
            let textArea = e.target
            let previousLines = textArea.value.substr(0, textArea.selectionStart).split("\n")
            // console.log(changedText)
            if (e.keyCode === 13 && previousLines.length > 1) { // Enter
                console.log(previousLines)
                let firstWord = previousLines[previousLines.length - 2].split('.').length > 0 ? previousLines[previousLines.length - 2].split('.')[0] : ''
                console.log(firstWord)
                if (isNaN(firstWord))
                    return
                let number = parseInt(firstWord)
                console.log('Number: ', number)
                if (number > 0) {
                    let newText = textArea.value.substr(0, textArea.selectionStart) + '' + (number + 1) + '. ' + textArea.value.substr(textArea.selectionStart + 1)
                    textArea.value = newText
                    textArea.selectionStart = newText.length
                    textArea.selectionEnd = newText.length
                }
                console.log(e)
            }
        }
    },
    computed: {

    },
    watch: {
        nextReads: function (val) {
        }
    },
    created() {
        axios.get(`/api/next`).then(response => {
            this.nextReads = response.data.description
        }).catch(error => {
            console.log(error)
        });
    }
}
</script>

<style>
.v-textarea {
    /* height: 100vh; */
}
</style>