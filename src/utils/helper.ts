import FabricCAServices from "fabric-ca-client"
import { Wallets } from "fabric-network"
import fs from "fs"
import path from "path"
import logger from "./logger"

const getCCP = async (org: string) => {
  console.log(`🛡️ [Debug] Organization received: ${org}`)

  let ccpPath = null

  if (org === "Org1") {
    ccpPath = path.resolve(__dirname, "..", "config", "connection-org1.json")
  } else if (org === "Org2") {
    ccpPath = path.resolve(__dirname, "..", "config", "connection-org2.json")
  }

  console.log(`🛡️ [Debug] CCP Path resolved: ${ccpPath}`)

  if (!ccpPath) {
    throw new Error(`❌ Invalid organization provided: ${org}`)
  }

  if (!fs.existsSync(ccpPath)) {
    throw new Error(`❌ Network configuration file not found at path: ${ccpPath}`)
  }

  const ccpJSON = fs.readFileSync(ccpPath, "utf8")
  const ccp = JSON.parse(ccpJSON)
  return ccp
}

const getCaUrl = async (org: string, ccp: any) => {
  let caURL = null

  if (org == "Org1") {
    caURL = ccp.certificateAuthorities["ca.org1.example.com"].url
  } else if (org == "Org2") {
    caURL = ccp.certificateAuthorities["ca.org2.example.com"].url
  }

  return caURL
}

const getWalletPath = async (org: string) => {
  let walletPath = null
  org == "Org1" ? (walletPath = path.join(process.cwd(), "org1-wallet")) : null
  org == "Org2" ? (walletPath = path.join(process.cwd(), "org2-wallet")) : null
  return walletPath
}

const getAffiliation = async (org: string) => {
  return org == "Org1" ? "department1" : "department1"
}

const getRegisteredUser = async (username: string, userOrg: string) => {
  const ccp = await getCCP(userOrg)

  const caURL = await getCaUrl(userOrg, ccp)
  logger.info("ca url is ", caURL)
  const ca = new FabricCAServices(caURL)

  const walletPath = await getWalletPath(userOrg)
  const wallet = await Wallets.newFileSystemWallet(walletPath)
  logger.info(`Wallet path: ${walletPath}`)

  const userIdentity = await wallet.get(username)
  if (userIdentity) {
    logger.info(`An identity for the user ${username} already exists in the wallet`)
    const response = {
      success: true,
      message: username + " enrolled Successfully",
    }
    return response
  }

  // Check to see if we've already enrolled the admin user.
  let adminIdentity = await wallet.get("admin")
  if (!adminIdentity) {
    logger.info('An identity for the admin user "admin" does not exist in the wallet')
    await enrollAdmin(userOrg, ccp)
    adminIdentity = await wallet.get("admin")
    logger.info("Admin Enrolled Successfully")
  }

  // build a user object for authenticating with the CA
  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
  const adminUser = await provider.getUserContext(adminIdentity, "admin")
  let secret
  try {
    // Register the user, enroll the user, and import the new identity into the wallet.
    secret = await ca.register(
      { affiliation: await getAffiliation(userOrg), enrollmentID: username, role: "client" },
      adminUser,
    )
    // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);
  } catch (error) {
    return error.message
  }

  const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret })
  // const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret, attr_reqs: [{ name: 'role', optional: false }] });

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: `${userOrg}MSP`,
    type: "X.509",
  }
  await wallet.put(username, x509Identity)
  logger.info(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`)

  const response = {
    success: true,
    message: username + " enrolled Successfully",
  }
  return response
}

const isUserRegistered = async (username: string, userOrg: string): Promise<boolean> => {
  const walletPath = await getWalletPath(userOrg)
  const wallet = await Wallets.newFileSystemWallet(walletPath)
  logger.info(`Wallet path: ${walletPath}`)

  const userIdentity = await wallet.get(username)
  if (userIdentity) {
    logger.info(`An identity for the user ${username} exists in the wallet`)
    return true
  }
  return false
}

const getCaInfo = (org: string, ccp: any) => {
  let caInfo = null
  org == "Org1" ? (caInfo = ccp.certificateAuthorities["ca.org1.example.com"]) : null
  org == "Org2" ? (caInfo = ccp.certificateAuthorities["ca.org2.example.com"]) : null
  return caInfo
}
const getOrgMSP = (org: string): string => {
  let orgMSP = null
  org == "Org1" ? (orgMSP = "Org1MSP") : null
  org == "Org2" ? (orgMSP = "Org2MSP") : null
  return orgMSP
}
const enrollAdmin = async (org: string, ccp: any) => {
  logger.info("calling enroll Admin method")
  try {
    const caInfo = await getCaInfo(org, ccp)
    const caTLSCACerts = caInfo.tlsCACerts.pem
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

    // Create a new file system based wallet for managing identities.
    const walletPath = await getWalletPath(org) //path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    logger.info(`Wallet path: ${walletPath}`)

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get("admin")
    if (identity) {
      logger.info('An identity for the admin user "admin" already exists in the wallet')
      return
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" })
    logger.info("Enrollment object is : ", enrollment)
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: `${org}MSP`,
      type: "X.509",
    }

    await wallet.put("admin", x509Identity)
    logger.info('Successfully enrolled admin user "admin" and imported it into the wallet')
    return
  } catch (error) {
    console.error(`Failed to enroll admin user "admin": ${error}`)
  }
}

const registerAndGerSecret = async (username: string, userOrg: string) => {
  const ccp = await getCCP(userOrg)
  logger.info(username, userOrg)
  const caURL = await getCaUrl(userOrg, ccp)
  const ca = new FabricCAServices(caURL)

  const walletPath = await getWalletPath(userOrg)
  const wallet = await Wallets.newFileSystemWallet(walletPath)
  logger.info(`Wallet path: ${walletPath}`)

  const userIdentity = await wallet.get(username)
  if (userIdentity) {
    logger.info(`An identity for the user ${username} already exists in the wallet`)
    const response = {
      success: true,
      message: username + " enrolled Successfully",
    }
    return response
  }

  // Check to see if we've already enrolled the admin user.
  let adminIdentity = await wallet.get("admin")
  if (!adminIdentity) {
    logger.info('An identity for the admin user "admin" does not exist in the wallet')
    await enrollAdmin(userOrg, ccp)
    adminIdentity = await wallet.get("admin")
    logger.info("Admin Enrolled Successfully")
  }

  // build a user object for authenticating with the CA
  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
  const adminUser = await provider.getUserContext(adminIdentity, "admin")
  let secret
  try {
    // Register the user, enroll the user, and import the new identity into the wallet.
    secret = await ca.register({ affiliation: null, enrollmentID: username, role: "client" }, adminUser)
    // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);
    const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: secret,
    })
    const orgMSPId = getOrgMSP(userOrg)
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSPId,
      type: "X.509",
    }
    await wallet.put(username, x509Identity)
  } catch (error) {
    return error.message
  }

  const response = {
    success: true,
    message: username + " enrolled Successfully",
    secret: secret,
  }
  return response
}

const _ = {
  getCCP: getCCP,
  getWalletPath: getWalletPath,
  getRegisteredUser: getRegisteredUser,
  isUserRegistered: isUserRegistered,
  registerAndGerSecret: registerAndGerSecret,
}

export default _
