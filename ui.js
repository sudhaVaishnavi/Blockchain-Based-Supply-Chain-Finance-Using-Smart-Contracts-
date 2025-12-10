import prompts from "prompts";
import chalk from "chalk";
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const C = await ethers.getContractFactory("SupplyChainFinance");
  const c = await C.deploy();
  await c.deployed();

  console.log(chalk.green("\nBlockchain Supply Chain UI Ready!"));
  console.log("Contract:", c.address);

  while (true) {
    const { option } = await prompts({
      type: "select",
      name: "option",
      message: "Choose an action",
      choices: [
        { title: "Add Product", value: 1 },
        { title: "Transfer Product", value: 2 },
        { title: "Request Finance", value: 3 },
        { title: "Approve Finance", value: 4 },
        { title: "Get History", value: 5 },
        { title: "Exit", value: 99 },
      ]
    });

    if (option === 99) process.exit();

    switch(option) {
      case 1:
        await addProduct(c);
        break;
      case 2:
        await transferProduct(c);
        break;
      case 3:
        await financeRequest(c);
        break;
      case 4:
        await approveFinance(c);
        break;
      case 5:
        await productHistory(c);
        break;
    }
  }
}

async function addProduct(c) {
  const { name } = await prompts({
    type: "text",
    name: "name",
    message: "Enter product name:"
  });

  await c.addProduct(name);
  console.log(chalk.green("Product Added!"));
}

async function transferProduct(c) {
  const { id, to } = await prompts([
    { type: "number", name: "id", message: "Product ID:" },
    { type: "text", name: "to", message: "Receiver Address:" }
  ]);

  await c.transfer(id, to, "Moved");
  console.log(chalk.blue("Transferred!"));
}

async function financeRequest(c) {
  const { id, amt } = await prompts([
    { type: "number", name: "id", message: "Product ID:" },
    { type: "number", name: "amt", message: "Amount:" }
  ]);

  await c.requestFinance(id, amt);
  console.log(chalk.yellow("Finance Requested!"));
}

async function approveFinance(c) {
  const { id } = await prompts({
    type: "number",
    name: "id",
    message: "Finance Request ID:"
  });

  const [owner, t, d, r, bank] = await ethers.getSigners();
  await c.connect(bank).approveFinance(id);

  console.log(chalk.green("Finance Approved!"));
}

async function productHistory(c) {
  const { id } = await prompts({
    type: "number",
    name: "id",
    message: "Product ID:"
  });

  const h = await c.getProductHistory(id);
  console.log(chalk.magenta("History:"));
  console.log(h);
}

main();
