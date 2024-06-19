import GameScreen from "@components/GameScreen";
import { SocketProvider } from "@sockets/gameSocket/socketContext";
function App() {
  return (
    <>
      <SocketProvider>
        <GameScreen />
      </SocketProvider>
    </>
  );
}
export default App;
