import axios from 'axios'

async function search(query) {
    let results = await axios.get('http://localhost:3000/search?query=' + query)
    return results.data
}

export default {
    search
}