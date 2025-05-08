# Webex Meeings Web Server
This is a proof-of-concept application that uses Webex JS SDk to render Webex Meetings. This PoC lets the user make post request o Task Routing APIs to send information to Finesse.

</br >

# Table Of Contents

- [Setup](#setup)
- [License](#license)
- [Contact](#contact)

<br />

# Setup

## Installation

Open a new terminal window and follow the instructions below to setup the project locally
1. Clone this repository and change directory:

   ```
   git clone https://github.com/wxsd-sales/webex-meetings && cd webex-meetings
   ```

2. Install all the dependencies using:

   ```
   npm install
   ```
   ```
   npm install nodemon
   ```
3. Build and then Start the application using:
   ```
   npm run build
   ```
   ```
   npm run start
   ```
4. To run this project on Docker, make sure to have Docker installed on your Windows or linux system, and build and run Docker file using:
   ```
   docker build -t webex-meetings-server .
   ```
   ```
   docker run -i -p 3000:3000 -t webex-meetings-server
   ```
<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Please reach out to the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com).
