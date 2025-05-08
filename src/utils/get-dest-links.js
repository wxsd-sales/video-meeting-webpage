const axios = require("axios");
require("dotenv").config();
async function getDestLinks(access_token) {
  // const currentDateTime = new Date().toISOString();
  const currentDate = new Date();
  const currentDateTime = new Date();
  const newDateTime = new Date(
    currentDateTime.getTime() + 2 * 60000
  ).toISOString();

  console.log(currentDateTime);
  currentDate.setHours(currentDate.getHours() + 1);
  const futureDateTime = currentDate.toISOString();
  const payload = {
    title: "Webex Meeting",
    start: newDateTime,
    end: futureDateTime,
    hostEmail: "rajithabhavani.kantheti+wxsd@gmail.com",
  };
  console.log("start time", newDateTime);
  console.log("end time", futureDateTime);

  return axios
    .post(`https://webexapis.com/v1/meetings`, payload, {
      //create a meeting
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    })
    .then(async (r) => {
      console.log("resp from dest", r.data.webLink);
      return r.data.webLink;
      // const linkdata = {
      //   meetingId: r.data.id,
      //   createJoinLinkAsWebLink: true,
      //   createStartLinkAsWebLink: true,
      //   joinDirectly: false,
      // };
      // const connectData = {
      //   meetingId: r.data.id,
      //   meetingNumber: r.data.meetingNumber,
      //   password: r.data.password,
      //   phoneAndVideoSystemPassword: r.data.phoneAndVideoSystemPassword,
      //   start: r.data.start,
      //   end: r.data.end,
      //   hostKey: r.data.hostKey,
      //   hostEmail: r.data.hostEmail,
      //   webLink: r.data.webLink,
      //   telephony: r.data.telephony,
      //   accessToken: access_token,
      // };
      // console.log("meeting data", r.data);
      // console.log("connect data", connectData);

      // await axios
      //   .post(process.env.WEBEX_CONNECT_URL, connectData)
      //   .then((res) => {
      //     console.log("Connect resp", res);
      //   })
      //   .catch((err) => {
      //     console.log("Connect err", err);
      //   });

      // return axios
      //   .post(`https://webexapis.com/v1/meetings/join`, linkdata, {
      //     //create join and start links
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${access_token}`,
      //     },
      //   })
      //   .then(async (linkr) => {
      //     console.log("linkdata", linkdata);
      //     console.log("link data", linkr.data);
      //     const joinLink = linkr.data.joinLink;
      //     const startLink = linkr.data.startLink;
      //     const details = {
      //       access_token,
      //       joinLink,
      //       startLink,
      //     };
      //     return details;
      // })
      // .catch((err) => {
      //   console.log("err meetings join", err);
      // });
    })
    .catch((err) => {
      console.log("err meetings create", err);
    });
}
module.exports = getDestLinks;
