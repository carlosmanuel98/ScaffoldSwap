"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, Balance } from "~~/components/scaffold-eth";
import Link from "next/link";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Swap: NextPage = () => {

  const { address: connectedAddress } = useAccount();

  // Estados para los contratos y valores de swap
  const [contractA, setContractA] = useState("TokenA");
  const [contractB, setContractB] = useState("TokenB");
  const [amount, setAmount] = useState("");
  const [swapStatus, setSwapStatus] = useState("");
  const { writeContractAsync: Swapped } = useScaffoldWriteContract("SimpleDex");

  // Función para manejar el cambio de valor en el input de la cantidad
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // Función para manejar el swap (esto es solo un mockup)
  const handleSwap = async () => {
    if (!amount || !contractA || !contractB) {
      setSwapStatus("Please fill in all fields.");
      return;
    }
    // alert(contractA);
    // alert(contractB);
      // Detectamos cuál es el token A y cuál es el token B
      if (contractA === "TokenA" && contractB === "TokenB") {
        // Si se selecciona TokenA para hacer swap a TokenB
        await Swapped({
          functionName: "swapAforB",  // Llamamos la función para hacer swap de A por B
          args: [amount], // Parametrizamos la cantidad y la dirección del usuario
        });
        setSwapStatus(`Swapped ${amount} ${contractA} for ${contractB}`);
      } else if (contractA === "TokenB" && contractB === "TokenA") {
        // Si se selecciona TokenB para hacer swap a TokenA
        await Swapped({
          functionName: "swapBforA",  // Llamamos la función para hacer swap de B por A
          args: [amount], // Parametrizamos la cantidad y la dirección del usuario
        });
        setSwapStatus(`Swapped ${amount} ${contractA} for ${contractB}`);
      } else {
        setSwapStatus("Invalid contract selection.");
      }
    // Aquí iría la lógica para hacer el swap entre los contratos (simulado)
    setSwapStatus(`Swapped ${amount} ${contractA} for ${contractB}`);
  };

  // Actualizar contractB automáticamente cuando contractA cambie, y viceversa
  useEffect(() => {
    if (contractA === "TokenA") {
      setContractB("TokenB");
    } else if (contractA === "TokenB") {
      setContractB("TokenA");
    }
  }, [contractA]);

  useEffect(() => {
    if (contractB === "TokenA") {
      setContractA("TokenB");
    } else if (contractB === "TokenB") {
      setContractA("TokenA");
    }
  }, [contractB]);

   // Fetch the deployed contract info for TokenA
   const { data: tokenAData } = useDeployedContractInfo("TokenA");

   // Fetch the deployed contract info for TokenB
   const { data: tokenBData } = useDeployedContractInfo("TokenB");
 
   // Fetch the deployed contract info for SimpleDex
   const { data: simpleDexData } = useDeployedContractInfo("SimpleDex");
 
   // Extract addresses for each contract
   const tokenAAddress = tokenAData?.address;
   const tokenBAddress = tokenBData?.address;
   const simpleDexAddress = simpleDexData?.address;

   const { data: tokenAPrice } = useScaffoldReadContract({
    contractName: "SimpleDex",
    functionName: "getPrice",
    args: [tokenAAddress],
  });
   const { data: tokenBPrice } = useScaffoldReadContract({
    contractName: "SimpleDex",
    functionName: "getPrice",
    args: [tokenBAddress],
  });
  
  return (   
    
    <div className="flex items-center flex-col flex-grow pt-10">
    
      {/* Sección de Intercambio */}
      <div className="my-6 w-full max-w-md mx-auto">

      {/* Card para precios de los tokens */}
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <p className="text-lg font-medium mb-2">Price of Token A:</p>
        <p className="text-xl font-semibold text-green-500">{tokenAPrice ? `${tokenAPrice} TKB` : "0 TKB"}</p>

        <p className="text-lg font-medium mb-2 mt-4">Price of Token B:</p>
        <p className="text-xl font-semibold text-blue-500">{tokenBPrice ? `${tokenBPrice} TKA` : "0 TKA"}</p>
      </div>
      <h2 className="text-2xl mb-6 text-center font-semibold text-white-800">Swap Tokens</h2>

        <div className="bg-base-100 p-6 rounded-lg shadow-md space-y-4">
          {/* Select para contrato A */}
          <div>
            <label className="block text-lg font-medium mb-2">From Token</label>
            <select
              className="select select-bordered w-full"
              value={contractA}
              onChange={(e) => setContractA(e.target.value)}
            >
              <option value="TokenA">Token A: {tokenAAddress}</option>
              <option value="TokenB">Token B: {tokenBAddress}</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="input input-bordered w-full"
              placeholder="Enter amount"
            />
          </div>

          {/* Select para contrato B */}
          <div>
            <label className="block text-lg font-medium mb-2">To Token</label>
            <select
              className="select select-bordered w-full"
              value={contractB}
              onChange={(e) => setContractB(e.target.value)}
            >
              <option value="TokenA">Token A: {tokenAAddress}</option>
              <option value="TokenB">Token B: {tokenBAddress}</option>
            </select>
          </div>

          {/* Botón de swap */}
          <div className="mt-4 text-center">
            <button
              onClick={handleSwap}
              className="btn btn-primary w-full"
            >
              Swap
            </button>
          </div>

          {/* Mensaje de estado */}
          {swapStatus && (
            <div className="mt-4 text-center">
              <p className="text-lg text-green-500">{swapStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección informativa */}
      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <BugAntIcon className="h-8 w-8 fill-secondary" />
            <p>
              Tinker with your smart contract using the{" "}
              <Link href="/debug" passHref className="link">
                Debug Contracts
              </Link>{" "}
              tab.
            </p>
          </div>
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
            <p>
              Explore your local transactions with the{" "}
              <Link href="/blockexplorer" passHref className="link">
                Block Explorer
              </Link>{" "}
              tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
