"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const RemoveLiquidity: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Estados para los valores de removeLiquidity
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [removeLiquidityStatus, setRemoveLiquidityStatus] = useState("");
  const { writeContractAsync: removeLiquidityAsync } = useScaffoldWriteContract("SimpleDex"); // Reemplazar con el nombre correcto de tu contrato de AMM

  // Tokens fijos (predefinidos en el contrato)
  const tokenA = "Token A";
  const tokenB = "Token B";

  // Función para manejar el cambio de valor en el input de cantidad para Token A
  const handleAmountAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountA(e.target.value);
  };

  // Función para manejar el cambio de valor en el input de cantidad para Token B
  const handleAmountBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountB(e.target.value);
  };

  // Función para manejar la acción de removeLiquidity (simulada)
  const handleRemoveLiquidity = async () => {
    if (!amountA || !amountB) {
      setRemoveLiquidityStatus("Please fill in both amounts.");
      return;
    }

    const liquidityTx = await removeLiquidityAsync({
      functionName: "removeLiquidity",
      args: [amountA, amountB], // Las cantidades que quieres agregar
    });

    await liquidityTx.wait();

    // Aquí iría la lógica para retirar liquidez entre los tokens (simulada)
    setRemoveLiquidityStatus(`Removed ${amountA} of ${tokenA} and ${amountB} of ${tokenB} from liquidity.`);
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {/* Sección de Remover Liquidez */}
      <div className="my-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl mb-4 text-center">Remove Liquidity</h2>

        <div className="bg-base-100 p-6 rounded-lg shadow-md space-y-4">
          {/* Input de cantidad para Token A */}
          <div>
            <label className="block text-lg font-medium mb-2">{`Amount of ${tokenA}`}</label>
            <input
              type="number"
              value={amountA}
              onChange={handleAmountAChange}
              className="input input-bordered w-full"
              placeholder={`Enter amount of ${tokenA}`}
            />
          </div>

          {/* Input de cantidad para Token B */}
          <div>
            <label className="block text-lg font-medium mb-2">{`Amount of ${tokenB}`}</label>
            <input
              type="number"
              value={amountB}
              onChange={handleAmountBChange}
              className="input input-bordered w-full"
              placeholder={`Enter amount of ${tokenB}`}
            />
          </div>

          {/* Botón de removeLiquidity */}
          <div className="mt-4 text-center">
            <button
              onClick={handleRemoveLiquidity}
              className="btn btn-primary w-full"
            >
              Remove Liquidity
            </button>
          </div>

          {/* Mensaje de estado */}
          {removeLiquidityStatus && (
            <div className="mt-4 text-center">
              <p className="text-lg text-green-500">{removeLiquidityStatus}</p>
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

export default RemoveLiquidity;
