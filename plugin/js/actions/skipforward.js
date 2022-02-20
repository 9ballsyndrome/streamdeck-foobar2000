class SkipForwardAction extends Action {
  type = "com.davidborzek.foobar2000.skipforward";
  timestamp = 0;

  onKeyDown = (coordinates, state) => {
    this.timestamp = performance.now();
    foobar.skipForward((success, message) => {
      if (!success) {
        websocketUtils.showAlert(this.context);
        websocketUtils.log(
          "Error to skip forward, check if foobar is running!"
        );
      }
    });
  };

  onKeyUp = (coordinates, state) => {
    if(!this.settings.longPress){
      this.timestamp = 0;
      return;
    }
    if(performance.now() - this.timestamp > (this.settings.longPressSeconds || 0.5) * 1000){
      foobar.changePlaylist(true, true, (success, message) => {
        if (!success) {
          websocketUtils.showAlert(this.context);
          websocketUtils.log(
            "Error to change playlist forward, check if foobar is running!"
          );
        }
      });
    }
    this.timestamp = 0;
  };
}
