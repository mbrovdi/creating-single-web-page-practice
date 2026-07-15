const { useState, useEffect } = React;

const STATES = [
  { label: "red", color: "#dc2626" },
  { label: "green", color: "#16a34a" },
  { label: "amber", color: "#f59e0b" },
];

function TrafficLight() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCounter((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const current = STATES[counter % 3];

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: current.color }}>
        {current.label}
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("traffic-light-root")).render(<TrafficLight />);