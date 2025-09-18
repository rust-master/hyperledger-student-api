import { Gateway, Wallets } from "fabric-network"
import helper from "./helper"
import logger from "./logger"

const queryTransaction = async (
  channelName: string,
  chaincodeName: string,
  fcn: string,
  args: any,
  username: string,
  org_name: string,
) => {
  try {
    logger.info(`Query Transaction - Channel: ${channelName}, Chaincode: ${chaincodeName}, Function: ${fcn}`)

    const ccp = await helper.getCCP(org_name)
    const walletPath = await helper.getWalletPath(org_name)
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    let identity = await wallet.get(username)
    if (!identity) {
      logger.info(`Identity for user ${username} does not exist, registering user`)
      await helper.getRegisteredUser(username, org_name)
      identity = await wallet.get(username)
    }

    const connectOptions = {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    }

    const gateway = new Gateway()
    await gateway.connect(ccp, connectOptions)
    const network = await gateway.getNetwork(channelName)
    const contract = network.getContract(chaincodeName)

    let result
    if (typeof args === "string") {
      result = await contract.evaluateTransaction(fcn, args)
    } else {
      result = await contract.evaluateTransaction(fcn, JSON.stringify(args))
    }

    gateway.disconnect()

    const response = {
      result: result.toString(),
    }
    return response
  } catch (error) {
    logger.error(`Query transaction error: ${error}`)
    return { status: 500, error: error.message }
  }
}

export default queryTransaction
