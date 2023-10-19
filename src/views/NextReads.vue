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

        <v-textarea v-model="nextReads" @update:modelValue="saveChanges" auto-grow
            v-on:keyup="onKeyPressed"
            >

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
    /* height: 100vh; */
}
</style>