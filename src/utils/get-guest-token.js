const axios = require("axios");

function getGuestToken(name, access_token) {
  console.log("got inside get guest token");
  guestData = {
    subject: "ExternalGuestIdentifier",
    displayName: name,
  };
  guestConfig = {
    method: "post",
    url: "https://webexapis.com/v1/guests/token",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    data: guestData,
  };
  return axios
    .request(guestConfig)
    .then((response) => {
      console.log("guestresp", response.data);
      return response.data.accessToken;
    })
    .catch((error) => {
      console.log(error);
    });
}

module.exports = getGuestToken;
