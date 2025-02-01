const express = require("express")
const path = require("path")
const axios = require("axios")
const cheerio = require("cheerio")
const cors = require("cors")

const app = express()
const port = 5500

app.use(cors())
app.use(express.static(path.join(__dirname)))

function formatgeniusurl(songtitle, artistname) {
    const formattedsong = songtitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    const formattedartist = artistname.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    return `https://genius.com/${formattedartist}-${formattedsong}-lyrics`
}

async function scrapelyrics(url) {
    try {
        const { data } = await axios.get(url)
        const $ = cheerio.load(data)

        let lyrics = ""
        $(".Lyrics__Container-sc-1ynbvzw-8, .lyrics").each((i, elem) => {
            lyrics += $(elem).text().trim() + "\n\n"
        })

        return lyrics || "Lyrics not found."
    } catch (error) {
        console.error("Error scraping lyrics:", error)
        return "Error fetching lyrics."
    }
}

app.get("/lyrics", async (req, res) => {
    const { song, artist } = req.query
    if (!song || !artist) {
        return res.status(400).json({ error: "Missing song or artist parameters" })
    }

    const lyricsurl = formatgeniusurl(song, artist)
    const lyrics = await scrapelyrics(lyricsurl)

    res.json({ lyrics, lyricsurl })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
