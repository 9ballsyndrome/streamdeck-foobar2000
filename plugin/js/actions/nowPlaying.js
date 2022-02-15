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
    await this.replay();

    // await this.changePlaylist(true);
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
    const diff = isNext ? 1 : -1;
    const playlists = await foobar.getPlaylists();
    const currentPlaylistindex = playlists.findIndex(playlist => playlist.isCurrent);
    const nextPlaylist = playlists[(currentPlaylistindex + playlists.length + diff) % playlists.length];
    foobar.playById(nextPlaylist.index, (nextPlaylist.itemCount * Math.random() << 0), (success, message) => {
      if (!success) {
        websocketUtils.showAlert(this.context);
        websocketUtils.log(
          "Error to change playlist, check if foobar is running!"
        );
      }
    });
  };
}
