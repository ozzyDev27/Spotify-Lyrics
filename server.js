const express = require("express")
const path = require("path")
const axios = require("axios")
const cheerio = require("cheerio")
const cors = require("cors")

const app = express()
const port = 5500

app.use(cors())
app.use(express.static(path.join(__dirname)))

async function scrapelyrics(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            }
        })

        const $ = cheerio.load(data)
        let lyrics = ""

        $("div[data-lyrics-container='true']").each((i, elem) => {
            $(elem).find("br").replaceWith("\n")
            lyrics += $(elem).text().trim() + "\n\n"
        })

        if (!lyrics.trim()) throw new Error("No lyrics found")

        return lyrics
    } catch (error) {
        console.error("Error scraping lyrics:", error.message)
        return "Error fetching lyrics."
    }
}

app.get("/lyrics", async (req, res) => {
    const { url } = req.query
    if (!url) {
        return res.status(400).json({ error: "Missing Genius lyrics URL" })
    }

    const lyrics = await scrapelyrics(url)
    res.json({ lyrics, url })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
