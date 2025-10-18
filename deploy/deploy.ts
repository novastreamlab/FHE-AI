import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as dotenv from "dotenv";

dotenv.config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const botAddress = process.env.BOT_ADDRESS ?? deployer;
  const responsePlainAddress = process.env.RESPONSE_ADDRESS ?? deployer;

  const deployedZamaAI = await deploy("ZamaAI", {
    from: deployer,
    args: [botAddress, responsePlainAddress],
    log: true,
  });

  console.log(`ZamaAI contract: `, deployedZamaAI.address);
};
export default func;
func.id = "deploy_zama_ai"; // id required to prevent reexecution
func.tags = ["ZamaAI"];
