import sys
import threading
import pygame
from pydub import AudioSegment
from pydub.playback import play


class Simplesizer:
    def __init__(self, song_path):
        self.song = song_path
        self.speed = 1.0

    def load_player(self):
        pygame.mixer.init()
        pygame.mixer.music.load(self.song)

    def play(self):
        pygame.mixer.music.play()

    def pause(self):
        pygame.mixer.music.pause()

    def resume(self):
        pygame.mixer.music.unpause()

    def stop(self):
        pygame.mixer.music.stop()

    def quit(self):
        pygame.quit()
        sys.exit()

    def pitch(self, pitchValue):
        # cast to float
        musicVolume = float(pitchValue)
        # check if pitchValue is lower
        if musicVolume < 0.0:
            print("insert a value between 0.0 and 1.0 to hear a effect")
        else:
            pygame.mixer.music.set_volume(musicVolume)

    def playback(self, speed):
        pygame.quit()
        self.speed = float(speed)
        audio = AudioSegment.from_file(self.sound, format="mp3")
        increased_speed_audio = audio.speedup(playback_speed=self.speed)
        play(increased_speed_audio)


def user_input(player):
    while True:
        user_input = input("""
                            You have following options, type the option and press enter:
                            1. 'a' to pause
                            2. 's' to resume
                            3. 'd' to stop
                            4. 'w' to adjust song volume
                            5. 'e' to adjust song speed
                            6. 'z' to load an new file 
                            or 'q' to quit
                            """.lower())

        input_values = user_input.split()
        menu_choice = input_values[0]


        if len(input_values) == 1:

            if menu_choice == 'a':  # pause the music
                player.pause()
                print("Paused")
            elif menu_choice == 's':  # resume the music
                player.resume()
                print("Resumed")
            elif menu_choice == 'd':  # stop the music BUT do we need this function? And if yes, what for?
                player.stop()
                print("Stopped")
            elif menu_choice == 'q':  # quit the program
                # this order is necessary!
                print("Exiting")
                player.quit()
            else:
                print("Wrong button bruh...")

        if len(input_values) == 2:
            aditional_menu_value = input_values[1]

            if menu_choice == 'w':  # adjust song volume
                player.pitch(aditional_menu_value)
            elif menu_choice == 'e':  # adjust song speed
                player.playback(aditional_menu_value)
            elif menu_choice == 'z':
                player.play()

# starting the core functionalities
if __name__ == "__main__":
    print(sys.argv)
    if len(sys.argv) != 2:
        print("")
        print("Usage: python script_name.py <sound_file_path>")
        sys.exit(1)

    simplesizer = Simplesizer(sys.argv[1])
    simplesizer.load_player()

    # Start a separate thread for user input
    input_thread = threading.Thread(target=user_input, args=(simplesizer,))
    input_thread.start()

    # Start audio playback in the main thread
    simplesizer.play()

    # Wait for the input thread to finish
    input_thread.join()
