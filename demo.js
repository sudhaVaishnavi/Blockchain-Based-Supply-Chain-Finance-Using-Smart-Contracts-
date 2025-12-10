const { ethers } = require("hardhat");

async function main() {
  const Factory = await ethers.getContractFactory("SupplyChainFinance");
  const c = await Factory.deploy();
  await c.deployed();

  console.log("Contract deployed to:", c.address);

  const [owner, user2] = await ethers.getSigners();

  let tx = await c.connect(owner).addProduct("Steel Coils", "Created");
  await tx.wait();
  console.log("Product added by:", owner.address);

  tx = await c.connect(owner).transfer(1, user2.address, "Shipped");
  await tx.wait();
  console.log("Transferred to:", user2.address);

  const p = await c.get(1);
  console.log("Final product:", p);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
