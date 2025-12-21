import { useLocation, Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header/Header';
import Home from "./pages/HomePage/Home"
import Login from "./pages/LoginPage/Login";
import Message from "./pages/MessagePage/Message";
import Profile from "./pages/ProfilePage/Profile"
import Setting from "./pages/SettingPage/Setting"
import Register from "./pages/RegisterPage/Register";
import "./styles/reset.scss"
import "@fontsource/montserrat";

function App() {
  
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register'];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element = {<Login />} />
        <Route path="/register" element = {< Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/message/:userId" 
          element = {
            <ProtectedRoute>
              <Message />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/message" 
          element = {
            <ProtectedRoute>
              <Message />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/:username" 
          element = {
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/setting" 
          element = {
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
