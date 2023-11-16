from pydub import AudioSegment
from pydub.playback import play

song = AudioSegment.from_mp3('./example/sounds/NeverGonnaGiveYouUp.MP3')
play(song)