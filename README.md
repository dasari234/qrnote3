

## Payments (Razorpay)

This project supports one-time purchases via Razorpay (for plans / cart). The implementation uses server-side Razorpay orders, client-side checkout, and server-side signature verification.

1) Install dependency
```bash
npm install razorpay
```

2) Environment variables (add to your .env.local / Vercel)
```
RAZORPAY_KEY_ID=            # server key id (used on server for SDK as well)
RAZORPAY_KEY_SECRET=        # server secret (never expose to client)
NEXT_PUBLIC_RAZORPAY_KEY_ID=# public key id for client-side checkout
RAZORPAY_WEBHOOK_SECRET=    # webhook secret (optional, for webhook verification)
```

3) Prisma
- The repository includes new Prisma models (Plan, Order, Payment). Run:
```bash
npx prisma generate
npx prisma migrate dev --name add_payments
```
- You can seed plans using a simple script or the Prisma Studio.

Example seed snippet (create prisma/seed.ts):
```ts
import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.plan.createMany({
    data: [
      { name: "Basic", price: 5000, description: "One-off Basic plan" },
      { name: "Pro", price: 15000, description: "Pro plan" },
    ],
  });
}

main().catch(console.error).finally(() => process.exit(0));
```

4) How checkout works
- Client calls POST /api/razorpay/create-order with items (plan ids).
- Server creates a local Order and a Razorpay order, returns Razorpay order id.
- Client loads Razorpay Checkout and opens it.
- On success, checkout handler posts payment ids to /api/razorpay/verify which verifies the signature and marks the Order paid.
- A webhook endpoint /api/razorpay/webhook is included to handle asynchronous events (payment.captured, payment.failed).

5) Test locally
- Use Razorpay test keys from Razorpay dashboard.
- For testing webhooks locally use an HTTP tunnel (ngrok) and configure a webhook endpoint in Razorpay dashboard pointing to https://{your-tunnel}/api/razorpay/webhook with the webhook secret.
