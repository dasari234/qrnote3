const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding plans and coupons...');

  // Plans (price in paise)
  const plans = [
    { name: 'Basic', price: 5000, currency: 'INR', description: 'One-off Basic plan' },
    { name: 'Pro', price: 15000, currency: 'INR', description: 'Pro plan' },
    { name: 'Enterprise', price: 50000, currency: 'INR', description: 'Enterprise plan' },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { name: p.name },
      update: { price: p.price, description: p.description, currency: p.currency },
      create: p,
    });
    console.log(`Upserted plan: ${p.name}`);
  }

  // Coupons
  const now = new Date();
  const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const coupons = [
    {
      code: 'SUMMER20',
      type: 'percentage',
      amount: 20, // 20%
      usageLimit: 100,
      usedCount: 0,
      validFrom: now,
      validUntil: in90,
      active: true,
    },
    {
      code: 'WELCOME100',
      type: 'fixed',
      amount: 1000, // ₹10.00 in paise
      usageLimit: 1000,
      usedCount: 0,
      validFrom: now,
      validUntil: in90,
      active: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        type: c.type,
        amount: c.amount,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
        validFrom: c.validFrom,
        validUntil: c.validUntil,
        active: c.active,
      },
      create: c,
    });
    console.log(`Upserted coupon: ${c.code}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
