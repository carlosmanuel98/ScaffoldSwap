"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Approve: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [approveStatus, setApproveStatus] = useState("");
  // Usamos dos instancias de useScaffoldWriteContract para cada token
  const { writeContractAsync: writeTokenA } = useScaffoldWriteContract("TokenA");
  const { writeContractAsync: writeTokenB } = useScaffoldWriteContract("TokenB");

  // Función para manejar el cambio de valor en el input de la cantidad de Token A
  const handleAmountChangeA = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountA(e.target.value);
  };

  // Función para manejar el cambio de valor en el input de la cantidad de Token B
  const handleAmountChangeB = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountB(e.target.value);
  };

  // Función para aprobar el gasto de tokens
  const handleApprove = async (token: string, amount: string) => {
    if (!amount) {
      // setApproveStatus(`Please fill in the amount for ${token}.`);
      return;
    }

    try {
      // alert(amount);
      const approveTx = token === "TokenA"
      ? await writeTokenA({
          functionName: "approve",
          args: [simpleDexAddress, amount],
        })
      : await writeTokenB({
          functionName: "approve",
          args: [simpleDexAddress, amount],
        });
      await approveTx.wait();
      setApproveStatus(`Approved ${amount} ${token} for spending`);
    } catch (error) {
      console.error(error);
    }
  };


  const { data: simpleDexData } = useDeployedContractInfo("SimpleDex");

  const simpleDexAddress = simpleDexData?.address;

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
    {/* Sección de aprobación para Token A */}
      <div className="my-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl mb-4 text-center">Approve TokenA</h2>

        <div className="bg-base-100 p-6 rounded-lg shadow-md space-y-4">
          {/* Input de cantidad para aprobar TokenA */}
          <div>
            <label className="block text-lg font-medium mb-2">Amount of Token A</label>
            <input
              type="number"
              value={amountA}
              onChange={handleAmountChangeA}
              className="input input-bordered w-full"
              placeholder="Enter amount"
            />
          </div>

          {/* Botón de approve para Token A */}
          <div className="mt-4 text-center">
            <button
              onClick={() => handleApprove("TokenA", amountA)}
              className="btn btn-primary w-full"
            >
              Approve TokenA
            </button>
          </div>

          {/* Mensaje de estado de aprobación */}
          {approveStatus && (
            <div className="mt-4 text-center">
              <p className="text-lg text-green-500">{approveStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección de aprobación para Token B */}
      <div className="my-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl mb-4 text-center">Approve TokenB</h2>

        <div className="bg-base-100 p-6 rounded-lg shadow-md space-y-4">
          {/* Input de cantidad para aprobar TokenB */}
          <div>
            <label className="block text-lg font-medium mb-2">Amount of Token B</label>
            <input
              type="number"
              value={amountB}
              onChange={handleAmountChangeB}
              className="input input-bordered w-full"
              placeholder="Enter amount"
            />
          </div>

          {/* Botón de approve para Token B */}
          <div className="mt-4 text-center">
            <button
              onClick={() => handleApprove("TokenB", amountB)}
              className="btn btn-primary w-full"
            >
              Approve TokenB
            </button>
          </div>

          {/* Mensaje de estado de aprobación */}
          {approveStatus && (
            <div className="mt-4 text-center">
              <p className="text-lg text-green-500">{approveStatus}</p>
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

export default Approve;
