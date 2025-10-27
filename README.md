# FHE Encrypted AI

A privacy-preserving AI interaction platform built on Fully Homomorphic Encryption (FHE) technology. This decentralized application enables users to submit encrypted prompts to AI models and receive encrypted responses, ensuring complete confidentiality throughout the entire interaction process.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Problems Solved](#problems-solved)
- [Advantages](#advantages)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Smart Contract Deployment](#smart-contract-deployment)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
  - [Submitting Encrypted Messages](#submitting-encrypted-messages)
  - [Requesting AI Responses](#requesting-ai-responses)
  - [Using Hardhat Tasks](#using-hardhat-tasks)
- [Smart Contract API](#smart-contract-api)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

FHE Encrypted AI is a groundbreaking decentralized application that combines blockchain technology with Fully Homomorphic Encryption (FHE) to create a privacy-first AI interaction platform. Unlike traditional AI services where your prompts and conversations are visible to service providers, Zama Encrypted AI ensures that your questions and AI responses remain encrypted end-to-end, protecting your intellectual property, sensitive queries, and personal data.

The platform leverages Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) to perform computations on encrypted data, allowing AI models to process your prompts without ever seeing the actual content. This revolutionary approach makes it possible to benefit from powerful AI capabilities while maintaining complete privacy.

## Key Features

### 🔒 **End-to-End Encryption**
- All user prompts are encrypted client-side before being sent to the blockchain
- AI responses are encrypted and can only be decrypted by the original requester
- Encryption keys are themselves encrypted using FHE technology
- Zero-knowledge architecture ensures no intermediary can access plain text data

### 🤖 **Multi-Model AI Support**
- Support for multiple AI models (GPT-5, Grok 4, Claude 4.5, Llama Vision)
- Model selection is stored encrypted on-chain
- Flexible architecture allows easy addition of new AI models
- Each message tracks which model was used for future reference

### 🔐 **Homomorphic Encryption**
- Built on Zama's FHEVM protocol for blockchain-native FHE
- Encrypted addresses (eaddress) for secure key management
- Support for encrypted input proofs to verify data integrity
- Permission system to control who can access encrypted data

### 📜 **Blockchain-Based History**
- Immutable record of all encrypted interactions
- Per-user message history tracking
- Timestamped messages for audit trails
- Transparent and verifiable without compromising privacy

### 🌐 **Decentralized Architecture**
- Deployed on Ethereum-compatible networks (Sepolia testnet supported)
- No central server storing your private data
- Smart contract-based access control
- Censorship-resistant platform

### 💼 **User-Friendly Interface**
- Modern React-based web application
- Wallet integration via RainbowKit
- Real-time message decryption
- Intuitive conversation management

### 🔧 **Developer-Friendly**
- Comprehensive Hardhat development environment
- Custom tasks for contract interaction
- Type-safe TypeScript implementation
- Extensive testing framework

## How It Works

### Encryption Flow

1. **Message Creation**
   - User enters a prompt in the frontend application
   - Application generates a random Ethereum address to use as an encryption key
   - The prompt is encrypted using XOR cipher with the random address
   - The random address itself is encrypted using FHEVM's encrypted input system

2. **On-Chain Storage**
   - The encrypted message (ciphertext) is stored directly in the smart contract
   - The encrypted address is stored as an `eaddress` type (FHE-encrypted address)
   - Permissions are set to allow only the user and designated bot address to access the encrypted key
   - Model ID and timestamp are recorded alongside the encrypted data

3. **Response Generation**
   - User requests a response for a specific message
   - Smart contract creates a new encrypted address from a plain response address
   - The bot can access both the encrypted prompt key and response key
   - AI model processes the encrypted prompt (in a future implementation)
   - Response is encrypted using the response key

4. **Decryption Process**
   - User's wallet signs an EIP-712 typed data request for decryption
   - Zama's relayer service decrypts the encrypted handles using FHE
   - Client receives the plain encryption keys
   - Messages and responses are decrypted client-side using the recovered keys

### Permission System

The smart contract implements a sophisticated permission system for encrypted data:

- **Contract Level**: Smart contract can access encrypted data for processing
- **User Level**: Original message sender always has access to their encrypted keys
- **Bot Level**: Designated bot address can access encrypted keys to generate responses
- **Time-Based**: Decryption permissions can be time-limited for additional security

## Technology Stack

### Blockchain & Smart Contracts
- **Solidity ^0.8.24**: Smart contract programming language
- **FHEVM (@fhevm/solidity ^0.8.0)**: Zama's Fully Homomorphic Encryption library for Solidity
- **Hardhat ^2.26.0**: Ethereum development environment
- **ethers.js ^6.15.0**: Ethereum wallet and contract interaction library
- **hardhat-deploy**: Deterministic deployment system
- **TypeChain**: TypeScript bindings for smart contracts

### Frontend
- **React ^19.1.1**: Modern UI library
- **TypeScript ~5.8.3**: Type-safe JavaScript
- **Vite ^7.1.6**: Fast build tool and development server
- **wagmi ^2.17.0**: React hooks for Ethereum
- **viem ^2.37.6**: Lightweight Ethereum interface
- **@rainbow-me/rainbowkit ^2.2.8**: Beautiful wallet connection UI
- **@tanstack/react-query ^5.89.0**: Powerful data synchronization

### Encryption & Privacy
- **@zama-fhe/relayer-sdk ^0.2.0**: Zama's relayer SDK for FHE operations
- **@zama-fhe/oracle-solidity ^0.1.0**: Oracle for FHE computations
- **encrypted-types ^0.0.4**: Type definitions for encrypted data
- **FHEVM Hardhat Plugin**: Development tools for FHE smart contracts

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Solhint**: Solidity linting
- **Hardhat Gas Reporter**: Gas usage analysis
- **Solidity Coverage**: Test coverage reporting

### Network & Infrastructure
- **Sepolia Testnet**: Ethereum test network for deployment
- **Infura**: Ethereum node infrastructure
- **Etherscan**: Contract verification and blockchain explorer

## Problems Solved

### 1. **AI Privacy Concerns**
**Problem**: Traditional AI services require users to send their prompts in plain text, exposing sensitive information, trade secrets, medical queries, legal questions, and personal data to service providers and potential data breaches.

**Solution**: Zama Encrypted AI encrypts all prompts before they leave the user's device. The AI service provider (or bot) processes requests without ever seeing the actual content, ensuring complete privacy.

### 2. **Centralized Data Vulnerability**
**Problem**: Centralized AI platforms store conversation histories in databases that can be hacked, subpoenaed, or misused. Users have no control over their data.

**Solution**: By storing only encrypted data on a public blockchain, the platform eliminates central points of failure. Even if the blockchain is public, all sensitive data remains encrypted and accessible only to authorized parties.

### 3. **Trust in AI Providers**
**Problem**: Users must trust that AI companies won't misuse their data for training, advertising, or surveillance purposes.

**Solution**: The cryptographic guarantees of FHE eliminate the need for trust. It's mathematically impossible for the service provider to access plain text data, regardless of their intentions.

### 4. **Intellectual Property Protection**
**Problem**: Companies and researchers hesitate to use AI services for fear that their proprietary information, research questions, or strategic insights will be exposed.

**Solution**: FHE allows organizations to leverage powerful AI capabilities without revealing trade secrets or sensitive business information.

### 5. **Regulatory Compliance**
**Problem**: Industries like healthcare, finance, and legal services face strict data privacy regulations (GDPR, HIPAA, etc.) that often prohibit sharing sensitive data with third-party AI services.

**Solution**: Encrypted processing ensures compliance with privacy regulations since sensitive data is never exposed in plain text to external services.

### 6. **Censorship Resistance**
**Problem**: Centralized AI platforms can censor, filter, or deny service based on the content of user queries.

**Solution**: Decentralized deployment on blockchain with encrypted queries makes censorship technically infeasible since no party can read the content.

### 7. **Data Ownership**
**Problem**: In traditional platforms, users lose control over their AI interactions, which may be used for model training or commercial purposes without consent.

**Solution**: Blockchain-based storage with cryptographic access controls ensures users maintain complete ownership and control over their data.

## Advantages

### Security & Privacy
- **Cryptographic Privacy**: FHE provides mathematical guarantees that data cannot be decrypted without proper keys
- **No Trusted Third Party**: The security model doesn't require trusting any service provider
- **Front-Running Protection**: Encrypted inputs prevent MEV (Maximal Extractable Value) attacks
- **Permissioned Access**: Fine-grained control over who can access encrypted data
- **Audit Trail**: Blockchain provides immutable, verifiable record of interactions

### Technical Excellence
- **Cutting-Edge Cryptography**: Leverages latest advances in FHE technology from Zama
- **Ethereum Compatibility**: Works with existing Ethereum infrastructure and wallets
- **Type Safety**: Full TypeScript implementation reduces bugs and improves developer experience
- **Modular Architecture**: Clean separation between smart contracts, frontend, and encryption layers
- **Gas Optimization**: Smart contract optimized with 800 runs for reduced transaction costs

### User Experience
- **Familiar Interface**: Standard web3 wallet connection flow
- **No Special Software**: Works with any Ethereum-compatible wallet
- **Real-Time Updates**: Instant feedback on transaction status and message decryption
- **Multi-Model Choice**: Flexibility to select different AI models for different use cases
- **Message History**: Easy access to past encrypted conversations

### Scalability & Extensibility
- **Multiple AI Models**: Architecture supports unlimited AI model integrations
- **Upgradeable Design**: Contract ownership allows for controlled upgrades
- **Network Flexibility**: Can deploy to any EVM-compatible chain
- **Open Source**: Community can contribute improvements and extensions
- **SDK Integration**: Zama's relayer SDK simplifies complex encryption operations

### Business & Economic
- **Lower Liability**: Service providers don't handle sensitive data, reducing legal risk
- **New Markets**: Enables AI services in previously restricted industries
- **Competitive Advantage**: First-mover advantage in privacy-preserving AI
- **Token Economics Ready**: Architecture could integrate token-based incentives
- **Compliance by Design**: Built-in privacy makes regulatory compliance easier

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend Application                   │  │
│  │  • User inputs prompt                                     │  │
│  │  • Client-side XOR encryption                             │  │
│  │  • Wallet integration (RainbowKit)                        │  │
│  │  • Message history display                                │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                            │
│  ┌─────────────────▼────────────────────────────────────────┐  │
│  │         Zama Relayer SDK                                  │  │
│  │  • FHE encryption/decryption                              │  │
│  │  • EIP-712 signature generation                           │  │
│  │  • Encrypted input creation                               │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                            │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   Ethereum Network (Sepolia)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ZamaAI Smart Contract                        │  │
│  │                                                            │  │
│  │  State Variables:                                         │  │
│  │  • Message[] messages                                     │  │
│  │  • mapping(address => uint256[]) userMessages             │  │
│  │  • address owner, botAddress, responsePlainAddress        │  │
│  │                                                            │  │
│  │  Functions:                                               │  │
│  │  • submitMessage() - Store encrypted prompts              │  │
│  │  • requestResponse() - Get encrypted AI response          │  │
│  │  • getMessage() - Retrieve message data                   │  │
│  │  • getUserMessageIds() - Get user's messages              │  │
│  │                                                            │  │
│  │  Uses:                                                    │  │
│  │  • FHEVM library for encrypted types                     │  │
│  │  • SepoliaConfig for network setup                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Read encrypted data
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                  Zama FHE Oracle & Relayer                      │
│  • Decrypts FHE-encrypted handles                              │
│  • Validates EIP-712 signatures                                │
│  • Returns decryption results to authorized users              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Decrypted keys returned
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    AI Bot Service (Future)                      │
│  • Receives encrypted prompts                                  │
│  • Processes using AI models                                   │
│  • Returns encrypted responses                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Message Submission Flow
```
1. User Input → 2. Client XOR Encrypt → 3. Generate Random Key →
4. FHE Encrypt Key → 5. Create Proof → 6. Submit Transaction →
7. Smart Contract Stores → 8. Set Permissions → 9. Emit Event
```

#### Response Request Flow
```
1. User Clicks "Unlock" → 2. Call requestResponse() →
3. Contract Creates Encrypted Response Key → 4. Set Permissions →
5. Sign EIP-712 Request → 6. Call Zama Relayer →
7. Decrypt Response Key → 8. XOR Decrypt Response →
9. Display to User
```

### Smart Contract Structure

```solidity
struct Message {
    address user;              // Message sender
    string encryptedMessage;   // XOR-encrypted prompt
    eaddress encryptedAddress; // FHE-encrypted key
    uint256 modelId;           // AI model identifier
    uint256 timestamp;         // Submission time
}
```

### Security Model

1. **Confidentiality Layers**:
   - Layer 1: Client-side XOR encryption of message content
   - Layer 2: FHE encryption of the XOR key
   - Layer 3: Permission-based access control to encrypted keys
   - Layer 4: EIP-712 signature verification for decryption requests

2. **Access Control**:
   - Contract owner: Administrative functions only
   - Message sender: Can decrypt their own message keys
   - Bot address: Can access keys to generate responses
   - Anyone else: Cannot access encrypted data

3. **Attack Resistance**:
   - Front-running: Encrypted inputs prevent transaction content analysis
   - Replay attacks: EIP-712 signatures include timestamps and nonces
   - Unauthorized access: FHE ensures encrypted data cannot be decrypted without keys
   - Contract attacks: Standard ownership and access control patterns

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Version 7.0.0 or higher (included with Node.js)
- **Git**: For cloning the repository ([Download](https://git-scm.com/))
- **MetaMask** or another Web3 wallet: For interacting with the application
- **Sepolia ETH**: Test tokens for deployment and transactions ([Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ZamaAI.git
   cd ZamaAI
   ```

2. **Install smart contract dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd home
   npm install
   cd ..
   ```

### Environment Setup

#### Smart Contract Environment

1. **Set up Hardhat configuration variables**

   ```bash
   # Set your wallet mnemonic (or use the default test mnemonic)
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for Sepolia access
   npx hardhat vars set INFURA_API_KEY

   # Set your Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

2. **Create a `.env` file in the root directory**

   ```bash
   # Private key for deployment (alternative to MNEMONIC)
   SEPOLIA_PRIVATE_KEY=your_private_key_here
   PRIVATE_KEY=your_private_key_here

   # Infura API key
   INFURA_API_KEY=your_infura_api_key

   # Contract configuration
   BOT_ADDRESS=0x0000000000000000000000000000000000000000
   RESPONSE_ADDRESS=0x0000000000000000000000000000000000000000
   ```

   Replace placeholder values with your actual credentials.

#### Frontend Environment

1. **Create `home/.env` file**

   ```bash
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

   You'll update the contract address after deployment.

### Smart Contract Deployment

#### Local Development Network

1. **Start a local Hardhat node with FHEVM support**

   ```bash
   npx hardhat node
   ```

   Keep this terminal running. Open a new terminal for the next steps.

2. **Deploy contracts to local network**

   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Note the deployed contract address** from the output

#### Sepolia Testnet Deployment

1. **Ensure you have Sepolia ETH** in your wallet ([Get Sepolia ETH](https://sepoliafaucet.com/))

2. **Deploy to Sepolia**

   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **Verify the contract on Etherscan** (recommended)

   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "BOT_ADDRESS" "RESPONSE_ADDRESS"
   ```

   Replace `DEPLOYED_CONTRACT_ADDRESS`, `BOT_ADDRESS`, and `RESPONSE_ADDRESS` with actual values.

4. **Update frontend configuration**

   Edit `home/src/config/contracts.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
   ```

### Frontend Setup

1. **Navigate to the frontend directory**

   ```bash
   cd home
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Connect your wallet** using the Connect button

5. **Start interacting** with the encrypted AI platform

## Usage

### Submitting Encrypted Messages

#### Via Frontend

1. **Connect your wallet** using the "Connect Wallet" button
2. **Enter your prompt** in the text area
3. **Select an AI model** from the dropdown (GPT-5, Grok 4, Claude 4.5, or Llama Vision)
4. **Click "Encrypt & Send"**
   - Your message will be encrypted client-side
   - A transaction will be submitted to the blockchain
   - Wait for confirmation (usually 12-15 seconds on Sepolia)
5. **View your message** in the "Your encrypted conversations" section

#### Via Hardhat Tasks

```bash
# Submit a message with encryption
npx hardhat task:submit-message \
  --ciphertext "0x123abc..." \
  --key "0xYourRandomAddress" \
  --model 1 \
  --network sepolia
```

### Requesting AI Responses

#### Via Frontend

1. **Locate your message** in the conversation list
2. **Click "Unlock AI response"** button
3. **Sign the EIP-712 request** in your wallet
4. **Wait for decryption** (a few seconds)
5. **View the decrypted response** displayed below your message

#### Via Smart Contract

The `requestResponse` function can be called directly:

```javascript
const messageId = 0; // Your message ID
const tx = await zamaAIContract.requestResponse(messageId);
await tx.wait();
```

### Using Hardhat Tasks

#### Get Contract Address

```bash
npx hardhat task:address
```

#### Get Total Message Count

```bash
npx hardhat task:total-messages --network sepolia
```

With custom contract address:
```bash
npx hardhat task:total-messages \
  --contract 0xYourContractAddress \
  --network sepolia
```

#### Get Message Details

```bash
npx hardhat task:get-message \
  --id 0 \
  --network sepolia
```

This displays:
- User address
- Encrypted message (ciphertext)
- Encrypted key handle
- Model ID
- Timestamp

## Smart Contract API

### State Variables

```solidity
address public owner;                         // Contract owner
address public botAddress;                    // AI bot service address
address public responsePlainAddress;          // Plain address for response encryption
Message[] private messages;                   // All messages
mapping(address => uint256[]) private userMessages; // User's message IDs
```

### Events

```solidity
event MessageSubmitted(
    uint256 indexed messageId,
    address indexed user,
    uint256 modelId,
    string ciphertext
);

event ResponseRequested(
    uint256 indexed messageId,
    address indexed user
);

event BotAddressUpdated(address indexed newBotAddress);
event ResponseAddressUpdated(address indexed newPlainAddress);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### Functions

#### User Functions

**`submitMessage`**
```solidity
function submitMessage(
    string calldata encryptedMessage,
    externalEaddress encryptedAddressHandle,
    bytes calldata inputProof,
    uint256 modelId
) external returns (uint256)
```
Submits an encrypted message to the platform.

Parameters:
- `encryptedMessage`: XOR-encrypted prompt (ciphertext as hex string)
- `encryptedAddressHandle`: FHE-encrypted address handle
- `inputProof`: Cryptographic proof for encrypted input
- `modelId`: AI model identifier (1-4)

Returns: Message ID

**`requestResponse`**
```solidity
function requestResponse(uint256 messageId) external returns (eaddress)
```
Requests an AI response for a message.

Parameters:
- `messageId`: ID of the message

Returns: Encrypted address for the response

Reverts if:
- Message ID is invalid
- Caller is not the message owner

#### View Functions

**`totalMessages`**
```solidity
function totalMessages() external view returns (uint256)
```
Returns the total number of messages submitted.

**`getUserMessageIds`**
```solidity
function getUserMessageIds(address user) external view returns (uint256[] memory)
```
Returns all message IDs for a specific user.

**`getMessage`**
```solidity
function getMessage(uint256 messageId) external view returns (
    address,
    string memory,
    eaddress,
    uint256,
    uint256
)
```
Returns complete message data.

Returns:
- User address
- Encrypted message (ciphertext)
- Encrypted address handle
- Model ID
- Timestamp

#### Admin Functions

**`transferOwnership`**
```solidity
function transferOwnership(address newOwner) external onlyOwner
```
Transfers contract ownership to a new address.

**`updateBotAddress`**
```solidity
function updateBotAddress(address newBotAddress) external onlyOwner
```
Updates the AI bot service address.

**`updateResponsePlainAddress`**
```solidity
function updateResponsePlainAddress(address newPlainResponseAddress) external onlyOwner
```
Updates the plain address used for response encryption.

## Security Considerations

### Smart Contract Security

1. **Access Control**
   - Only the message owner can request responses for their messages
   - Only the contract owner can update critical addresses
   - FHE permissions strictly control encrypted data access

2. **Input Validation**
   - All addresses validated against zero address
   - Message IDs checked for validity
   - Empty messages rejected

3. **Reentrancy Protection**
   - No external calls after state changes
   - State-changing operations completed before events

4. **Upgradeability**
   - Contract ownership allows controlled updates
   - Critical addresses (bot, response) can be changed if compromised

### Encryption Security

1. **Key Generation**
   - Random addresses generated using cryptographically secure methods
   - Keys never stored in plain text
   - Each message uses a unique encryption key

2. **FHE Security**
   - Zama's FHEVM provides cryptographic security guarantees
   - Encrypted data cannot be decrypted without proper authorization
   - Permission system prevents unauthorized access

3. **Client-Side Encryption**
   - XOR encryption performed entirely in the browser
   - Keys never sent unencrypted over the network
   - Decryption only happens client-side after key recovery

### Best Practices for Users

1. **Wallet Security**
   - Use hardware wallets for high-value operations
   - Never share your private keys or seed phrases
   - Verify transaction details before signing

2. **Network Security**
   - Use HTTPS connections only
   - Verify the application URL
   - Be cautious of phishing attempts

3. **Data Privacy**
   - While messages are encrypted, metadata (timestamp, model ID) is public
   - Consider using a dedicated wallet for additional privacy
   - Be aware that transaction patterns are visible on-chain

### Known Limitations

1. **Metadata Leakage**
   - Message count, timing, and model selection are public
   - Transaction sender addresses are visible
   - Gas usage patterns could reveal information

2. **AI Bot Trust**
   - Current implementation trusts the bot address for response generation
   - Future versions should implement decentralized AI inference

3. **Performance**
   - FHE operations are computationally intensive
   - Decryption requires interaction with Zama's relayer
   - Gas costs higher than plain text operations

## Testing

### Unit Tests

Run the complete test suite:

```bash
npm run test
```

Run tests on Sepolia testnet:

```bash
npm run test:sepolia
```

### Coverage

Generate a test coverage report:

```bash
npm run coverage
```

Coverage reports are generated in the `coverage/` directory.

### Manual Testing

1. **Local Testing**
   ```bash
   # Terminal 1: Start local node
   npx hardhat node

   # Terminal 2: Deploy and test
   npx hardhat deploy --network localhost
   npx hardhat task:total-messages --network localhost
   ```

2. **Frontend Testing**
   ```bash
   cd home
   npm run dev
   ```
   - Test wallet connection
   - Submit test messages
   - Request responses
   - Verify decryption

### Integration Testing

Test the complete flow from frontend to smart contract:

1. Deploy contract to Sepolia
2. Start frontend application
3. Connect wallet
4. Submit encrypted message
5. Wait for blockchain confirmation
6. Verify message appears in UI
7. Request response
8. Verify response decryption

## Project Structure

```
ZamaAI/
├── contracts/                  # Smart contract source files
│   └── ZamaAI.sol             # Main contract implementation
│
├── deploy/                     # Hardhat deployment scripts
│   └── deploy.ts              # Deployment configuration
│
├── home/                       # Frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── AIAgentApp.tsx # Main application component
│   │   ├── config/            # Configuration files
│   │   │   ├── contracts.ts   # Contract address and ABI
│   │   │   └── wagmi.ts       # Web3 configuration
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useEthersSigner.ts
│   │   │   └── useZamaInstance.ts
│   │   ├── App.tsx            # App wrapper
│   │   └── main.tsx           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
│
├── tasks/                      # Hardhat custom tasks
│   ├── accounts.ts            # Account management tasks
│   └── ZamaAI.ts              # Contract interaction tasks
│
├── test/                       # Test files
│   └── ZamaAI.test.ts         # Contract tests
│
├── .gitignore                  # Git ignore rules
├── hardhat.config.ts          # Hardhat configuration
├── package.json               # Root dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

### Key Files

- **`contracts/ZamaAI.sol`**: Core smart contract implementing encrypted message storage and retrieval
- **`home/src/components/AIAgentApp.tsx`**: Main React component with encryption/decryption logic
- **`deploy/deploy.ts`**: Hardhat deployment script with configuration
- **`tasks/ZamaAI.ts`**: CLI tasks for contract interaction
- **`hardhat.config.ts`**: Network configuration, compiler settings, plugins

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)
- [ ] **Actual AI Integration**: Connect to real AI models (GPT, Claude, Llama)
- [ ] **Decentralized AI Inference**: Implement decentralized compute for AI processing
- [ ] **Response Encryption**: Complete the response flow with actual AI-generated content
- [ ] **Gas Optimization**: Reduce transaction costs through contract optimization
- [ ] **Batch Operations**: Support submitting multiple messages in one transaction

### Phase 2: Advanced Features (Q3 2025)
- [ ] **Conversation Threading**: Link related messages into conversations
- [ ] **Message Editing/Deletion**: Allow users to modify or remove messages
- [ ] **Advanced Encryption Modes**: Support for additional encryption algorithms
- [ ] **Multi-Party Computation**: Enable collaborative AI interactions
- [ ] **Token-Gated Access**: Implement payment system for AI services

### Phase 3: Platform Expansion (Q4 2025)
- [ ] **Mobile Application**: Native iOS and Android apps
- [ ] **Multi-Chain Deployment**: Support for Polygon, Arbitrum, Optimism
- [ ] **Plugin System**: Allow third-party AI model integration
- [ ] **DAO Governance**: Community governance for platform parameters
- [ ] **Decentralized Storage**: IPFS/Arweave integration for large data

### Phase 4: Enterprise Features (2026)
- [ ] **Private Deployments**: Self-hosted version for enterprises
- [ ] **API Access**: RESTful API for programmatic access
- [ ] **Audit Logging**: Enhanced compliance and audit features
- [ ] **Role-Based Access**: Organization-level permission management
- [ ] **SLA Guarantees**: Service level agreements for enterprise users

### Research & Innovation
- [ ] **Zero-Knowledge Proofs**: ZK-SNARKs for enhanced privacy
- [ ] **Quantum-Resistant Encryption**: Future-proof cryptography
- [ ] **Federated Learning**: Collaborative model training on encrypted data
- [ ] **Homomorphic Training**: Train AI models on encrypted datasets
- [ ] **Cross-Chain Bridges**: Enable multi-chain encrypted operations

### Developer Experience
- [ ] **SDK Development**: JavaScript, Python, Rust SDKs
- [ ] **Testing Framework**: Comprehensive testing tools for FHE dApps
- [ ] **Documentation**: Expanded tutorials, guides, and API documentation
- [ ] **Developer Dashboard**: Monitor usage, gas costs, and analytics
- [ ] **Template Library**: Pre-built components for FHE applications

### Community & Ecosystem
- [ ] **Bug Bounty Program**: Incentivize security research
- [ ] **Hackathons**: Regular events to build on the platform
- [ ] **Grant Program**: Fund community projects and integrations
- [ ] **Educational Content**: Courses on FHE and privacy-preserving AI
- [ ] **Partnership Network**: Integrate with other privacy-focused projects

## Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, documentation improvements, or code contributions, your help makes this project better.

### How to Contribute

1. **Fork the repository**
   ```bash
   git fork https://github.com/yourusername/ZamaAI.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Run tests**
   ```bash
   npm run test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Wait for review and address feedback

### Development Guidelines

- **Code Style**: Follow TypeScript and Solidity best practices
- **Testing**: Maintain or improve test coverage
- **Documentation**: Update README and inline comments
- **Gas Efficiency**: Optimize smart contract gas usage
- **Security**: Consider security implications of all changes

### Reporting Issues

- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Provide relevant logs and error messages
- Specify your environment (OS, Node version, etc.)

### Feature Requests

- Open a GitHub Issue with the "enhancement" label
- Clearly describe the proposed feature
- Explain the use case and benefits
- Be open to discussion and feedback

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### What This Means

- ✅ **Commercial use**: You can use this software for commercial purposes
- ✅ **Modification**: You can modify the software
- ✅ **Distribution**: You can distribute the software
- ✅ **Private use**: You can use the software privately

### Conditions

- 📋 **License and copyright notice**: Include the license and copyright notice in all copies
- 🚫 **No patent grant**: This license explicitly does not grant patent rights

### Limitations

- ❌ **Liability**: The software is provided "as is" without warranty
- ❌ **Trademark use**: Does not grant rights to use contributors' names or trademarks
- ❌ **Warranty**: No warranty is provided

See the [LICENSE](LICENSE) file for the complete license text.

## Support

### Getting Help

- **📖 Documentation**: Read our comprehensive docs
- **💬 GitHub Discussions**: Ask questions and share ideas at [GitHub Discussions](https://github.com/yourusername/ZamaAI/discussions)
- **🐛 Issue Tracker**: Report bugs at [GitHub Issues](https://github.com/yourusername/ZamaAI/issues)
- **🔧 Stack Overflow**: Tag questions with `zama-fhevm` and `encrypted-ai`

### Community

- **Discord**: Join the Zama community at [discord.gg/zama](https://discord.gg/zama)
- **Twitter**: Follow updates [@Zama_fhe](https://twitter.com/Zama_fhe)
- **Blog**: Read technical articles at [zama.ai/blog](https://www.zama.ai/blog)

### Resources

- **Zama Documentation**: [docs.zama.ai](https://docs.zama.ai)
- **FHEVM Docs**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [hardhat.org](https://hardhat.org)
- **React Docs**: [react.dev](https://react.dev)

### Professional Support

For enterprise support, custom development, or consulting services, please contact:
- Email: contact@example.com
- Website: [yourproject.com](https://yourproject.com)

---

## Acknowledgments

- **Zama Team**: For developing FHEVM and pioneering FHE technology
- **Ethereum Foundation**: For the robust blockchain infrastructure
- **Hardhat Team**: For excellent development tools
- **React Team**: For the powerful UI framework
- **Community Contributors**: For feedback, testing, and contributions

---

## Citation

If you use this project in your research or work, please cite:

```bibtex
@software{zamaai2025,
  title = {Zama Encrypted AI: Privacy-Preserving AI on Blockchain},
  author = {Your Name},
  year = {2025},
  url = {https://github.com/yourusername/ZamaAI}
}
```

---

**Built with ❤️ for a privacy-preserving future**

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Never use with real sensitive data in production without thorough security audits.
