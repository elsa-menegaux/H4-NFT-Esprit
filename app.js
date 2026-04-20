import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { contractAddress, abi, chainId } from "./config.js";

const statusEl = document.querySelector("#status");
const mintButton = document.querySelector("#mintButton");
const passwordGate = document.querySelector("#passwordGate");
const passwordInput = document.querySelector("#passwordInput");
const unlockButton = document.querySelector("#unlockButton");
const correctPassword = "01234567890";

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

async function getProviderSignerContract() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask non détecté");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(chainId)) {
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
    setStatus("Connexion du wallet...");

    // Assure connexion et réseau
    await connectWallet();
    setStatus("Processus en cours...");

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

if (unlockButton && passwordInput && passwordGate && mintButton) {
  unlockButton.addEventListener("click", () => {
    const password = passwordInput.value.trim();
    if (password === correctPassword) {
      passwordGate.style.display = "none";
      mintButton.style.display = "inline-block";
      setStatus("Mot de passe correct. Vous pouvez maintenant mint.");
      passwordInput.value = "";
    } else {
      setStatus("Mot de passe incorrect.");
    }
  });

  passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      unlockButton.click();
    }
  });
}

if (mintButton) {
  mintButton.addEventListener("click", (event) => {
    event.preventDefault();
    mintNFT();
  });
}
