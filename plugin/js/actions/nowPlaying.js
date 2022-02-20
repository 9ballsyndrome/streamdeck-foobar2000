class NowPlayingAction extends Action {
  type = "com.davidborzek.foobar2000.nowplaying";

  setCurrentPlayback = (playback, image) => {
    this.foobarCurrentPlayback = playback;
    this.currentArtwork = image;
  };

  onWillAppear = (coordinates) => {
    if (this.foobarCurrentPlayback.playbackState === "stopped") {
      websocketUtils.setTitle(this.context, "Stopped");
    } else {
      intervals[this.context] && clearInterval(intervals[this.context]);
      websocketUtils.setAsyncTitleMultiline(
        this.foobarCurrentPlayback.activeItem.columns[1],
        this.foobarCurrentPlayback.activeItem.columns[0],
        300,
        this.context
      );

      websocketUtils.setImage(
        this.context,
        this.currentArtwork
      )
    }
    
  };

  onKeyDown = async (coordinates, state) => {
    const customAction = this.settings.customAction || customActions.none;

    switch (customAction) {
      case customActions.replay:
        await this.replay();
        break;
      case customActions.skipSeconds:
        await this.playRelative(this.settings.skipSeconds || -15);
        break;
      case customActions.changePlaylistForward:
        await this.changePlaylist(true);
        break;
      case customActions.changePlaylistBackward:
        await this.changePlaylist(false);
        break;
    }
  };

  replay = async () => {
    foobarPlayerState = await foobar.getPlayerState();

    const { activeItem: { playlistId, playlistIndex, index } } = foobarPlayerState;

    if (playlistIndex > -1 && index > -1) {
      foobar.playById(playlistIndex, index, (success, message) => {
        if (!success) {
          websocketUtils.showAlert(this.context);
          websocketUtils.log(
            "Error to replay, check if foobar is running!"
          );
        }
      });
    }
  };

  changePlaylist = async (isNext) => {
    foobar.changePlaylist(isNext, true, (success, message) => {
      if (!success) {
        websocketUtils.showAlert(this.context);
        websocketUtils.log(
          "Error to change playlist, check if foobar is running!"
        );
      }
    });
  };

  playRelative = async (seconds) => {
    foobar.playRelative(seconds, (success, message) => {
      if (!success) {
        websocketUtils.showAlert(this.context);
        websocketUtils.log(
          "Error to play relative, check if foobar is running!"
        );
      }
    });
  };
}

const customActions = Object.freeze({
  none: "None",
  replay: "Replay",
  skipSeconds: "Skip seconds",
  changePlaylistForward: "Change playlist forward",
  changePlaylistBackward: "Change playlist backward",
});