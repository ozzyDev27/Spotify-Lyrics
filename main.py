import pygetwindow as gw
import psutil
import win32process
import lyricsgenius as lg
import re

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

song_window = next((window for window, process_name in zip(windows, process_names) if process_name == spotify_process_name), None)

if not song_window:
    print("Spotify isn't running!")
    exit()

genius = lg.Genius("THIS API KEY IS NOT REQUIRED - YOU DON'T NEED TO REPLACE THIS! :D")

#while song_window:
window_title_parts = song_window.title.split(" - ")
song_title = window_title_parts[1]
song = genius.search_song(song_title, window_title_parts[0])
lyrics=re.sub(r'\d+Embed$', '', song.lyrics.split(f"{song_title} Lyrics")[1]) if song else f"Lyrics to {song_title} by {window_title_parts[0]} not found!"
print(lyrics)