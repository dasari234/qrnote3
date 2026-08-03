// Server-side Razorpay client wrapper
import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Razorpay calls will fail in server environments without these."
  );
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
