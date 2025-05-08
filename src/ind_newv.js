import "./style.css";
import getAccessToken from "./utils/get-access-token.js";
require("dotenv").config();
const { enableDrag } = require("./selfview");
var socket = io();
const axios = require("axios");
console.log("socketio", socket);

const urlParams = new URLSearchParams(window.location.search);

// const myAccessToken = await getAccessToken();
const destination = "rkanthet@cisco.com";
const site = urlParams.get("site");
const Webex = require("webex");
// const webex = null;
const myAccessToken = await getAccessToken();
console.log("myAccessToken", myAccessToken);
const webex = window.Webex.init({
  credentials: {
    access_token: myAccessToken,
  },
});

webex.config.logger.level = "debug";
// socket.emit("app_msg", `workflow button pushed`);

socket.on("app_msg", function (msg) {
  if (site == "client") {
    alert(msg);
  }

  console.log("Socket IO Message: " + msg);
});
// const microphoneStream = null;

// const cameraStream = null;

webex.once("ready", async (r) => {
  console.log("webex is ready");
  webex.meetings
    .register()
    .then((r) => {
      console.log("Succesfully registered");
      console.log(destination);
      webex.meetings
        .create(destination)
        .then(async (meeting) => {
          console.log("Meeting successfully created");
          const microphoneStream =
            await webex.meetings.mediaHelpers.createMicrophoneStream({
              echoCancellation: true,
              noiseSuppression: true,
            });

          const cameraStream =
            await webex.meetings.mediaHelpers.createCameraStream({
              width: 640,
              height: 480,
            });
          // Call our helper function for binding events to meetings
          await bindMeetingEvents(meeting);
          await bindButtonEvents(meeting, microphoneStream, cameraStream);
          await joinMeeting(meeting, microphoneStream, cameraStream);
        })
        .catch((error) => {
          // Report the error
          console.log(error);
        });
    })
    .catch((err) => {
      console.log(err);
      alert(err);
      throw err;
    });
});

async function bindButtonEvents(meeting, microphoneStream, cameraStream) {
  const videoMuteOff = document.getElementById("video-mute-off");
  const videoMuteOn = document.getElementById("video-mute-on");
  const audioMuteOff = document.getElementById("audio-mute-off");
  const audioMuteOn = document.getElementById("audio-mute-on");
  const dropdownButton = document.getElementById("dropdown-button");
  const hideSelfView = document.getElementById("hide-self-view");
  const showSelfView = document.getElementById("show-self-view");
  const self = document.getElementById("self");
  const remoteView = document.getElementById("remote-view");
  const clientConnect = document.getElementById("client-connect");
  const agentConnect = document.getElementById("agent-connect");
  const dropdown = document.getElementsByClassName("dropdown");
  const add = document.getElementById("add");

  const meetingDest = meeting.destination;

  document.getElementById("hangup").addEventListener("click", async () => {
    // window.location.href = "/hangup";
    if (site == "supervisorMonitor") {
      meeting.leave();
    } else {
      console.log("hangup clicked");
      await axios
        .get(`https://webexapis.com/v1/meetings?webLink=${meetingDest}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${myAccessToken}`,
          },
        })
        .then(async (res) => {
          console.log("res", res);
          const id = res.data.items[0].id;
          console.log("id", id);
          const date = new Date();
          const connectData = {
            accessToken: myAccessToken,
            meetingId: id,
            meetingEnded: date,
          };
          console.log("connectData", connectData);
          await axios
            .post(
              "https://hooks.us.webexconnect.io/events/P3RGOWXKZY",
              connectData
            )
            .then((res) => {
              console.log("Connect resp", res);
            })
            .catch((err) => {
              console.log("Connect err", err);
            });
        })
        .catch((err) => {
          console.log("list meetings err", err);
        });
      await meeting.endMeetingForAll();
      await meeting.getMembers().then((members) => {
        console.log("members", members);
      });
    }
  });
  console.log("site", site);
  if (site == "client") {
    clientConnect.style.display = "none";
    agentConnect.style.display = "";
    add.style.display = "none";
  } else if (site == "agent") {
    clientConnect.style.display = "";
    agentConnect.style.display = "none";
    add.style.display = "";
  } else if (site == "supervisorMonitor") {
    self.style.display = "none";
    videoMuteOff.style.display = "none";
    videoMuteOn.style.display = "none";
    audioMuteOff.style.display = "none";
    audioMuteOn.style.display = "none";
    dropdownButton.style.display = "none";
    clientConnect.style.display = "none";
    agentConnect.style.display = "none";
    add.style.display = "none";
  }
  clientConnect.addEventListener("click", () => {
    console.error("workflow button pushed");
    socket.emit("app_msg", `Agent workflow button pushed`);
  });
  agentConnect.addEventListener("click", () => {
    console.error("workflow button pushed");
    socket.emit("app_msg", `Client workflow button pushed`);
  });
  videoMuteOff.addEventListener("click", () => {
    console.log("videmute off clicked");
    cameraStream.outputStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    videoMuteOff.style.display = "none";
    videoMuteOn.style.display = "";
  });
  videoMuteOn.addEventListener("click", () => {
    console.log("video mute on clicked");
    cameraStream.outputStream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
    videoMuteOff.style.display = "";
    videoMuteOn.style.display = "none";
  });
  audioMuteOff.addEventListener("click", () => {
    microphoneStream.outputStream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    audioMuteOff.style.display = "none";
    audioMuteOn.style.display = "";
  });
  audioMuteOn.addEventListener("click", () => {
    microphoneStream.outputStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    audioMuteOff.style.display = "";
    audioMuteOn.style.display = "none";
  });
  hideSelfView.addEventListener("click", () => {
    self.style.display = "none";
    hideSelfView.style.display = "none";
    showSelfView.style.display = "";
  });
  showSelfView.addEventListener("click", () => {
    self.style.display = "";
    hideSelfView.style.display = "";
    showSelfView.style.display = "none";
  });
  add.addEventListener("click", async () => {
    await axios
      .get(`https://webexapis.com/v1/meetings?webLink=${meetingDest}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myAccessToken}`,
        },
      })
      .then(async (res) => {
        const id = res.data.items[0].id;
        //+15028216519
        const addData = {
          meetingId: id,
          address: "+15028216519",
          addressType: "phoneNumber",
          displayName: "Kris Krake",
        };
        await axios
          .post(
            "https://webexapis.com/v1/meetingParticipants/callout",
            addData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${myAccessToken}`,
              },
            }
          )
          .then(async (res) => {
            console.log("call out res", res);
            const participantId = res.data.participantId;
            const updateBody = {
              muted: true,
            };
            await axios
              .put(
                `https://webexapis.com/v1/meetingParticipants/${participantId}`,
                updateBody,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${myAccessToken}`,
                  },
                }
              )
              .then((res) => {
                console.log("Update participant res", res);
              })
              .catch((err) => {
                console.log("Update participant err", err);
              });
          })
          .catch((err) => {
            console.log("callout err", err);
          });
      });
    // meeting.invite(invitee);
  });
  dropdownButton.addEventListener("click", () => {
    // dropdown.classList.toggle("is-active");
    Array.from(dropdown).forEach((drop) => {
      drop.classList.toggle("is-active");
    });
  });
  if (self) {
    enableDrag(self, remoteView);
  }
}

async function bindMeetingEvents(meeting) {
  const selfView = document.getElementById("self-view");
  const remoteViewVideo = document.getElementById("remote-view-video");
  const remoteViewAudio = document.getElementById("remote-view-audio");
  const buttonsContainer = document.getElementById("buttons-container");
  const loadingContainer = document.getElementById("loading-container");

  meeting.on("error", (error) => console.log(error, "Meeting Error"));

  meeting.on("media:ready", (media) => {
    if (!media) return;

    meeting.startRecording();

    const element =
      media.type === "local"
        ? selfView
        : media.type === "remoteVideo"
        ? remoteViewVideo
        : media.type === "remoteAudio"
        ? remoteViewAudio
        : null;

    if (element) {
      element.srcObject = media.stream;
      buttonsContainer.style.display = "flex";
      loadingContainer.style.display = "none";
    }
  });

  meeting.on("media:stopped", (media) => {
    console.log("meeting stopped");
    meeting.stopRecording();
    webex.meetings.unregister();
    if (site == "supervisorMonitor" || site == "supervisorBarge") {
      window.location.href = "/supervisor";
    } else {
      window.location.href = "/hangup";
    }
    const element =
      media.type === "local"
        ? selfView
        : media.type === "remoteVideo"
        ? remoteViewVideo
        : media.type === "remoteAudio"
        ? remoteViewAudio
        : null;

    if (element) {
      element.srcObject = null;
      buttonsContainer.style.display = "none";
    }
  });
}

// Join the meeting and add media
// Join the meeting and add media through joinWithMedia method.
async function joinMeeting(meeting, microphoneStream, cameraStream) {
  try {
    // const { sendAudio, sendVideo } = await meeting.getSupportedDevices({
    //   sendAudio: true,
    //   sendVideo: true,
    // });
    // meeting.join().then(async () => {
    //   const mediaSettings = {
    //     receiveVideo: true,
    //     receiveAudio: true,
    //     receiveShare: false,
    //     sendShare: false,
    //     sendVideo,
    //     sendAudio,
    //   };
    //   // Get our local media stream and add it to the meeting
    //   meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
    //     const [localStream, localShare] = mediaStreams;
    //     meeting.addMedia({
    //       localShare,
    //       localStream,
    //       mediaSettings,
    //     });
    //   });
    // });

    document.getElementById("self-view").srcObject = cameraStream.outputStream;

    const mediaOptions = {
      localStreams: {
        microphone: microphoneStream,
        camera: cameraStream,
      },
      allowMediaInLobby: true,
      bundlePolicy: "max-bundle",
    };
    // if (site == "supervisorMonitor") {
    //   await meeting
    //     .join()
    //     .then(() => {})
    //     .catch((err) => {
    //       console.log("join err", err);
    //     });
    // } else {
    await meeting.joinWithMedia({ mediaOptions }).then(() => {
      // meeting.setMuteOnEntry(true);
      // const layoutType = "Single";
      // meeting
      //   .changeVideoLayout(layoutType)
      //   .then(() => {
      //     console.log("Layout updated to single active speaker view");
      //   })
      //   .catch((error) => {
      //     console.error("Failed to update layout", error);
      //   });
    });
    // }
  } catch (error) {
    console.log(error, "Join Meeting Error");
    throw error;
  }
}
