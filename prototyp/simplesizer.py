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
        self.pitch_factor = 1.0  # Standard-Tonhöhenfaktor
        self.speedup_factor = 1.0  # Standard-Geschwindigkeitsfaktor

    def play(self):
        adjusted_sound = self.sound._spawn(self.sound.raw_data, overrides={
            "frame_rate": int(self.sound.frame_rate * self.pitch_factor)
        })
        #adjusted_sound = adjusted_sound.speedup(playback_speed=self.speedup_factor)
        pygame.mixer.music.load(adjusted_sound.export(format="wav"))
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

    def restart(self):
        pygame.mixer.music.rewind()
        self.paused = False
        self.stopped = False
        self.play()

    def change_pitch(self, pitch_factor):
        self.pitch_factor = pitch_factor

    def change_speed(self, speedup_factor):
        self.speedup_factor = speedup_factor



if __name__ == "__main__":
    sound_file_path = "../example/sounds/NeverGonnaGiveYouUp.MP3"
    player = SoundPlayer(sound_file_path)
    while True:
        command = input(
            "Enter 'a' to play, 'p' to pause, 'r' to resume, 's' to stop, 'q' to quit, 'c' to restart, 't' to change pitch, or 'g' to change speed: ").lower()
        if command == 'a':
            print(f"Playing sound: {sound_file_path}")
            player.play()
        elif command == 'p':
            player.pause()
            print("Paused")
        elif command == 'r':
            player.resume()
            print("Resumed")
        elif command == 's':
            player.stop()
            print("Stopped")
        elif command == 'q':
            player.stop()
            print("Exiting")
            break
        elif command == 'c':
            player.restart()
            print("Restarted")
        elif command == 't':
            try:
                pitch_factor = float(input("Enter pitch factor (e.g., 2.0 for double, 0.5 for half): "))
                player.change_pitch(pitch_factor)
                print(f"Changed pitch to {pitch_factor}")
                player.restart()
            except ValueError:
                print("Invalid pitch factor. Please enter a valid number.")
        elif command == 'g':
            try:
                speedup_factor = float(input("Enter speedup factor (e.g., 2.0 for double, 0.5 for half): "))
                player.change_speed(speedup_factor)
                print(f"Changed speed to {speedup_factor}")
                player.restart()
            except ValueError:
                print("Invalid speedup factor. Please enter a valid number.")
        else:
            print("Invalid command")
        time.sleep(0.1)  # Let the main thread sleep to avoid high CPU usage
