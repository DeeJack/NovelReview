import axios from 'axios'

async function search(query) {
    let results = await axios.get(`/api/search?query=${query}`)
    return results.data
}

export default {
    search
}