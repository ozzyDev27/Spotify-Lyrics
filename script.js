const clientid = "1063ae9e20aa4f6f8d2bb1092f86e73e"
const redirecturi = "http://localhost:5500"
const scopes = "user-read-currently-playing user-read-playback-state"
const authurl = `https://accounts.spotify.com/authorize?client_id=${clientid}&response_type=token&redirect_uri=${encodeURIComponent(
  redirecturi
)}&scope=${encodeURIComponent(scopes)}`

let accesstoken = ""
let currentsongid = ""

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

            // Hide overlay and show main UI
            document.getElementById("overlay").style.display = "none"
            document.getElementById("maincontainer").classList.remove("hidden")

            fetchnowplaying()
            setInterval(fetchnowplaying, 100) // Fetch song every 0.1s
        }
    }
}

async function fetchlyrics(song, artist) {
    const formattedSong = song.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    const formattedArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    const lyricsUrl = `https://genius.com/${formattedArtist}-${formattedSong}-lyrics`

    try {
        const response = await fetch(`/lyrics?url=${encodeURIComponent(lyricsUrl)}`)
        const data = await response.json()
        if (data.lyrics) {
            document.getElementById("lyrics").textContent = data.lyrics
        } else {
            document.getElementById("lyrics").textContent = "Lyrics not found."
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
                const newsongid = data.item.id // Get the song's unique ID

                if (newsongid !== currentsongid) { 
                    // Only update lyrics if the song has changed
                    currentsongid = newsongid 

                    document.getElementById("albumart").src = data.item.album.images[0].url
                    document.getElementById("songtitle").textContent = data.item.name
                    document.getElementById("artistname").textContent = data.item.artists.map(artist => artist.name).join(", ")

                    const song = data.item.name
                    const artist = data.item.artists[0].name
                    fetchlyrics(song, artist) // Fetch lyrics only when song changes
                }
            }
        }
    } catch (error) {
        console.error("Error fetching now playing:", error)
    }
}

window.onload = getaccesstoken
