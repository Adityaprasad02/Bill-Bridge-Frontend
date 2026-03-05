import { PAYTM_CONFIG } from "../../utils/constants";

/**
 * Launch the Paytm checkout overlay.
 * @param {object} paymentData - { orderId, txnToken (from body.txnToken), amount }
 * @param {Function} onSuccess - called with Paytm transactionStatus data
 */
export const startPaytmCheckout = (paymentData, onSuccess) => {
  const script = document.createElement("script");
  script.src = `https://securestage.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${PAYTM_CONFIG.MID}.js`;
  script.crossOrigin = "anonymous";

  script.onload = () => {
    const config = {
      root: "",
      flow: "DEFAULT",
      data: {
        orderId: paymentData.orderId,
        token: paymentData.txnToken,
        tokenType: "TXN_TOKEN",
        amount: paymentData.amount,
      },
      merchant: {
        mid: PAYTM_CONFIG.MID,
        redirect: false,
      },
      handler: {
        notifyMerchant(eventName, data) {
          console.log("notifyMerchant:", eventName, data);
        },
        transactionStatus(data) {
          console.log("transactionStatus:", data);
          onSuccess(data);
          window.Paytm.CheckoutJS.close();
        },
      },
    };

    if (window.Paytm?.CheckoutJS) {
      window.Paytm.CheckoutJS.onLoad(() => {
        window.Paytm.CheckoutJS.init(config)
          .then(() => window.Paytm.CheckoutJS.invoke())
          .catch((err) => console.error("Paytm init error:", err));
      });
    }
  };

  document.body.appendChild(script);
};