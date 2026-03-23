import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home,Map,Guide,CheckStatus,Stats} from "./pages";
import { Header } from "./compenents";

function App() {
  return (
    <>
      <Router>
        <Header />
        <main className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pin-location" element={<Map />} />
            <Route path="/chukua-card" element={<Guide />} />
            <Route path="/ji-verify" element={<CheckStatus />} />
            <Route path="/siri-ni-numbers" element={<Stats />} />
          </Routes>
        </main>
      </Router>
    </>
  );
}

export default App;
