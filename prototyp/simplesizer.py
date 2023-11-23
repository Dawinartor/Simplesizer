import sys
import threading
from pydub import AudioSegment
import pygame

class SoundPlayer:
    def __init__(self, file_path):
        self.sound = AudioSegment.from_file(file_path)
        self.frequency = 44100


    def play(self):
        pygame.mixer.init(self.frequency)
        pygame.mixer.music.load(file_path)
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
        self.frequency = speed







def user_input(player):
    while True:
        userInput = input("Enter 'p' to pause, 'r' to resume, 's' to stop, or 'q' to quit: ").lower()
        inputValues = userInput.split()
        menuChoice = inputValues[0]


        if len(inputValues) == 1:

            if menuChoice == 'a':  # pause the music
                player.pause()
                print("Paused")
            elif menuChoice == 's':  # resume the music
                player.resume()
                print("Resumed")
            elif menuChoice == 'd':  # stop the music BUT do we need this function? And if yes, what for?
                player.stop()
                print("Stopped")
            elif menuChoice == 'q':  # quit the program
                # this order is necessary!
                print("Exiting")
                player.quit()
            else:
                print("Wrong button bruh...")


        if len(inputValues) == 2:
            aditionalMenuValue = inputValues[1]

            if menuChoice == 'w': # adjust song volume
                player.pitch(aditionalMenuValue)
            elif menuChoice == 'e':





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
