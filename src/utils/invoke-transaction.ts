import { Gateway, Wallets } from "fabric-network"
import helper from "./helper"
import logger from "./logger"

const invokeTransaction = async (
  channelName: string,
  chaincodeName: string,
  fcn: string,
  args: any,
  username: string,
  org_name: string,
) => {
  try {
    logger.info(channelName)
    logger.info(chaincodeName)
    logger.info(fcn)
    logger.info(args)
    logger.info(username)
    logger.info(org_name)

    const ccp = await helper.getCCP(org_name)
    console.log(`Loaded CCP: ${JSON.stringify(ccp)}`)

    console.log(`Loaded the network configuration located at ${ccp}`)
    const walletPath = await helper.getWalletPath(org_name)
    console.log(`Wallet path: ${walletPath}`)
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    console.log(`Wallet path: ${wallet}`)
    let identity = await wallet.get(username)
    if (!identity) {
      console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`)
      await helper.getRegisteredUser(username, org_name)
      identity = await wallet.get(username)
      console.log("Run the registerUser.js application before retrying")
      return
    }
    const connectOptions = {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    }
    console.log("🚀 ~ invokeTransaction ~ connectOptions:", connectOptions)
    const gateway = new Gateway()
    await gateway.connect(ccp, connectOptions)
    const network = await gateway.getNetwork(channelName)
    const contract = network.getContract(chaincodeName)
    console.log("args", JSON.stringify(args))
    console.log("JSON.stringify(args)", JSON.stringify(args))
    let result
    if (typeof args === "string") {
      result = await contract.submitTransaction(fcn, args)
    } else {
      // result = await contract.submitTransaction(fcn, JSON.stringify(args))
      result = await contract.submitTransaction(fcn, ...args);
    }
    gateway.disconnect()
    // result = JSON.parse(result.toString());
    const response = {
      result: result.toLocaleString(),
    }
    return response
  } catch (error) {
    console.log(`Getting error: ${error}`)
    return { status: 500, error: error.message }
  }
}

export default invokeTransaction
