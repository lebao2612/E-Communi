import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage/Home"
import Login from "./pages/LoginPage/Login";
import Message from "./pages/MessagePage/Message";
import Profile from "./pages/ProfilePage/Profile"
import Setting from "./pages/SettingPage/Setting"
import "./styles/reset.scss"
import "@fontsource/montserrat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/message" element={<Message />} />
        <Route path="/profile" element ={< Profile />} />
        <Route path="/setting" element ={< Setting />} />
      </Routes>
    </Router>
  );
}

export default App;
