import sys
import threading
import pygame
from pydub import AudioSegment
from pydub.playback import play

class SoundPlayer:
    def __init__(self, file_path):
        self.sound = file_path
        self.frequency = 22050 #22050
        self.speed = 1.0


    def play(self):
        pygame.mixer.init()
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
        self.speed = float(speed)
        audio = AudioSegment.from_file(self.sound, format="mp3")
        increasedSpeedAudio = audio.speedup(playback_speed=self.speed)
        play(increasedSpeedAudio)










def user_input(player):
    while True:
        userInput = input("Enter 'a' to pause, 's' to resume, 'd' to stop, 'w' to adjust song volume, 'e' to adjust song speed or 'q' to quit: ").lower()
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
            elif menuChoice == 'e': # adjust song speed
                player.playback(aditionalMenuValue)





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
