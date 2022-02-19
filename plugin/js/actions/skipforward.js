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
    if(performance.now() - this.timestamp > 1000){
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
