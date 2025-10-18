import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';


export const config = getDefaultConfig({
  appName: 'Zama Encrypted AI',
  projectId:"projectId",
  chains: [sepolia],
  ssr: false,
});
