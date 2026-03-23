import { contractAddress, abi, chainId } from "./config.js";

const statusEl = document.querySelector("#status");
const mintButton = document.querySelector("#mintButton");

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

async function getProviderSignerContract() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask non détecté");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== 11155111) {
    throw new Error("Mauvais réseau");
  }

  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  return { provider, signer, contract };
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    setStatus("Wallet non connecté");
    throw new Error("MetaMask non détecté");
  }
  // demande la connexion à MetaMask
  await window.ethereum.request({ method: "eth_requestAccounts" });
  setStatus("Wallet connecté");
}

async function mintNFT() {
  try {
    setStatus("Transaction en cours");

    // Assure connexion et réseau
    await connectWallet();
    const { contract } = await getProviderSignerContract();

    // Appel fonction mint du contrat
    const tx = await contract.mint();
    await tx.wait();

    setStatus("Mint réussi");
  } catch (err) {
    const errorMessage =
      err instanceof Error && err.message ? err.message : "Erreur inconnue";
    if (err && err.message === "Mauvais réseau") {
      setStatus("Mauvais réseau");
    } else if (err && err.message === "MetaMask non détecté") {
      setStatus("Wallet non connecté");
    } else {
      setStatus("Erreur : " + errorMessage);
    }
    console.error(err);
  }
}

if (mintButton) {
  mintButton.addEventListener("click", (event) => {
    event.preventDefault();
    mintNFT();
  });
}

// Optionnel : détecte changement de réseau et met à jour
if (window.ethereum) {
  window.ethereum.on("chainChanged", (chainHex) => {
    const chainIdNum = Number(chainHex);
    if (chainIdNum !== 11155111) {
      setStatus("Mauvais réseau");
    } else {
      setStatus("Sepolia détecté");
    }
  });
}
