import pygetwindow as gw
import psutil
import win32process
import lyricsgenius as lg
import re
import tkinter as tk

def nums(s):
    return re.sub(r'\d+$', '', s)

spotify_process_name = "Spotify.exe"

windows = gw.getWindowsWithTitle("")
process_names = []

for window in windows:
    try:
        process_id = win32process.GetWindowThreadProcessId(window._hWnd)[1]
        process_name = psutil.Process(process_id).name()
        process_names.append(process_name)
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        process_names.append("(not available)")

songProcess = next((window for window, process_name in zip(windows, process_names) if process_name == spotify_process_name), None)

if not songProcess:
    print("Spotify isn't running!")
    exit()

genius = lg.Genius("THIS API KEY IS NOT REQUIRED - YOU DON'T NEED TO REPLACE THIS! :D")

app = tk.Tk()
app.title("LyricSpot")

# Custom font settings
custom_font = ("Verdana", 12)  # Change to your desired font family and size

current_title = ""
current_lyrics = ""

def getLyrics(song_window):
    global current_title, current_lyrics
    window_title_parts = song_window.title.split(" - ")

    try:
        main_title_match = re.match(r'^(.*?)\s*(\(\s*with.*\))?\s*$', window_title_parts[1])
        song_title = main_title_match.group(1).strip() if main_title_match else window_title_parts[1]
    except:
        pass
    
    song_artist = window_title_parts[0]

    if song_artist != "Spotify Free":
        new_title = f"LyricSpot: {main_title_match.group(1).strip() if main_title_match else songProcess.title.split(' - ')[1]}"
        if new_title != current_title:
            song = genius.search_song(song_title, song_artist)
            app.title(new_title)
            current_title = new_title
            lyrics_match = re.search(r'\[.*?\]([\s\S]*)\d+Embed', song.lyrics)
            new_lyrics = nums(lyrics_match.group(1).strip()).replace("[", "\n[").replace("\n\n\n", "\n\n") if lyrics_match else f"No lyrics found for {song_title} by {song_artist} on Genius."
            text.config(state=tk.NORMAL, font=custom_font)
            text.delete("1.0", tk.END)
            text.insert(tk.END, new_lyrics)
            text.config(state=tk.DISABLED)
            current_lyrics = new_lyrics

def loop():
    getLyrics(songProcess)
    app.after(500, loop)

text = tk.Text(app, state=tk.DISABLED)
text.pack(fill=tk.BOTH, expand=True)

app.after(1, loop)
app.mainloop()
