import { Address } from "ton-core";
import { useJettonContract } from "../hooks/useJettonContract";
import { useTonConnect } from "../hooks/useTonConnect";
import {
  Card,
  FlexBoxCol,
  FlexBoxRow,
  Button,
  Ellipsis,
} from "./styled/styled";
import { useEffect, useState } from "react";

export function Jetton() {
  const { connected, wallet } = useTonConnect();
  const { sleep, jettonWalletAddress, balance, mint } = useJettonContract();
  const [isSend, setIsSend] = useState(false);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    async function fun() {
      if (!isSend && Number(balance) > 0) {
        console.log("POINT");
        await sleep(2000);
        const error = await mint();
        setIsSend(true);
        if (error) {
          setIsError(true);
        } else {
          setIsError(false);
        }
      }
    }
    fun();
  }, [mint]);

  return (
    <Card title="Jetton">
      <FlexBoxCol>
        <h3>Jetton</h3>
        {/* <FlexBoxRow>
          Wallet
          <Ellipsis>
            {wallet ? Address.parse(wallet as string).toString() : "Loading..."}
          </Ellipsis>
        </FlexBoxRow>
        <FlexBoxRow>
          Jetton Wallet
          <Ellipsis>
            {jettonWalletAddress ? jettonWalletAddress : "Loading..."}
          </Ellipsis>
        </FlexBoxRow> */}
        {/* <FlexBoxRow>
          Balance
          <div>{balance ?? "Loading..."}</div>
        </FlexBoxRow> */}
        {/* <Button disabled={!connected} onClick={mint}>
          Mint jettons
        </Button> */}
        {isError && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "red",
              color: "white",
              width: "200px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            Not enough funds in your wallet
          </div>
        )}
      </FlexBoxCol>
    </Card>
  );
}
