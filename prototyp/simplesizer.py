from pydub import AudioSegment
from pydub.playback import play
import threading
import time


class SoundPlayer:
    def __init__(self, file_path):
        self.sound = AudioSegment.from_file(file_path)
        self.playing_thread = None
        self.paused = False
        self.stopped = False

    def play(self):
        self.playing_thread = threading.Thread(target=self._play_sound)
        self.playing_thread.start()

    def pause(self):
        self.paused = True

    def resume(self):
        self.paused = False

    def stop(self):
        self.stopped = True

    def _play_sound(self):
        play(self.sound)

    def _check_stop(self):
        return self.stopped


if __name__ == "__main__":
    sound_file_path = "../example/sounds/NeverGonnaGiveYouUp.MP3"

    player = SoundPlayer(sound_file_path)

    print(f"Playing sound: {sound_file_path}")
    player.play()

    while True:
        command = input("Enter 'p' to pause, 'r' to resume, 's' to stop, or 'q' to quit: ").lower()

        if command == 'p':
            player.pause()
            print("Paused")
        elif command == 'r':
            player.resume()
            print("Resumed")
        elif command == 's':
            player.stop()
            print("Stopped")
            break
        elif command == 'q':
            player.stop()
            print("Exiting")
            break
        else:
            print("Invalid command")

        time.sleep(0.1)  # Let the main thread sleep to avoid high CPU usage
