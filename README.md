# Simplesizer Documentation

The Simplesizer is a simple music player implemented in Python using the Pygame and Pydub libraries. It allows users to interact with a music file, providing functionalities such as play, pause, resume, stop, adjust volume, adjust speed, and load a new song.

## Usage

To use the Simplesizer, run the script from the command line, providing the path to a sound file as a command-line argument:

```bash
python script_name.py <sound_file_path>
```

## Class: Simplesizer

### Methods

#### `__init__(self, song_path)`

- **Parameters:**
  - `song_path`: The path to the initial song file.

- **Description:** Initializes a Simplesizer instance with the specified initial song.

#### `initialize(self)`

- **Description:** Initializes the Pygame mixer.

#### `load_song(self, new_song_path)`

- **Parameters:**
  - `new_song_path`: The path to the new song file.

- **Description:** Loads a new song into the Simplesizer.

#### `play(self)`

- **Description:** Plays the loaded song.

#### `pause(self)`

- **Description:** Pauses the currently playing song.

#### `resume(self)`

- **Description:** Resumes playback of a paused song.

#### `stop(self)`

- **Description:** Stops the currently playing song.

#### `quit(self)`

- **Description:** Quits the Pygame mixer and exits the program.

#### `pitch(self, pitchValue)`

- **Parameters:**
  - `pitchValue`: The value to adjust the song volume.

- **Description:** Adjusts the volume of the currently playing song.

#### `playback(self, speed)`

- **Parameters:**
  - `speed`: The speed factor for adjusting the song playback speed.

- **Description:** Adjusts the playback speed of the currently loaded song.

## Function: user_input

### Parameters

- `player`: A Simplesizer instance.

- **Description:** A function that runs in a separate thread, capturing user input to control the Simplesizer functionalities.

## Main Script

- **Description:** The main script initializes a Simplesizer instance with the provided sound file path, starts a separate thread for user input, and waits for the input thread to finish.

## User Input Commands

- `a`: Pause the music.
- `s`: Resume the music.
- `d`: Stop the music.
- `q`: Quit the program.
- `x`: Play the music.
- `w <value>`: Adjust the song volume (value between 0.0 and 1.0).
- `e <speed>`: Adjust the song speed.
- `z <new_song_path>`: Load a new song.

Note: Incorrect inputs will prompt a message indicating a wrong button press.
