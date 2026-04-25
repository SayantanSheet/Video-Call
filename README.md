# Apna Video Call

A full-stack MERN (MongoDB, Express, React, Node.js) application for high-quality video conferencing and real-time chat. This project leverages **WebRTC** for peer-to-peer video streaming and **Socket.io** for real-time signaling and communication.

## 🚀 Features
- **Real-time Video Calling**: High-quality P2P video and audio.
- **Screen Sharing**: Present your screen to participants instantly.
- **Instant Chat**: Send and receive messages during the call.
- **Meeting Rooms**: Join specific rooms via unique URLs.
- **Dynamic UI**: Responsive design with real-time participant updates.

## 🛠️ Tech Stack
- **Frontend**: React.js, Material UI, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: MongoDB (for meeting history and user data).
- **Communication**: WebRTC (P2P), STUN Servers.

---

## 📽️ How Video Calling Works (Step-by-Step)

The video call follows a structured process to establish a secure P2P connection:

1.  **Permissions**: The app requests access to your camera and microphone.
2.  **Joining a Room**: You enter a username and join a room (identified by the URL).
3.  **Signaling**: The server introduces you to other participants in the room. This involves exchanging **SDP Offers/Answers** and **ICE Candidates** via Socket.io.
4.  **Handshake**: Once the "handshake" is complete, a direct Peer-to-Peer connection is established between browsers.
5.  **Streaming**: Video and Audio start flowing directly between participants without passing through the server.
6.  **Interactions**: You can mute, toggle video, or share your screen. Each action is signaled to others in real-time.

> [!TIP]
> For a deep dive into the technical implementation details (WebRTC logic, socket events, etc.), please refer to our **[Video Call Logic Documentation](./VIDEO_CALL_LOGIC.md)**.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB database (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ApnaVideoCall.git
cd ApnaVideoCall
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your configuration:
   ```env
   PORT=8000
   MONGO_URL=your_mongodb_connection_string
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License.
