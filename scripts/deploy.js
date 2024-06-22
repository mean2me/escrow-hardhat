const hre = require('hardhat')

async function main() {
  const MsgSender = await hre.ethers.getContractFactory('Escrow')
  const msgSender = await MsgSender.deploy()

  await msgSender.waitForDeployment()

  console.log('Contract deployed at: ' + (await msgSender.getAddress()))
}

main().catch((err) => {
  console.log(err)
  process.exitCode = 1
})
