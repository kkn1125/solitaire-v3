import { SoundEffectProvider } from "@/context/SoundEffectProvider";
import { Route, Routes } from "react-router-dom";
import GameSolitaire from "./component/page/GameSolitaire";
import NotFound from "./component/page/NotFound";
import Offline from "./component/page/Offline";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<GameSolitaire />} />
      <Route path="/offline" element={<Offline />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Router;
