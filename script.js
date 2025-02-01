const clientid = "1063ae9e20aa4f6f8d2bb1092f86e73e"
const redirecturi = "http://localhost:5500"
const scopes = "user-read-currently-playing user-read-playback-state"
const authurl = `https://accounts.spotify.com/authorize?client_id=${clientid}&response_type=token&redirect_uri=${encodeURIComponent(
  redirecturi
)}&scope=${encodeURIComponent(scopes)}`

let accesstoken = ""

document.getElementById("loginbutton").addEventListener("click", () => {
    window.location.href = authurl
})

function getaccesstoken() {
    const hash = window.location.hash
    if (hash.includes("access_token")) {
        const tokenmatch = hash.match(/access_token=([^&]*)/)
        if (tokenmatch) {
            accesstoken = tokenmatch[1]
            window.location.hash = ""
            fetchnowplaying()
            setInterval(fetchnowplaying, 5000)
        }
    }
}

async function fetchlyrics(song, artist) {
    try {
        const response = await fetch(`/lyrics?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`)
        const data = await response.json()
        if (data.lyrics && data.lyricsurl) {
            document.getElementById("lyricscontainer").classList.remove("hidden")
            document.getElementById("lyrics").textContent = data.lyrics
            document.getElementById("lyricslink").href = data.lyricsurl
            document.getElementById("lyricslink").textContent = "View on Genius"
        } else {
            document.getElementById("lyrics").textContent = "Lyrics not found."
            document.getElementById("lyricslink").href = "#"
            document.getElementById("lyricslink").textContent = ""
        }
    } catch (error) {
        console.error("Error fetching lyrics:", error)
        document.getElementById("lyrics").textContent = "Error loading lyrics."
    }
}

async function fetchnowplaying() {
    if (!accesstoken) return

    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${accesstoken}` }
        })

        if (response.status === 200) {
            const data = await response.json()
            if (data.item) {
                document.getElementById("songinfo").classList.remove("hidden")
                document.getElementById("albumart").src = data.item.album.images[0].url
                document.getElementById("songtitle").textContent = data.item.name
                document.getElementById("artistname").textContent = data.item.artists.map(artist => artist.name).join(", ")
                document.getElementById("albumname").textContent = `Album: ${data.item.album.name}`
                document.getElementById("songlink").href = data.item.external_urls.spotify

                const song = data.item.name
                const artist = data.item.artists[0].name
                fetchlyrics(song, artist)
            } else {
                document.getElementById("songinfo").classList.add("hidden")
            }
        } else {
            console.log("No song is currently playing.")
        }
    } catch (error) {
        console.error("Error fetching now playing:", error)
    }
}

window.onload = getaccesstoken
