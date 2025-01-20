"use client";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { useState } from "react";

const sendPayment = async (wldAmount: number, usdcAmount: number) => {
  try {
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
    });

    const { id } = await res.json();

    const payload: PayCommandInput = {
      reference: id,
      to: "0x512e4a7dda6b13f917d89fa782bdd7666dab1599", // Test address
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(wldAmount, Tokens.WLD).toString(),
        },
        {
          symbol: Tokens.USDCE,
          token_amount: tokenToDecimals(usdcAmount, Tokens.USDCE).toString(),
        },
      ],
      description: "Watch this is a test",
    };
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error: unknown) {
    console.log("Error sending payment", error);
    return null;
  }
};

const handlePay = async (wldAmount: number, usdcAmount: number) => {
  if (!MiniKit.isInstalled()) {
    console.error("MiniKit is not installed");
    return;
  }
  const sendPaymentResponse = await sendPayment(wldAmount, usdcAmount);
  const response = sendPaymentResponse?.finalPayload;
  if (!response) {
    return;
  }

  if (response.status == "success") {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: response }),
    });
    const payment = await res.json();
    if (payment.success) {
      console.log("SUCCESS!");
    } else {
      console.log("FAILED!");
    }
  }
};

export const PayBlock = () => {
  const [wldAmount, setWldAmount] = useState<number>(0.5);
  const [usdcAmount, setUsdcAmount] = useState<number>(0.1);

  return (
    <div>
      <div>
        <label htmlFor="wldAmount">WLD Amount:</label>
        <input
          type="number"
          id="wldAmount"
          value={wldAmount}
          onChange={(e) => setWldAmount(Number(e.target.value))}
          min="0"
        />
      </div>
      <div>
        <label htmlFor="usdcAmount">USDCE Amount:</label>
        <input
          type="number"
          id="usdcAmount"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(Number(e.target.value))}
          min="0"
        />
      </div>
      <button
        className="bg-blue-500 p-4"
        onClick={() => handlePay(wldAmount, usdcAmount)}
      >
        Pay
      </button>
    </div>
  );
};
