import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { Contract, ethers } from 'ethers';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';

const AI_MODELS = [
  { id: 1, label: 'GPT-5' },
  { id: 2, label: 'Grok 4' },
  { id: 3, label: 'Claude 4.5' },
  { id: 4, label: 'Llama Vision' },
];

const RESPONSE_TEXT = 'ai model is thingking...';

type DecryptedCache = Record<string, string>;

type MessageItem = {
  id: bigint;
  encryptedHandle: string;
  encryptedMessage: string;
  modelId: number;
  timestamp: bigint;
  plainKey?: string;
  plainMessage?: string;
};

type ResponseCache = Record<number, {
  key: string;
  encrypted: string;
  plain: string;
}>;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function encryptWithAddress(message: string, address: string): string {
  const keyBytes = hexToBytes(address.slice(2));
  const messageBytes = encoder.encode(message);
  const encrypted = new Uint8Array(messageBytes.length);

  for (let i = 0; i < messageBytes.length; i += 1) {
    encrypted[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return `0x${bytesToHex(encrypted)}`;
}

function decryptWithAddress(encrypted: string, address: string): string {
  if (!encrypted || encrypted === '0x') {
    return '';
  }

  const keyBytes = hexToBytes(address.slice(2));
  const encryptedBytes = hexToBytes(encrypted);
  const decrypted = new Uint8Array(encryptedBytes.length);

  for (let i = 0; i < encryptedBytes.length; i += 1) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return decoder.decode(decrypted);
}

function formatTimestamp(timestamp: bigint): string {
  if (!timestamp) {
    return '';
  }
  const millis = Number(timestamp) * 1000;
  if (Number.isNaN(millis)) {
    return '';
  }
  return new Date(millis).toLocaleString();
}

export function AIAgentApp() {
  const { address, isConnected } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const publicClient = usePublicClient();

  const [question, setQuestion] = useState('');
  const [selectedModel, setSelectedModel] = useState<number>(AI_MODELS[0]?.id ?? 1);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [responses, setResponses] = useState<ResponseCache>({});
  const [decryptCache, setDecryptCache] = useState<DecryptedCache>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const resolvedModelLabel = useMemo(() => {
    const item = AI_MODELS.find((model) => model.id === selectedModel);
    return item?.label ?? '';
  }, [selectedModel]);

  const decryptHandles = useCallback(async (
    handles: string[],
  ): Promise<Record<string, string>> => {
    if (!instance || !address) {
      throw new Error('Encryption service not ready');
    }
    const signer = await signerPromise;
    if (!signer) {
      throw new Error('Wallet signer unavailable');
    }

    const uniqueHandles = Array.from(new Set(handles.filter((handle) => handle && handle !== ethers.ZeroHash)));
    if (uniqueHandles.length === 0) {
      return {};
    }

    const keypair = instance.generateKeypair();
    const handleContractPairs = uniqueHandles.map((handle) => ({
      handle,
      contractAddress: CONTRACT_ADDRESS,
    }));

    const startTimestamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '5';
    const contractAddresses = [CONTRACT_ADDRESS];

    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimestamp,
      durationDays,
    );

    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message,
    );

    const decrypted = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      address,
      startTimestamp,
      durationDays,
    );

    return decrypted as Record<string, string>;
  }, [address, instance, signerPromise]);

  const refreshMessages = useCallback(async () => {
    if (!publicClient || !address) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    try {
      const rawIds = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getUserMessageIds',
        args: [address],
      }) as bigint[];

      if (!rawIds.length) {
        setMessages([]);
        return;
      }

      const uniqueIds = Array.from(new Set(rawIds.map((id) => Number(id)))).sort((a, b) => a - b);
      const fetchedMessages: MessageItem[] = [];

      for (const id of uniqueIds) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getMessage',
          args: [BigInt(id)],
        }) as [string, string, string, bigint, bigint];

        fetchedMessages.push({
          id: BigInt(id),
          encryptedHandle: data[2],
          encryptedMessage: data[1],
          modelId: Number(data[3]),
          timestamp: data[4],
        });
      }

      const handlesToDecrypt = fetchedMessages
        .map((item) => item.encryptedHandle)
        .filter((handle) => handle && !decryptCache[handle]);

      let newCache: Record<string, string> = {};
      if (handlesToDecrypt.length && instance && isConnected) {
        setIsDecrypting(true);
        try {
          newCache = await decryptHandles(handlesToDecrypt);
          setDecryptCache((prev) => ({ ...prev, ...newCache }));
        } finally {
          setIsDecrypting(false);
        }
      }

      const combinedCache = { ...decryptCache, ...newCache };

      const enrichedMessages = fetchedMessages.map((message) => {
        const plainKey = combinedCache[message.encryptedHandle];
        const plainMessage = plainKey ? decryptWithAddress(message.encryptedMessage, plainKey) : undefined;
        return { ...message, plainKey, plainMessage };
      });

      setMessages(enrichedMessages);
    } catch (error) {
      console.error('Failed to fetch messages', error);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [address, decryptCache, decryptHandles, instance, isConnected, publicClient]);

  useEffect(() => {
    if (isConnected) {
      refreshMessages();
    } else {
      setMessages([]);
      setResponses({});
    }
  }, [isConnected, address, refreshMessages]);

  const submitMessage = useCallback(async () => {
    if (!question.trim()) {
      setStatusMessage('Please enter a question for the AI model.');
      return;
    }

    if (!instance || !address) {
      setStatusMessage('Encryption service is not ready yet.');
      return;
    }

    const signer = await signerPromise;
    if (!signer) {
      setStatusMessage('Please connect your wallet to submit.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Encrypting message and preparing transaction...');

    try {
      const randomAddress = ethers.Wallet.createRandom().address;
      const encryptedMessage = encryptWithAddress(question.trim(), randomAddress);

      const encryptedInput = await instance
        .createEncryptedInput(CONTRACT_ADDRESS, address)
        .addAddress(randomAddress)
        .encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.submitMessage(
        encryptedMessage,
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        selectedModel,
      );

      setStatusMessage('Waiting for transaction confirmation...');
      await tx.wait();

      setDecryptCache((prev) => ({ ...prev, [encryptedInput.handles[0]]: randomAddress }));
      setQuestion('');
      setStatusMessage('Message submitted successfully.');
      await refreshMessages();
    } catch (error) {
      console.error('Failed to submit message', error);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to submit message');
    } finally {
      setIsSubmitting(false);
    }
  }, [address, instance, question, refreshMessages, selectedModel, signerPromise]);

  const requestResponse = useCallback(async (message: MessageItem) => {
    if (!instance || !address) {
      setStatusMessage('Encryption service is not ready yet.');
      return;
    }

    const signer = await signerPromise;
    if (!signer) {
      setStatusMessage('Please connect your wallet to request a response.');
      return;
    }

    try {
      setStatusMessage('Requesting AI response...');
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const previewHandle = await contract.requestResponse.staticCall(message.id);
      const tx = await contract.requestResponse(message.id);
      await tx.wait();

      const decrypted = await decryptHandles([previewHandle]);
      const responseKey = decrypted[previewHandle];
      if (!responseKey) {
        throw new Error('Failed to decrypt AI response.');
      }

      const encryptedResponse = encryptWithAddress(RESPONSE_TEXT, responseKey);
      const plain = decryptWithAddress(encryptedResponse, responseKey);

      setResponses((prev) => ({
        ...prev,
        [Number(message.id)]: {
          key: responseKey,
          encrypted: encryptedResponse,
          plain,
        },
      }));

      setStatusMessage('AI response unlocked.');
    } catch (error) {
      console.error('Failed to request AI response', error);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to request AI response');
    }
  }, [address, decryptHandles, instance, signerPromise]);

  const isBusy = zamaLoading || loadingMessages || isSubmitting || isDecrypting;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Zama Encrypted AI</h1>
          <p className="app-subtitle">Send confidential prompts and unlock homomorphic AI responses.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      {zamaError ? (
        <div className="status-box error">{zamaError}</div>
      ) : null}

      <section className="composer-card">
        <div className="card-header">
          <h2>1. Compose your encrypted question</h2>
          <span className="model-label">Selected model: {resolvedModelLabel}</span>
        </div>

        <label className="input-label" htmlFor="ai-question">Prompt</label>
        <textarea
          id="ai-question"
          className="text-area"
          placeholder="Ask the AI anything. We will encrypt it before sending."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
        />

        <label className="input-label" htmlFor="ai-model">AI model</label>
        <select
          id="ai-model"
          className="select-input"
          value={selectedModel}
          onChange={(event) => setSelectedModel(Number(event.target.value))}
        >
          {AI_MODELS.map((model) => (
            <option key={model.id} value={model.id}>{model.label}</option>
          ))}
        </select>

        <button
          type="button"
          className="primary-button"
          onClick={submitMessage}
          disabled={!isConnected || isSubmitting || zamaLoading}
        >
          {!isConnected ? 'Connect wallet to send' : isSubmitting ? 'Submitting...' : 'Encrypt & Send'}
        </button>
      </section>

      <section className="messages-card">
        <div className="card-header">
          <h2>2. Your encrypted conversations</h2>
          {isBusy ? <span className="loading-label">Syncing...</span> : null}
        </div>

        {!messages.length ? (
          <p className="empty-state">No questions yet. Submit your first encrypted AI request above.</p>
        ) : (
          <ul className="message-list">
            {messages.map((message) => {
              const responseData = responses[Number(message.id)];
              const model = AI_MODELS.find((item) => item.id === message.modelId);
              return (
                <li key={message.id.toString()} className="message-item">
                  <div className="message-metadata">
                    <span className="message-id">Message #{message.id.toString()}</span>
                    <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                    <span className="message-model">Model: {model?.label ?? `#${message.modelId}`}</span>
                  </div>

                  <div className="message-body">
                    <div>
                      <p className="message-label">Encrypted prompt</p>
                      <code className="cipher-text">{message.encryptedMessage}</code>
                    </div>
                    {message.plainMessage ? (
                      <div>
                        <p className="message-label">Decrypted prompt</p>
                        <p className="plain-text">{message.plainMessage}</p>
                      </div>
                    ) : (
                      <p className="hint-text">Decrypting question with your private key...</p>
                    )}
                  </div>

                  <div className="response-section">
                    {responseData ? (
                      <div>
                        <p className="message-label">Encrypted AI response</p>
                        <code className="cipher-text">{responseData.encrypted}</code>
                        <p className="message-label">Decrypted AI response</p>
                        <p className="plain-text">{responseData.plain}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => requestResponse(message)}
                        disabled={!isConnected || zamaLoading}
                      >
                        Unlock AI response
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {statusMessage ? (
        <div className="status-box info">{statusMessage}</div>
      ) : null}
    </div>
  );
}
