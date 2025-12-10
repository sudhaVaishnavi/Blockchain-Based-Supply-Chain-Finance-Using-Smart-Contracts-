import express from "express";
import cors from "cors";
import hardhat from "hardhat";

const { ethers } = hardhat;

const app = express();
app.use(cors());
app.use(express.json());

let contract;
let signers;
let bankSigner;

async function init() {
  const Factory = await ethers.getContractFactory("SupplyChainFinance");
  contract = await Factory.deploy();
  await contract.deployed();

  console.log("API Contract deployed at:", contract.address);

  signers = await ethers.getSigners();
  const [manufacturer, transporter, distributor, retailer, bank] = signers;
  bankSigner = bank;

  // role registration (same logic as full-demo)
  await contract.registerUser(transporter.address, 2);
  await contract.registerUser(distributor.address, 3);
  await contract.registerUser(retailer.address, 4);
  await contract.registerUser(bank.address, 5);

  app.listen(4000, () => {
    console.log("API server running on http://localhost:4000");
  });
}

// helper: get signer for an address
function getSignerForAddress(addr) {
  return signers.find(
    (s) => s.address.toLowerCase() === addr.toLowerCase()
  );
}

// ---------- ROUTES ----------

// Add product (manufacturer)
app.post("/product", async (req, res) => {
  try {
    const { name } = req.body;
    const manufacturer = signers[0];

    const tx = await contract.connect(manufacturer).addProduct(name);
    await tx.wait();

    const id = await contract.productCount();
    res.json({ success: true, productId: id.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Transfer product along the chain
app.post("/transfer", async (req, res) => {
  try {
    const { id, to, status } = req.body;

    const p = await contract.products(id);
    const ownerAddr = p.owner;
    const ownerSigner = getSignerForAddress(ownerAddr);
    if (!ownerSigner) {
      return res.status(400).json({ success: false, error: "Owner signer not found" });
    }

    const tx = await contract
      .connect(ownerSigner)
      .transfer(id, to, status || "Moved");
    await tx.wait();

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Request finance for a product
app.post("/finance/request", async (req, res) => {
  try {
    const { productId, amount } = req.body;

    const p = await contract.products(productId);
    const requesterSigner = getSignerForAddress(p.owner);

    const tx = await contract
      .connect(requesterSigner)
      .requestFinance(productId, amount);
    await tx.wait();

    const reqId = await contract.financeRequestCount();
    res.json({ success: true, requestId: reqId.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Approve finance (bank only)
app.post("/finance/approve", async (req, res) => {
  try {
    const { requestId } = req.body;

    const tx = await contract
      .connect(bankSigner)
      .approveFinance(requestId);
    await tx.wait();

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get product + history + finance
app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const p = await contract.products(id);
    const history = await contract.getProductHistory(id);

    res.json({
      id: p.id.toString(),
      owner: p.owner,
      name: p.name,
      status: p.status,
      history,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Only history
app.get("/history/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const history = await contract.getProductHistory(id);
    res.json({ id, history });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get all blockchain events (simple explorer)
app.get("/events", async (req, res) => {
  try {
    const added = await contract.queryFilter(contract.filters.ProductAdded());
    const transferred = await contract.queryFilter(contract.filters.ProductTransferred());
    const financeReq = await contract.queryFilter(contract.filters.FinanceRequested());
    const financeApp = await contract.queryFilter(contract.filters.FinanceApproved());

    function clean(ev) {
      return {
        name: ev.event,
        blockNumber: ev.blockNumber,
        args: ev.args,
      };
    }

    res.json({
      productAdded: added.map(clean),
      productTransferred: transferred.map(clean),
      financeRequested: financeReq.map(clean),
      financeApproved: financeApp.map(clean),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});


init().catch((e) => {
  console.error("INIT ERROR:", e);
  process.exit(1);
});

