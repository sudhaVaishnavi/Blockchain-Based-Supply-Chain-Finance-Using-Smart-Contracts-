import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [requestId, setRequestId] = useState("");
  const [output, setOutput] = useState("");

  async function call(api, body) {
    try {
      let res;
      if (body === undefined) {
        res = await axios.get(api);
      } else {
        res = await axios.post(api, body);
      }
      setOutput(JSON.stringify(res.data, null, 2));
    } catch (e) {
      setOutput(String(e));
    }
  }

  return (
    <div className="container">
      <h1>Blockchain Supply Chain Finance</h1>
      <p className="subtitle">
        Add products, trace history, request and approve finance
      </p>

      <div className="grid">
        <div className="card">
          <h2>Add Product</h2>
          <input
            placeholder="Product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <button
            onClick={() =>
              call("http://localhost:4000/product", { name: productName })
            }
          >
            Add
          </button>
        </div>

        <div className="card">
          <h2>Get Product</h2>
          <input
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <button
            onClick={() =>
              call(`http://localhost:4000/product/${productId}`)
            }
          >
            Get
          </button>
          <button
            className="secondary"
            onClick={() =>
              call(`http://localhost:4000/history/${productId}`)
            }
          >
            History
          </button>
        </div>

        <div className="card">
          <h2>Request Finance</h2>
          <input
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={() =>
              call("http://localhost:4000/finance/request", {
                productId,
                amount,
              })
            }
          >
            Request
          </button>
        </div>

        <div className="card">
          <h2>Approve Finance</h2>
          <input
            placeholder="Request ID"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />
          <button
            onClick={() =>
              call("http://localhost:4000/finance/approve", { requestId })
            }
          >
            Approve
          </button>
        </div>

        <div className="card">
          <h2>Blockchain Explorer</h2>
          <p style={{ fontSize: 14, marginBottom: 10 }}>
            View all on-chain events: products, transfers, finance.
          </p>
          <button
            onClick={() => call("http://localhost:4000/events")}
          >
            Load Events
          </button>
        </div>
      </div>

      <h2>Output</h2>
      <pre className="output">{output}</pre>
    </div>
  );
}
