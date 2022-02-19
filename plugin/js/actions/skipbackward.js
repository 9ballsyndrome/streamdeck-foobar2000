class SkipBackwardAction extends Action {
  type = "com.davidborzek.foobar2000.skipbackward";
  timestamp = 0;

  onKeyDown = (coordinates, state) => {
    this.timestamp = performance.now();
    foobar.skipBackward((success, message) => {
      if (!success) {
        websocketUtils.showAlert(this.context);
        websocketUtils.log(
          "Error to skip backward, check if foobar is running!"
        );
      }
    });
  };

  onKeyUp = (coordinates, state) => {
    if(performance.now() - this.timestamp > 1000){
      foobar.changePlaylist(false, true, (success, message) => {
        if (!success) {
          websocketUtils.showAlert(this.context);
          websocketUtils.log(
            "Error to change playlist backward, check if foobar is running!"
          );
        }
      });
    }
    this.timestamp = 0;
  };
}
