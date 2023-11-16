from pydub import AudioSegment
import pygame
import threading
import time

class SoundPlayer:
    def __init__(self, file_path):
        pygame.mixer.init()
        self.sound = AudioSegment.from_file(file_path)
        self.paused = False
        self.stopped = False

    def play(self):
        pygame.mixer.music.load(self.sound.export(format="wav"))
        pygame.mixer.music.play()

    def pause(self):
        pygame.mixer.music.pause()
        self.paused = True

    def resume(self):
        pygame.mixer.music.unpause()
        self.paused = False

    def stop(self):
        pygame.mixer.music.stop()
        self.stopped = True

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
