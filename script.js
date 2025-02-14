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

            document.getElementById("overlay").style.display = "none"
            document.getElementById("maincontainer").classList.remove("hidden")

            fetchnowplaying()
            setInterval(fetchnowplaying, 100)
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
            document.getElementById("lyrics").textContent = "Error loading lyrics! If that's a mistake, add a manual link!"
        }
    } catch (error) {
        console.error("Error fetching lyrics:", error)
        document.getElementById("lyrics").textContent = "Error loading lyrics! If that's a mistake, add a manual link!"
    }
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

window.onload = function() {
    var userTextbox = document.getElementById('usertextbox');
    var savedText = getCookie('userText');
    if (savedText) {
        userTextbox.value = savedText;
    }

    userTextbox.addEventListener('input', function() {
        setCookie('userText', userTextbox.value, 7);
    });

    getaccesstoken();
};

var modal = document.getElementById("manualgeniusmodal");
var btn = document.getElementById("manualgeniusbutton");
var span = document.getElementsByClassName("close")[0];
var saveBtn = document.getElementById("savemanualgenius");

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

saveBtn.onclick = function() {
    var manualLink = document.getElementById("manualgeniusinput").value;
    if (manualLink) {
        console.log("Manual link saved:", manualLink);
        fetchManualLyrics(manualLink);
    } else {
        const song = document.getElementById("songtitle").textContent;
        const artist = document.getElementById("artistname").textContent;
        console.log("Reverting to assumed link with song:", song, "and artist:", artist);
        fetchlyrics(song, artist);
    }
    modal.style.display = "none";
}

async function fetchManualLyrics(url) {
    console.log("Fetching manual lyrics from URL:", url);
    try {
        const response = await fetch(`/lyrics?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data.lyrics) {
            console.log("Lyrics fetched successfully:", data.lyrics);
            document.getElementById("lyrics").textContent = data.lyrics;
        } else {
            console.log("Error loading lyrics from manual link");
            document.getElementById("lyrics").textContent = "Error loading lyrics! If that's a mistake, add a manual link!";
        }
    } catch (error) {
        console.error("Error fetching lyrics:", error);
        document.getElementById("lyrics").textContent = "Error loading lyrics! If that's a mistake, add a manual link!";
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
                const newsongid = data.item.id

                if (newsongid !== currentsongid) { 
                    currentsongid = newsongid 

                    const song = data.item.name
                    const artist = data.item.artists[0].name
                    console.log("Now playing song:", song, "by artist:", artist);
                    fetchlyrics(song, artist)
                    document.getElementById("albumart").src = data.item.album.images[0].url
                    document.getElementById("songtitle").textContent = data.item.name
                    document.getElementById("artistname").textContent = data.item.artists.map(artist => artist.name).join(", ")
                    window.scrollTo(0, 0)
                }
            }
        }
    } catch (error) {
        console.error("Error fetching now playing:", error)
    }
}
