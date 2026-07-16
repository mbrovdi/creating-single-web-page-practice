const { useState, useRef } = React;

const STATES = [
  { label: "red", color: "#dc2626" },
  { label: "green", color: "#16a34a" },
  { label: "amber", color: "#f59e0b" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// This board's auto-program circuit wires RTS -> GPIO0 and DTR -> EN
// (swapped from the "classic" DTR->GPIO0/RTS->EN wiring). Pulsing DTR
// resets the chip (EN low then high) while keeping RTS released so
// GPIO0 stays high — that boots the flashed program, not the bootloader.
async function resetToRun(port) {
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await sleep(50);
  await port.setSignals({ dataTerminalReady: true });
  await sleep(100);
  await port.setSignals({ dataTerminalReady: false });
  await sleep(50);
}

function TrafficLight() {
  const [counter, setCounter] = useState(0);
  const [status, setStatus] = useState("Not connected");
  const [connected, setConnected] = useState(false);
  const supported = "serial" in navigator;

  async function connectSerial() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setStatus("Connected — resetting board...");
      await resetToRun(port);
      setConnected(true);
      setStatus("Connected — waiting for data...");

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "0" || trimmed === "1" || trimmed === "2") {
            setCounter(Number(trimmed));
            setStatus("Receiving data from ESP32-CAM");
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
      setConnected(false);
    }
  }

  const current = STATES[counter % 3];

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: current.color }}>
        {current.label}
      </p>
      <p style={{ color: "#666" }}>{status}</p>
      {supported && !connected && (
        <button onClick={connectSerial}>Connect to ESP32-CAM</button>
      )}
      {!supported && (
        <p style={{ color: "#b91c1c" }}>
          Web Serial isn't supported in this browser (this only works on desktop
          Chrome/Edge for now — Android needs a different method, coming next).
        </p>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("traffic-light-root")).render(<TrafficLight />);