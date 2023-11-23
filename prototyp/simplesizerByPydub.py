import sys
import threading
from pydub import AudioSegment
from pydub.playback import play


class SoundPlayer:
    def __init__(self, file_path):
        self.sound = AudioSegment.from_file(file_path)
        # self.frequency = 22050 #22050

    def play(self):
        play(self.sound)

    def pause(self):
        pass

    def resume(self):
        pass

    def stop(self):
        pass

    def quit(self):
        pass

    def pitch(self, pitchValue):
        pass

    def playback(self, speed):
        pass


def user_input(player):
    while True:
        userInput = input("Enter 'p' to pause, 'r' to resume, 's' to stop, or 'q' to quit: ").lower()
        inputValues = userInput.split()
        menuChoice = inputValues[0]

        if len(inputValues) == 1:
            if menuChoice == 'a':  # pause the music
                player.play()
            elif menuChoice == 's':  # resume the music
                pass
            elif menuChoice == 'd':  # stop the music BUT do we need this function? And if yes, what for?
                pass
            elif menuChoice == 'q':  # quit the program
                pass
            else:
                pass

        # if len(inputValues) == 2:
        #     aditionalMenuValue = inputValues[1]
        #
        #     if menuChoice == 'w':  # adjust song volume
        #         player.pitch(aditionalMenuValue)
        #     elif menuChoice == 'e':  # adjust song speed
        #         pass


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
