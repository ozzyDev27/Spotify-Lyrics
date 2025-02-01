const axios = require("axios")
const cheerio = require("cheerio")

async function scrapelyrics(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            }
        })

        const $ = cheerio.load(data)
        let lyrics = ""

        // Extract lyrics from the new Genius structure
        $("div[data-lyrics-container='true']").each((i, elem) => {
            $(elem).find("br").replaceWith("\n") // Convert <br> tags to newlines
            lyrics += $(elem).text().trim() + "\n\n"
        })        

        if (!lyrics.trim()) throw new Error("No lyrics found")

        console.log("\nyippee it works:\n")
        console.log(lyrics)
    } catch (error) {
        console.error("woopsicles:", error.message)
    }
}

// Test Genius URL (Replace this with any other song URL)
const testurl = "https://genius.com/Juice-wrld-lobster-pizza-lyrics"

scrapelyrics(testurl)
