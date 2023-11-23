import sys
import threading
from pydub import AudioSegment
import pygame

class SoundPlayer:
    def __init__(self, file_path):
        self.sound = AudioSegment.from_file(file_path)
        self.pitchValue = 1.0

    def play(self):
        pygame.mixer.init()
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()

        while pygame.mixer.music.get_busy() and not self.stopped:
            pygame.time.Clock().tick(10)
            if self.paused:
                pygame.mixer.music.pause()
                while self.paused:
                    pass
                pygame.mixer.music.unpause()

    def pause(self):
        pygame.mixer.music.pause()

    def resume(self):
        pygame.mixer.music.unpause()

    def stop(self):
        self.stopped = True
        pygame.mixer.music.stop()

   # def pitch(self, pitchValue):




def user_input(player):
    while not player.stopped:
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
        elif command == 'q':
            player.stop()
            print("Exiting")
        else:
            print("Wrong button bruh...")



if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("")
        print("Usage: python script_name.py <sound_file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    player = SoundPlayer(file_path)

    # Start a separate thread for user input
    input_thread = threading.Thread(target=user_input, args=(player,))
    input_thread.start()

    # Start audio playback in the main thread
    player.play()

    # Wait for the input thread to finish
    input_thread.join()
