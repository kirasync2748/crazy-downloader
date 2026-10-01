import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import ServerError from "./pages/ServerError";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
