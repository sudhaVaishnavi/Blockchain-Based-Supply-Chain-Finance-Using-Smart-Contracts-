const { ethers } = require("hardhat");

async function main() {
  const C = await ethers.getContractFactory("SupplyChainFinance");
  const c = await C.deploy();
  await c.deployed();

  console.log("Contract:", c.address);

  const [manufacturer, transporter, distributor, retailer, bank] = await ethers.getSigners();

  console.log("\n--- Registering Users ---");
  await c.registerUser(transporter.address, 2);
  await c.registerUser(distributor.address, 3);
  await c.registerUser(retailer.address, 4);
  await c.registerUser(bank.address, 5);
  console.log("Users registered");

  console.log("\n--- Adding Product ---");
  await c.addProduct("Steel Coil");
  console.log("Product added by Manufacturer");

  console.log("\n--- Supply Chain Movement ---");

  await c.transfer(1, transporter.address, "Transporting");
  console.log("Transferred to transporter");

  await c.connect(transporter).transfer(1, distributor.address, "Warehouse");
  console.log("Transferred to distributor");

  await c.connect(distributor).transfer(1, retailer.address, "Store Shelf");
  console.log("Transferred to retailer");

  console.log("\n--- Finance Request & Approval ---");

  await c.requestFinance(1, 10000);
  console.log("Finance requested");

  await c.connect(bank).approveFinance(1);
  console.log("Finance approved by bank");

  console.log("\n--- Product History ---");

  const h = await c.getProductHistory(1);
  console.log("History:");
  console.log(h);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
