let websocket = null;

let globalSettings = {};

let settings = {};

const actions = Object.freeze({
  volumeUp: "com.davidborzek.foobar2000.volumeup",
  volumeDown: "com.davidborzek.foobar2000.volumedown",
  nowplaying: "com.davidborzek.foobar2000.nowplaying",
  skipforward: "com.davidborzek.foobar2000.skipforward",
  skipbackward: "com.davidborzek.foobar2000.skipbackward",
});

const customActions = Object.freeze({
  none: "None",
  replay: "Replay",
  skipSeconds: "Skip seconds",
  changePlaylistForward: "Change playlist forward",
  changePlaylistBackward: "Change playlist backward",
});

const connectElgatoStreamDeckSocket = (
  inPort,
  inUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo
) => {
  const actionInfo = JSON.parse(inActionInfo);
  const info = JSON.parse(inInfo);

  const sdVersion = info.application.version;
  const pluginVersion = info.plugin.version;
  const language = info.application.language;
  const action = actionInfo.action;

  settings = actionInfo.payload.settings;

  websocket = new WebSocket("ws://127.0.0.1:" + inPort);

  websocket.onopen = function () {
    websocketUtils.registerPlugin(inUUID, inRegisterEvent);
    websocketUtils.requestGlobalSettings(inUUID);
  };

  if (action == actions.volumeUp || action == actions.volumeDown) {
    const volumeStepDiv = document.getElementById("volume-step");
    volumeStepDiv.style.display = "flex";

    const volumeStepInput = volumeStepDiv.children[1];
    volumeStepInput.value = settings.volumeStep || 1;
    volumeStepInput.onchange = (evt) => {
      if (
        evt.target.value === "" ||
        Number.parseInt(evt.target.value, 10) < 0
      ) {
        volumeStepInput.value = 1;
      } else if (Number.parseInt(evt.target.value, 10) > 100) {
        volumeStepInput.value = 100;
      }
      websocketUtils.saveSettings(action, inUUID, {
        volumeStep: Number.parseInt(volumeStepInput.value, 10),
      });
    };
  } else if (action == actions.nowplaying) {
    const selectActionDiv = document.getElementById("select-action");
    selectActionDiv.style.display = "flex";

    const actionSelect = selectActionDiv.querySelector("select");
    actionSelect.value = settings.customAction || customActions.none;

    const showSkipSeconds = ()=>{
      const skipSecondsDiv = document.getElementById("skip-seconds");
      const skipSecondsInput = skipSecondsDiv.querySelector("input");
      if(actionSelect.value == customActions.skipSeconds){
        skipSecondsDiv.style.display = "flex";

        skipSecondsInput.value = settings.skipSeconds || -15;
        skipSecondsInput.onchange = (evt) => {
          if (
            evt.target.value === "" ||
            parseFloat(evt.target.value) < -100
          ) {
            skipSecondsInput.value = -100;
          } else if (parseFloat(evt.target.value) > 100) {
            skipSecondsInput.value = 100;
          }
          websocketUtils.saveSettings(action, inUUID, {
            customAction: customActions.skipSeconds,
            skipSeconds: parseFloat(skipSecondsInput.value),
          });
        };
      }else{
        skipSecondsDiv.style.display = "none";
        skipSecondsInput.value = -15;
      }
    }

    actionSelect.onchange = (evt) => {
      websocketUtils.saveSettings(action, inUUID, {
        customAction: actionSelect.value,
      });
      showSkipSeconds();
    };
    showSkipSeconds();
  } else if (action == actions.skipforward || action == actions.skipbackward) {
    const longPressDiv = document.getElementById("long-press");
    longPressDiv.style.display = "flex";

    const longPressCheckInput = longPressDiv.querySelector("input[type='checkbox']");
    longPressCheckInput.checked = settings.longPress || false;

    const showLongPressSeconds = ()=>{
      const longPressSecondsDiv = longPressDiv.querySelector(".sdpi-item");
      const longPressSecondsInput = longPressSecondsDiv.querySelector("input");
      if(longPressCheckInput.checked){
        longPressSecondsDiv.style.display = "flex";

        longPressSecondsInput.value = settings.longPressSeconds || 0.5;
        longPressSecondsInput.onchange = (evt) => {
          if (
            evt.target.value === "" ||
            parseFloat(evt.target.value) < 0.1
          ) {
            longPressSecondsInput.value = 0.1;
          } else if (parseFloat(evt.target.value) > 3.0) {
            longPressSecondsInput.value = 3.0;
          }
          websocketUtils.saveSettings(action, inUUID, {
            longPress: true,
            longPressSeconds: parseFloat(longPressSecondsInput.value),
          });
        };
      }else{
        longPressSecondsDiv.style.display = "none";
        skipSecondsInput.value = 0.5;
      }
    }

    longPressCheckInput.onchange = (evt) => {
      console.log(longPressCheckInput.checked);
      websocketUtils.saveSettings(action, inUUID, {
        longPress: longPressCheckInput.checked,
      });
      showLongPressSeconds();
    };
    showLongPressSeconds();
  }

  const gettingStartedLink = document.getElementById("getting-started-link");
  gettingStartedLink.onclick = () => {
    websocketUtils.openUrl(
      "https://github.com/davidborzek/streamdeck-foobar2000/blob/master/docs/getting-started.md"
    );
  };

  websocket.onmessage = (evt) => {
    const { event, payload } = JSON.parse(evt.data);
    if (event == "didReceiveGlobalSettings") {
      globalSettings = payload.settings;
    } else if (event == "didReceiveSettings") {
      settings = payload.settings;
    }
  };
};
