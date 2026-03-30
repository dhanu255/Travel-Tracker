import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import PlacesPage from "./pages/PlacesPage";
import TrackingPage from "./pages/TrackingPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

