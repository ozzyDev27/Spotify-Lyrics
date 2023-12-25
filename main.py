import pygetwindow as gw
import psutil
import win32process

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
print("Process Names:", process_names)
song = next((window for window, process_name in zip(windows, process_names) if process_name == spotify_process_name), None)
if not song:
    print("Spotify isn't running!")
    exit()


while song:
    print(song.title.split(" - ")[1])